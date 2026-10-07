// 15-2 유료판: 현재 AI 자동변형 사용량 조회 — Cloud Functions 2세대판
// api/ai-variation-usage.js(Vercel)를 그대로 포팅(Claude API 호출 없음, Firestore 읽기 1회뿐).

const { onRequest } = require('firebase-functions/v2/https');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const AI_VARIATION_LIMIT = 100;

exports.aiVariationUsage = onRequest({ region: 'asia-northeast3' }, async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  if (!idToken) {
    res.status(401).json({ error: '로그인이 필요합니다.' });
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

  try {
    const snap = await getFirestore().collection('users').doc(uid).get();
    const used = snap.exists ? snap.data().aiVariationCount || 0 : 0;
    res.status(200).json({ used, remaining: AI_VARIATION_LIMIT - used, limit: AI_VARIATION_LIMIT });
  } catch (err) {
    console.error('사용량 조회 실패:', err.message);
    res.status(500).json({ error: '사용량을 확인하는 중 오류가 발생했습니다.' });
  }
});
