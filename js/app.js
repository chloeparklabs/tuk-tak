// ==========================================================================
// 데이터 저장소 (LocalStorage)
// ==========================================================================
const STORAGE_KEY = 'tuktak_sentences';

// 최초 실행 시 시드로 사용할 샘플 문장
const SEED_SENTENCES = [
  { kr: '오늘 날씨가 어때?', en: 'How is the weather?' },
  { kr: '나는 커피를 좋아해.', en: 'I like coffee.' },
  { kr: '몇 시에 만날까?', en: 'What time should we meet?' },
  { kr: '이거 얼마예요?', en: 'How much is this?' },
  { kr: '조심히 들어가세요.', en: 'Get home safe.' },
];

function makeSentence(kr, en) {
  return { id: Date.now() + Math.random(), kr, en, createdAt: new Date().toISOString() };
}

function loadSentences() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    return JSON.parse(raw);
  }
  // 저장된 데이터가 없으면 시드 데이터로 초기화
  const seeded = SEED_SENTENCES.map((s) => makeSentence(s.kr, s.en));
  saveSentences(seeded);
  return seeded;
}

function saveSentences(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const sentences = loadSentences();

function addSentence(kr, en) {
  sentences.push(makeSentence(kr, en));
  saveSentences(sentences);
}

// ==========================================================================
// 공통 파서 (TSV/CSV → {kr, en}[])
// 구글시트 연동(체크리스트 4번)에서도 이 함수를 그대로 재사용할 예정
// ==========================================================================
const HEADER_KEYWORDS = ['한국어', 'kr', 'korean'];

function parseSentencesText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
  const result = [];

  lines.forEach((line, index) => {
    // 탭이 있으면 TSV, 없으면 CSV로 간주
    // 탭도 쉼표도 없으면(메모장 등에서 탭이 스페이스로 바뀐 경우 대응) 연속 공백 2칸 이상을 구분자로 사용
    let parts;
    if (line.includes('\t')) {
      parts = line.split('\t');
    } else if (line.includes(',')) {
      parts = line.split(',');
    } else {
      parts = line.split(/\s{2,}/);
    }

    const kr = (parts[0] || '').trim();
    const en = parts.slice(1).join(' ').trim();

    if (!kr || !en) return;
    // 첫 줄이 헤더("한국어, 영어" 등)로 보이면 건너뜀
    if (index === 0 && HEADER_KEYWORDS.includes(kr.toLowerCase())) return;

    result.push({ kr, en });
  });

  return result;
}

// ==========================================================================
// 상태
// ==========================================================================
let currentIndex = 0;
let revealed = false;

// ==========================================================================
// DOM 요소
// ==========================================================================
const startScreen = document.getElementById('start-screen');
const cardScreen = document.getElementById('card-screen');
const startBtn = document.getElementById('start-btn');
const cardEl = document.querySelector('.card');
const krTextEl = document.getElementById('kr-text');
const enTextEl = document.getElementById('en-text');
const prevBtn = document.getElementById('prev-btn');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const addOpenBtn = document.getElementById('add-open-btn');
const addModal = document.getElementById('add-modal');
const addKrInput = document.getElementById('add-kr-input');
const addEnInput = document.getElementById('add-en-input');
const addSubmitBtn = document.getElementById('add-submit-btn');
const addCancelBtn = document.getElementById('add-cancel-btn');
const importOpenBtn = document.getElementById('import-open-btn');
const importFileInput = document.getElementById('import-file-input');
const sheetOpenBtn = document.getElementById('sheet-open-btn');
const sheetModal = document.getElementById('sheet-modal');
const sheetUrlInput = document.getElementById('sheet-url-input');
const sheetSubmitBtn = document.getElementById('sheet-submit-btn');
const sheetCancelBtn = document.getElementById('sheet-cancel-btn');

// ==========================================================================
// 렌더링
// ==========================================================================
function renderCard() {
  const sentence = sentences[currentIndex];
  krTextEl.textContent = sentence.kr;
  enTextEl.textContent = sentence.en;

  enTextEl.classList.toggle('hidden', !revealed);
  cardEl.classList.toggle('revealed', revealed);
}

// ==========================================================================
// 이벤트 핸들러
// ==========================================================================
function goToSentence(index) {
  // 문장 목록의 처음/끝에서 순환
  currentIndex = (index + sentences.length) % sentences.length;
  revealed = false;
  renderCard();
}

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  cardScreen.classList.remove('hidden');
  goToSentence(0);
});

checkBtn.addEventListener('click', () => {
  revealed = true;
  renderCard();
});

prevBtn.addEventListener('click', () => {
  goToSentence(currentIndex - 1);
});

nextBtn.addEventListener('click', () => {
  goToSentence(currentIndex + 1);
});

// ==========================================================================
// 문장 추가 폼
// ==========================================================================
function openAddModal() {
  addModal.classList.remove('hidden');
  addKrInput.focus();
}

function closeAddModal() {
  addModal.classList.add('hidden');
  addKrInput.value = '';
  addEnInput.value = '';
}

addOpenBtn.addEventListener('click', openAddModal);
addCancelBtn.addEventListener('click', closeAddModal);

addSubmitBtn.addEventListener('click', () => {
  const kr = addKrInput.value.trim();
  const en = addEnInput.value.trim();
  if (!kr || !en) return;

  addSentence(kr, en);
  closeAddModal();
});

// ==========================================================================
// CSV/TSV 파일 가져오기
// ==========================================================================
importOpenBtn.addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', () => {
  const file = importFileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseSentencesText(String(reader.result));
    parsed.forEach((s) => addSentence(s.kr, s.en));
    alert(`${parsed.length}개 문장을 추가했습니다.`);
    importFileInput.value = '';
  };
  reader.readAsText(file, 'UTF-8');
});

// ==========================================================================
// 구글시트 연동 (웹에 게시 CSV URL → 공통 파서 → 병합)
// ==========================================================================
function openSheetModal() {
  sheetModal.classList.remove('hidden');
  sheetUrlInput.focus();
}

function closeSheetModal() {
  sheetModal.classList.add('hidden');
  sheetUrlInput.value = '';
}

sheetOpenBtn.addEventListener('click', openSheetModal);
sheetCancelBtn.addEventListener('click', closeSheetModal);

sheetSubmitBtn.addEventListener('click', async () => {
  const url = sheetUrlInput.value.trim();
  if (!url) return;

  sheetSubmitBtn.disabled = true;
  try {
    // 브라우저가 이전 응답을 캐시해서 재사용하지 않도록 매번 다른 URL로 요청
    const noCacheUrl = url + (url.includes('?') ? '&' : '?') + '_cb=' + Date.now();
    const response = await fetch(noCacheUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const parsed = parseSentencesText(text);
    parsed.forEach((s) => addSentence(s.kr, s.en));

    alert(`${parsed.length}개 문장을 가져왔습니다.`);
    closeSheetModal();
  } catch (err) {
    // 실패 시 기존 LocalStorage 데이터는 그대로 유지됨(변경 없음)
    alert('구글시트를 불러오지 못했습니다. 링크가 "웹에 게시" CSV 형식인지 확인해주세요.');
  } finally {
    sheetSubmitBtn.disabled = false;
  }
});
