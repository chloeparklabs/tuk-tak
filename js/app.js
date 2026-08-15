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
  return { id: Date.now() + Math.random(), kr, en, createdAt: new Date().toISOString(), important: false };
}

// 예전 버전에서 저장된 문장에는 important 필드가 없을 수 있어 불러올 때 보정
function normalizeSentence(s) {
  return { important: false, ...s };
}

function loadSentences() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    return JSON.parse(raw).map(normalizeSentence);
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

function updateSentence(id, kr, en) {
  const target = sentences.find((s) => String(s.id) === String(id));
  if (!target) return;
  target.kr = kr;
  target.en = en;
  saveSentences(sentences);
}

function toggleImportant(id) {
  const target = sentences.find((s) => String(s.id) === String(id));
  if (!target) return;
  target.important = !target.important;
  saveSentences(sentences);
}

function deleteSentence(id) {
  const index = sentences.findIndex((s) => String(s.id) === String(id));
  if (index === -1) return;
  sentences.splice(index, 1);
  if (currentIndex >= sentences.length) {
    currentIndex = sentences.length - 1;
  }
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
const modeSelectBtns = document.querySelectorAll('.mode-select-btn');
const addModalTitleEl = document.getElementById('add-modal-title');
const listOpenBtn = document.getElementById('list-open-btn');
const listScreen = document.getElementById('list-screen');
const listBackBtn = document.getElementById('list-back-btn');
const sentenceListEl = document.getElementById('sentence-list');
const settingsOpenBtn = document.getElementById('settings-open-btn');
const settingsScreen = document.getElementById('settings-screen');
const settingsBackBtn = document.getElementById('settings-back-btn');
const exportBackupBtn = document.getElementById('export-backup-btn');
const resetOpenBtn = document.getElementById('reset-open-btn');
const emptyStateMsg = document.getElementById('empty-state-msg');
const cardStarBtn = document.getElementById('card-star-btn');

// ==========================================================================
// 렌더링
// ==========================================================================
function renderCard() {
  const isEmpty = sentences.length === 0;

  emptyStateMsg.classList.toggle('hidden', !isEmpty);
  krTextEl.classList.toggle('hidden', isEmpty);
  prevBtn.disabled = isEmpty;
  checkBtn.disabled = isEmpty;
  nextBtn.disabled = isEmpty;
  cardStarBtn.classList.toggle('hidden', isEmpty);

  if (isEmpty) {
    enTextEl.classList.add('hidden');
    cardEl.classList.remove('revealed');
    return;
  }

  const sentence = sentences[currentIndex];
  krTextEl.textContent = sentence.kr;
  enTextEl.textContent = sentence.en;

  enTextEl.classList.toggle('hidden', !revealed);
  cardEl.classList.toggle('revealed', revealed);
  cardStarBtn.classList.toggle('active', sentence.important);
}

// ==========================================================================
// 이벤트 핸들러
// ==========================================================================
function goToSentence(index) {
  if (sentences.length === 0) {
    renderCard();
    return;
  }
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

cardStarBtn.addEventListener('click', () => {
  if (sentences.length === 0) return;
  toggleImportant(sentences[currentIndex].id);
  renderCard();
  if (!listScreen.classList.contains('hidden')) {
    renderSentenceList();
  }
});

// ==========================================================================
// 문장 추가/수정 폼 (같은 모달을 재사용, editingId가 있으면 수정 모드)
// ==========================================================================
let editingId = null;

function openAddModal(sentence) {
  if (sentence) {
    editingId = sentence.id;
    addModalTitleEl.textContent = '문장 수정';
    addSubmitBtn.textContent = '저장';
    addKrInput.value = sentence.kr;
    addEnInput.value = sentence.en;
  } else {
    editingId = null;
    addModalTitleEl.textContent = '문장 추가';
    addSubmitBtn.textContent = '추가';
  }
  addModal.classList.remove('hidden');
  addKrInput.focus();
}

function closeAddModal() {
  addModal.classList.add('hidden');
  addKrInput.value = '';
  addEnInput.value = '';
  editingId = null;
}

addOpenBtn.addEventListener('click', () => openAddModal());
addCancelBtn.addEventListener('click', closeAddModal);

addSubmitBtn.addEventListener('click', () => {
  const kr = addKrInput.value.trim();
  const en = addEnInput.value.trim();
  if (!kr || !en) return;

  if (editingId) {
    updateSentence(editingId, kr, en);
  } else {
    addSentence(kr, en);
  }
  closeAddModal();
  renderCard();
  if (!listScreen.classList.contains('hidden')) {
    renderSentenceList();
  }
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
// 문장 목록 화면 (수정/삭제)
// ==========================================================================
function renderSentenceList() {
  sentenceListEl.innerHTML = '';

  sentences.forEach((s) => {
    const item = document.createElement('div');
    item.className = 'sentence-list-item';
    item.dataset.id = String(s.id);

    const textWrap = document.createElement('div');
    textWrap.className = 'sentence-list-text';

    const krEl = document.createElement('p');
    krEl.className = 'sentence-list-kr';
    krEl.textContent = s.kr;

    const enEl = document.createElement('p');
    enEl.className = 'sentence-list-en';
    enEl.textContent = s.en;

    textWrap.appendChild(krEl);
    textWrap.appendChild(enEl);

    const actions = document.createElement('div');
    actions.className = 'sentence-list-actions';

    const starBtn = document.createElement('button');
    starBtn.type = 'button';
    starBtn.className = 'sentence-star-btn';
    starBtn.classList.toggle('active', s.important);
    starBtn.setAttribute('aria-label', '중요 표시');
    starBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'sentence-delete-btn';
    deleteBtn.setAttribute('aria-label', '삭제');
    deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';

    actions.appendChild(starBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(textWrap);
    item.appendChild(actions);
    sentenceListEl.appendChild(item);
  });
}

listOpenBtn.addEventListener('click', () => {
  cardScreen.classList.add('hidden');
  listScreen.classList.remove('hidden');
  renderSentenceList();
});

listBackBtn.addEventListener('click', () => {
  listScreen.classList.add('hidden');
  cardScreen.classList.remove('hidden');
});

sentenceListEl.addEventListener('click', (e) => {
  const item = e.target.closest('.sentence-list-item');
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.closest('.sentence-star-btn')) {
    toggleImportant(id);
    renderSentenceList();
    renderCard();
    return;
  }

  if (e.target.closest('.sentence-delete-btn')) {
    if (sentences.length <= 1) {
      alert('최소 1개의 문장은 있어야 합니다.');
      return;
    }
    if (!confirm('이 문장을 삭제하시겠습니까?')) return;
    deleteSentence(id);
    renderSentenceList();
    renderCard();
    return;
  }

  const sentence = sentences.find((s) => String(s.id) === id);
  if (sentence) openAddModal(sentence);
});

// ==========================================================================
// 설정 화면 (글자크기 / 화면모드 / 데이터 관리)
// ==========================================================================
settingsOpenBtn.addEventListener('click', () => {
  cardScreen.classList.add('hidden');
  settingsScreen.classList.remove('hidden');
});

settingsBackBtn.addEventListener('click', () => {
  settingsScreen.classList.add('hidden');
  cardScreen.classList.remove('hidden');
});

// 백업 내보내기: 현재 문장을 TSV로 만들어 파일 다운로드
// (복원은 별도 기능 없이 기존 "파일가져오기"로 이 파일을 그대로 불러오면 됨)
exportBackupBtn.addEventListener('click', () => {
  const tsvText = sentences.map((s) => `${s.kr}\t${s.en}`).join('\n');
  const blob = new Blob([tsvText], { type: 'text/tab-separated-values' });
  const url = URL.createObjectURL(blob);

  const today = new Date();
  const dateStr = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('');

  const link = document.createElement('a');
  link.href = url;
  link.download = `tuktak_backup_${dateStr}.tsv`;
  link.click();

  URL.revokeObjectURL(url);
});

// 초기화: 문장 전체 삭제(글자크기/화면모드 등 설정값은 유지)
resetOpenBtn.addEventListener('click', () => {
  if (!confirm('문장을 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

  sentences.length = 0;
  currentIndex = 0;
  saveSentences(sentences);
  renderCard();
  alert('문장을 모두 삭제했습니다.');
});

// ==========================================================================
// 글자 크기 (5단계 도트 + 스테퍼, 설정 화면에 상시 노출)
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
// 화면모드 (시스템 / 라이트 / 다크)
// ==========================================================================
const THEME_KEY = 'tuktak_theme';
const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
let themeMode = 'light';

function resolveTheme(mode) {
  if (mode === 'system') {
    return systemDarkQuery.matches ? 'dark' : 'light';
  }
  return mode;
}

function applyThemeMode(mode) {
  themeMode = mode;
  document.documentElement.setAttribute('data-theme', resolveTheme(mode));

  modeSelectBtns.forEach((btn) => {
    const isActive = btn.dataset.mode === mode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', String(isActive));
  });
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const mode = ['system', 'light', 'dark'].includes(saved) ? saved : 'light';
  applyThemeMode(mode);
}

loadTheme();

modeSelectBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    localStorage.setItem(THEME_KEY, btn.dataset.mode);
    applyThemeMode(btn.dataset.mode);
  });
});

// 시스템 모드 선택 중에는 기기의 다크모드 설정이 바뀌면 앱도 실시간으로 따라감
systemDarkQuery.addEventListener('change', () => {
  if (themeMode === 'system') {
    document.documentElement.setAttribute('data-theme', resolveTheme('system'));
  }
});

// ==========================================================================
// 상단바 더보기 메뉴 (문장추가 / 문장관리 / 설정)
// ==========================================================================
moreOpenBtn.addEventListener('click', () => {
  moreMenu.classList.toggle('hidden');
});

// 메뉴 안의 항목(문장추가/문장관리/설정)을 선택하면 메뉴를 닫음
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
