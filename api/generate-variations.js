// 15-2 유료판: 문장 변형 자동 생성 서버리스 함수
// 역할은 "프롬프트를 받아 Claude API에 전달하고 결과 텍스트만 돌려주는" 얇은 중계뿐 —
// 프롬프트 생성(buildAiVariationPrompt)과 결과 파싱(parseSentencesText)은 js/app.js(무료판)의
// 코드를 그대로 재사용하므로 이 서버는 그 형식을 전혀 몰라도 됨.
// Claude 응답 자체는 tool_choice로 강제한 JSON 스키마(AI_VARIATION_TOOL)로 받아 형식 이탈을 막고,
// 서버 내부에서만 그 결과를 "한국어\t영어" 텍스트로 재조립해 클라이언트와의 응답 계약을 그대로 유지한다.
//
// 한도: 평생(누적) 100개, 월별 리셋 없음(CLAUDE.md "무료 / 유료 버전 구분" 참고).
// "요청 1회"가 아니라 "요청 성공 시 1회 차감" — Firestore 트랜잭션으로 확인+차감을 원자적으로 처리해
// 동시 요청으로 한도를 우회하는 경쟁 상태를 방지한다.
//
// firebase-admin v13+는 루트 require가 모듈형 API만 내보내(admin.apps/admin.auth()/admin.firestore()
// 같은 옛 네임스페이스 방식은 존재하지 않음) — firebase-admin/app, /auth, /firestore 서브패스로 가져온다.

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const AI_VARIATION_LIMIT = 100;

// 시스템 프롬프트 분리: "역할/출력 규칙"만 여기서 강제하고, 실제 과제 내용(원문·변형 요청 종류·
// 자연스러움 판단 기준·예외 규칙)은 client의 buildAiVariationPrompt() 결과를 user 메시지로 그대로
// 전달한다(무료판·유료판이 공유하는 프롬프트, js/app.js 참고).
const AI_VARIATION_SYSTEM_PROMPT = '당신은 한국어-영어 문장 변형을 만드는 전문가입니다. 사용자 메시지에 담긴 원문과 요청 사항, 예외 규칙에 따라 자연스러운 변형 문장들을 만드세요. 반드시 submit_variations 도구를 호출해서만 답하고, 그 외의 설명이나 텍스트는 절대 덧붙이지 마세요.';

// user 메시지(buildAiVariationPrompt)의 "변형 요청" 9개 카테고리와 정확히 같은 이름 —
// 각 변형 항목이 어느 카테고리에 해당하는지 명시적으로 답하게 해 카테고리별 판단 규율을 강화한다.
const AI_VARIATION_LABELS = ['현재시제', '과거시제', '미래시제', '현재완료시제', '2인칭', '3인칭 단수', '복수', '부정문', '의문문'];

// JSON 강제: 프롬프트로 "이 형식으로 답해줘"라고 부탁하는 대신, 이 스키마를 만족하는 도구 호출만
// 하도록 API 차원에서 강제 — 코드블록 누락, 구분자 오류 등 형식 이탈 자체를 원천 차단한다.
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

function initFirebaseAdmin() {
  if (getApps().length > 0) return;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({ credential: cert(serviceAccount) });
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

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) {
    res.status(400).json({ error: '프롬프트가 비어 있습니다.' });
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

  const userDocRef = getFirestore().collection('users').doc(uid);

  // 먼저 한도만 확인(트랜잭션 밖) — 이미 초과한 사용자는 비용이 드는 Claude API 호출 자체를 하지 않음
  try {
    const snap = await userDocRef.get();
    const currentCount = snap.exists ? snap.data().aiVariationCount || 0 : 0;
    if (currentCount >= AI_VARIATION_LIMIT) {
      res.status(403).json({ error: `AI 자동변형은 평생 ${AI_VARIATION_LIMIT}개까지 이용할 수 있어요. 이미 한도를 모두 사용했습니다.` });
      return;
    }
  } catch (err) {
    console.error('사용량 확인 실패:', err.message);
    res.status(500).json({ error: '사용량을 확인하는 중 오류가 발생했습니다.' });
    return;
  }

  let resultText;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
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
    const variations = Array.isArray(toolUseBlock?.input?.variations) ? toolUseBlock.input.variations : [];
    // 클라이언트의 parseSentencesText()가 그대로 이해하는 "한국어\t영어" 줄바꿈 텍스트로 재조립 —
    // 응답 계약(text 필드)이 이전과 동일해 js/app.js는 전혀 수정할 필요가 없다.
    resultText = variations
      .filter((v) => v && typeof v.kr === 'string' && typeof v.en === 'string' && v.kr.trim() && v.en.trim())
      .map((v) => `${v.kr.trim()}\t${v.en.trim()}`)
      .join('\n');
  } catch (err) {
    console.error('Anthropic API 호출 실패:', err);
    res.status(502).json({ error: 'AI 변형 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    return;
  }

  // 실제로 호출이 성공했을 때만 한도를 차감 — 실패한 요청은 소모하지 않음.
  // 트랜잭션으로 재확인+증가를 원자적으로 처리해 동시 요청으로 한도를 넘기지 못하게 방지.
  let remaining;
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
    // 결과는 이미 생성됐으므로 카운트 반영 실패로 사용자 응답 자체를 막지는 않음
    remaining = null;
  }

  res.status(200).json({ text: resultText, remaining });
};
