// 결제 게이팅 5번: Google Play 구매 영수증(purchase token) 서버 검증.
// 클라이언트(app.js, Play Billing으로 구매 완료 후)가 purchaseToken을 보내면,
// 서버가 전용 서비스 계정(play-billing-verifier)으로 Google Play Developer API를 호출해
// 실제 유효한 구매인지 확인한 뒤 Firestore users/{uid}.purchased를 true로 기록한다.

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');

const playServiceAccountKey = defineSecret('PLAY_SERVICE_ACCOUNT_KEY');

const PACKAGE_NAME = 'com.chloeparklabs.tuktak';
const PRODUCT_ID = 'tuk_tak_premium_bundle';
const ANDROID_PUBLISHER_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

async function getAndroidPublisherClient() {
  const credentials = JSON.parse(playServiceAccountKey.value());
  const auth = new GoogleAuth({ credentials, scopes: [ANDROID_PUBLISHER_SCOPE] });
  return auth.getClient();
}

exports.verifyPurchase = onRequest(
  { region: 'asia-northeast3', secrets: [playServiceAccountKey] },
  async (req, res) => {
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
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch (err) {
      console.error('토큰 검증 실패:', err.message);
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
  }
);
