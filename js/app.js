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
// 파일 가져오기(엑셀/메모장 등에서 작성한 CSV/TSV/TXT)에서 사용
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
const fontSizeDots = document.querySelectorAll('.font-size-dot');
const fontSizeDecBtn = document.getElementById('font-size-dec-btn');
const fontSizeIncBtn = document.getElementById('font-size-inc-btn');
const moreOpenBtn = document.getElementById('more-open-btn');
const moreMenu = document.getElementById('more-menu');
const darkModeToggleBtn = document.getElementById('dark-mode-toggle-btn');

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
// 글자 크기 (5단계 도트 + 스테퍼, 더보기 메뉴 안에 상시 노출)
// ==========================================================================
const FONT_SIZE_KEY = 'tuktak_font_size';
const FONT_SIZE_LEVELS = [
  { kr: 16, revealed: 12, en: 18 },
  { kr: 19, revealed: 14, en: 21 },
  { kr: 22, revealed: 16, en: 24 }, // 기본값(보통)
  { kr: 25, revealed: 18, en: 27 },
  { kr: 28, revealed: 20, en: 30 },
];
const DEFAULT_FONT_SIZE_INDEX = 3;
let fontSizeIndex = DEFAULT_FONT_SIZE_INDEX;

function applyFontSize(index) {
  fontSizeIndex = Math.min(Math.max(index, 1), FONT_SIZE_LEVELS.length);
  const level = FONT_SIZE_LEVELS[fontSizeIndex - 1];

  document.documentElement.style.setProperty('--kr-font-size', `${level.kr}px`);
  document.documentElement.style.setProperty('--kr-font-size-revealed', `${level.revealed}px`);
  document.documentElement.style.setProperty('--en-font-size', `${level.en}px`);

  fontSizeDots.forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.index) === fontSizeIndex);
  });
  fontSizeDecBtn.disabled = fontSizeIndex === 1;
  fontSizeIncBtn.disabled = fontSizeIndex === FONT_SIZE_LEVELS.length;
}

function loadFontSize() {
  const saved = Number(localStorage.getItem(FONT_SIZE_KEY));
  const index = FONT_SIZE_LEVELS[saved - 1] ? saved : DEFAULT_FONT_SIZE_INDEX;
  applyFontSize(index);
}

loadFontSize();

fontSizeDecBtn.addEventListener('click', () => {
  const next = fontSizeIndex - 1;
  if (next < 1) return;
  localStorage.setItem(FONT_SIZE_KEY, String(next));
  applyFontSize(next);
});

fontSizeIncBtn.addEventListener('click', () => {
  const next = fontSizeIndex + 1;
  if (next > FONT_SIZE_LEVELS.length) return;
  localStorage.setItem(FONT_SIZE_KEY, String(next));
  applyFontSize(next);
});

// ==========================================================================
// 다크모드
// ==========================================================================
const THEME_KEY = 'tuktak_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  darkModeToggleBtn.setAttribute('aria-checked', String(theme === 'dark'));
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  applyTheme(saved);
}

loadTheme();

darkModeToggleBtn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// ==========================================================================
// 상단바 더보기 메뉴 (문장추가 / 파일가져오기 / 글자크기 / 다크모드)
// ==========================================================================
moreOpenBtn.addEventListener('click', () => {
  moreMenu.classList.toggle('hidden');
});

// 메뉴 안의 항목(문장추가/파일가져오기/설정)을 선택하면 메뉴를 닫음
moreMenu.addEventListener('click', (e) => {
  if (e.target.closest('.more-menu-item')) {
    moreMenu.classList.add('hidden');
  }
});

// 메뉴 바깥을 클릭하면 메뉴를 닫음
document.addEventListener('click', (e) => {
  if (!moreMenu.classList.contains('hidden') && !e.target.closest('.topbar-more')) {
    moreMenu.classList.add('hidden');
  }
});
