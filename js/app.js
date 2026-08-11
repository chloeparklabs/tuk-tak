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
