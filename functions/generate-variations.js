// 15-2 유료판: 문장 변형 자동 생성 — Cloud Functions 2세대판
// api/generate-variations.js(Vercel)를 그대로 포팅. 역할·한도 로직·응답 계약은 완전히 동일하고,
// 바뀐 건 실행 플랫폼뿐 — 자세한 설계 배경 주석은 원본 파일 참고.
//
// Vercel판은 FIREBASE_SERVICE_ACCOUNT_KEY(서비스계정 JSON)로 Admin SDK를 인증했지만,
// Cloud Functions는 같은 Firebase 프로젝트 안에서 실행되므로 initializeApp()만 호출하면
// 함수의 기본 서비스계정으로 자동 인증된다 — 그 환경변수는 이 이전으로 완전히 불필요해짐.
// ANTHROPIC_API_KEY만 Secret Manager로 주입받는다.

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

const AI_VARIATION_LIMIT = 100;

const AI_VARIATION_SYSTEM_PROMPT = '당신은 한국어-영어 문장 변형을 만드는 전문가입니다. 사용자 메시지에 담긴 원문과 요청 사항, 예외 규칙에 따라 자연스러운 변형 문장들을 만드세요. 반드시 submit_variations 도구를 호출해서만 답하고, 그 외의 설명이나 텍스트는 절대 덧붙이지 마세요.';

const AI_VARIATION_LABELS = ['현재시제', '과거시제', '미래시제', '현재완료시제', '2인칭', '3인칭 단수', '복수', '부정문', '의문문'];

const AI_VARIATION_TOOL = {
  name: 'submit_variations',
  description: '변형된 한국어-영어 문장 쌍 목록을 제출한다.',
  input_schema: {
    type: 'object',
    properties: {
      variations: {
        type: 'array',
        description: '자연스러운 변형 문장 목록',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string', enum: AI_VARIATION_LABELS, description: '이 변형이 해당하는 카테고리' },
            kr: { type: 'string', description: '변형된 한국어 문장' },
            en: { type: 'string', description: '변형된 영어 문장' },
          },
          required: ['label', 'kr', 'en'],
        },
      },
    },
    required: ['variations'],
  },
};

exports.generateVariations = onRequest(
  { region: 'asia-northeast3', secrets: [anthropicApiKey] },
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

    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) {
      res.status(400).json({ error: '프롬프트가 비어 있습니다.' });
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

    const userDocRef = getFirestore().collection('users').doc(uid);

    let countBeforeCall;
    try {
      const snap = await userDocRef.get();
      countBeforeCall = snap.exists ? snap.data().aiVariationCount || 0 : 0;
      if (countBeforeCall >= AI_VARIATION_LIMIT) {
        res.status(403).json({ error: `AI 자동변형은 평생 ${AI_VARIATION_LIMIT}개까지 이용할 수 있어요. 이미 한도를 모두 사용했습니다.` });
        return;
      }
    } catch (err) {
      console.error('사용량 확인 실패:', err.message);
      res.status(500).json({ error: '사용량을 확인하는 중 오류가 발생했습니다.' });
      return;
    }

    let resultText;
    let validVariations = [];
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': anthropicApiKey.value(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 4096,
          system: AI_VARIATION_SYSTEM_PROMPT,
          tools: [AI_VARIATION_TOOL],
          tool_choice: { type: 'tool', name: 'submit_variations' },
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('Anthropic API error:', response.status, errBody);
        res.status(502).json({ error: 'AI 변형 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
        return;
      }

      const data = await response.json();
      const toolUseBlock = (data.content || []).find(
        (block) => block.type === 'tool_use' && block.name === 'submit_variations'
      );
      const rawVariations = Array.isArray(toolUseBlock?.input?.variations) ? toolUseBlock.input.variations : [];
      validVariations = rawVariations.filter(
        (v) => v && typeof v.kr === 'string' && typeof v.en === 'string' && v.kr.trim() && v.en.trim()
      );
      resultText = validVariations.map((v) => `${v.kr.trim()}\t${v.en.trim()}`).join('\n');
    } catch (err) {
      console.error('Anthropic API 호출 실패:', err);
      res.status(502).json({ error: 'AI 변형 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
      return;
    }

    let remaining;
    if (validVariations.length === 0) {
      remaining = AI_VARIATION_LIMIT - countBeforeCall;
    } else {
      try {
        remaining = await getFirestore().runTransaction(async (tx) => {
          const snap = await tx.get(userDocRef);
          const currentCount = snap.exists ? snap.data().aiVariationCount || 0 : 0;
          const nextCount = currentCount + 1;
          tx.set(userDocRef, { aiVariationCount: nextCount }, { merge: true });
          return AI_VARIATION_LIMIT - nextCount;
        });
      } catch (err) {
        console.error('사용량 기록 실패:', err.message);
        remaining = null;
      }
    }

    res.status(200).json({ text: resultText, remaining, limit: AI_VARIATION_LIMIT });
  }
);
