// 결제 게이팅 5번: Google Play 구매 영수증(purchase token) 서버 검증 — Vercel 서버리스판.
// functions/verify-purchase.js(Cloud Functions)를 그대로 포팅. 역할·응답 계약은 완전히 동일하고
// 바뀐 건 실행 플랫폼뿐 — Firebase Admin 인증 방식만 기존 Vercel판 패턴(FIREBASE_SERVICE_ACCOUNT_KEY)을 따른다.
// Play Developer API 인증용 서비스계정 키는 PLAY_SERVICE_ACCOUNT_KEY 환경변수로 별도 주입받는다
// (Firebase Admin용 서비스계정과는 다른 전용 계정 — play-billing-verifier, 최소 권한 원칙).

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');

const PACKAGE_NAME = 'com.chloeparklabs.tuktak';
const PRODUCT_ID = 'tuk_tak_premium_bundle';
const ANDROID_PUBLISHER_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

function initFirebaseAdmin() {
  if (getApps().length > 0) return;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({ credential: cert(serviceAccount) });
}

async function getAndroidPublisherClient() {
  const credentials = JSON.parse(process.env.PLAY_SERVICE_ACCOUNT_KEY);
  const auth = new GoogleAuth({ credentials, scopes: [ANDROID_PUBLISHER_SCOPE] });
  return auth.getClient();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  if (!idToken) {
    res.status(401).json({ error: '로그인이 필요합니다.' });
    return;
  }

  const purchaseToken = typeof req.body?.purchaseToken === 'string' ? req.body.purchaseToken.trim() : '';
  if (!purchaseToken) {
    res.status(400).json({ error: '구매 정보가 비어 있습니다.' });
    return;
  }

  let uid;
  try {
    initFirebaseAdmin();
    const decoded = await getAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (err) {
    console.error('토큰 검증/Firebase Admin 초기화 실패:', err.message);
    res.status(401).json({ error: '로그인 정보가 유효하지 않습니다.' });
    return;
  }

  // 같은 구매 토큰이 다른 계정에 이미 귀속돼 있으면 거부(구매 1건당 계정 1개로 고정).
  const purchaseDocRef = getFirestore().collection('purchases').doc(purchaseToken);
  try {
    const purchaseSnap = await purchaseDocRef.get();
    if (purchaseSnap.exists && purchaseSnap.data().uid !== uid) {
      res.status(409).json({ error: '이미 다른 계정에서 사용된 구매 정보입니다.' });
      return;
    }
  } catch (err) {
    console.error('구매 토큰 중복 확인 실패:', err.message);
    res.status(500).json({ error: '구매 확인 중 오류가 발생했습니다.' });
    return;
  }

  let purchase;
  try {
    const client = await getAndroidPublisherClient();
    const getUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/products/${PRODUCT_ID}/tokens/${encodeURIComponent(purchaseToken)}`;
    const response = await client.request({ url: getUrl });
    purchase = response.data;
  } catch (err) {
    console.error('Play Developer API 조회 실패:', err.message);
    res.status(400).json({ error: '유효하지 않은 구매 정보입니다.' });
    return;
  }

  if (purchase.purchaseState !== 0) {
    res.status(400).json({ error: '구매가 완료되지 않았거나 취소된 상태입니다.' });
    return;
  }

  if (purchase.acknowledgementState === 0) {
    try {
      const client = await getAndroidPublisherClient();
      const ackUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/products/${PRODUCT_ID}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;
      await client.request({ url: ackUrl, method: 'POST', data: {} });
    } catch (err) {
      // 승인 실패는 치명적이지 않음(이미 승인됐거나 일시적 오류) — 구매 자체는 유효하므로 계속 진행.
      console.error('구매 승인(acknowledge) 실패:', err.message);
    }
  }

  try {
    await purchaseDocRef.set({ uid, productId: PRODUCT_ID, verifiedAt: new Date().toISOString() });
    await getFirestore().collection('users').doc(uid).set({ purchased: true }, { merge: true });
  } catch (err) {
    console.error('구매 플래그 기록 실패:', err.message);
    res.status(500).json({ error: '구매 확인 중 오류가 발생했습니다.' });
    return;
  }

  res.status(200).json({ purchased: true });
};
