// ==========================================================================
// 데이터 저장소 (LocalStorage)
// ==========================================================================
const STORAGE_KEY = 'tuktak_sentences';

// 최초 실행 시 시드로 사용할 기본 문장 100개 (2026-08-22 확정)
// source: 'default'로 마킹해 사용자가 직접 추가한 문장과 구분(문장관리 목록에 배지 표시).
// 사용자가 이 문장을 수정하면 updateSentence()에서 source를 제거해 "내 문장"으로 전환됨
const DEFAULT_SENTENCES = [
  { kr: '나는 아침에 일찍 일어나.', en: 'I wake up early in the morning.' },
  { kr: '너는 보통 몇 시에 자?', en: 'What time do you usually go to bed?' },
  { kr: '나는 매일 커피를 마셔.', en: 'I drink coffee every day.' },
  { kr: '오늘 기분이 어때?', en: 'How are you feeling today?' },
  { kr: '나는 지금 서울에 살아.', en: 'I live in Seoul right now.' },
  { kr: '너는 어디 출신이야?', en: 'Where are you from?' },
  { kr: '나는 집에서 일해.', en: 'I work from home.' },
  { kr: '요즘 뭐 하고 지내?', en: 'What have you been up to lately?' },
  { kr: '나는 아침을 잘 안 먹어.', en: "I don't usually eat breakfast." },
  { kr: '주말에는 보통 뭐 해?', en: 'What do you usually do on weekends?' },
  { kr: '나는 영화 보는 걸 좋아해.', en: 'I like watching movies.' },
  { kr: '너는 어떤 음악을 들어?', en: 'What kind of music do you listen to?' },
  { kr: '나는 요즘 그림을 그리고 있어.', en: "I've been drawing lately." },
  { kr: '너는 취미가 뭐야?', en: "What's your hobby?" },
  { kr: '나는 책 읽는 걸 좋아해.', en: 'I enjoy reading books.' },
  { kr: '나는 운동을 별로 안 좋아해.', en: "I don't really like exercising." },
  { kr: '너는 게임 좋아해?', en: 'Do you like playing games?' },
  { kr: '나는 사진 찍는 걸 좋아해.', en: 'I love taking photos.' },
  { kr: '나는 요리하는 걸 좋아해.', en: 'I enjoy cooking.' },
  { kr: '너는 주로 어떤 영화를 봐?', en: 'What kind of movies do you usually watch?' },
  { kr: '나는 오늘 좀 피곤해.', en: "I'm a bit tired today." },
  { kr: '나는 지금 너무 신나.', en: "I'm so excited right now." },
  { kr: '너는 왜 그렇게 화가 났어?', en: 'Why are you so angry?' },
  { kr: '나는 걱정이 좀 돼.', en: "I'm a little worried." },
  { kr: '나는 그 소식을 듣고 놀랐어.', en: 'I was surprised to hear the news.' },
  { kr: '나는 요즘 스트레스를 많이 받아.', en: "I've been really stressed lately." },
  { kr: '나는 지금 마음이 편해.', en: 'I feel relaxed right now.' },
  { kr: '너는 긴장돼 보여.', en: 'You look nervous.' },
  { kr: '나는 그게 좀 슬퍼.', en: 'That makes me a little sad.' },
  { kr: '나는 지금 기분이 좋아.', en: "I'm in a good mood right now." },
  { kr: '나는 지금 회사에 있어.', en: "I'm at work right now." },
  { kr: '너는 무슨 일을 해?', en: 'What do you do for a living?' },
  { kr: '나는 내일까지 이걸 끝내야 해.', en: 'I have to finish this by tomorrow.' },
  { kr: '나는 오늘 회의가 있어.', en: 'I have a meeting today.' },
  { kr: '너는 학교에서 뭘 공부해?', en: 'What do you study at school?' },
  { kr: '나는 요즘 너무 바빠.', en: "I've been really busy lately." },
  { kr: '나는 이번 주에 야근을 많이 했어.', en: 'I worked overtime a lot this week.' },
  { kr: '너는 언제 퇴근해?', en: 'When do you get off work?' },
  { kr: '나는 새로운 프로젝트를 시작했어.', en: 'I started a new project.' },
  { kr: '나는 시험 준비를 하고 있어.', en: "I'm preparing for an exam." },
  { kr: '나는 이번 주말에 여행 갈 거야.', en: "I'm going on a trip this weekend." },
  { kr: '너는 이따가 뭐 할 거야?', en: 'What are you going to do later?' },
  { kr: '나는 내년에 이사할 계획이야.', en: "I'm planning to move next year." },
  { kr: '나는 곧 새 일을 시작할 거야.', en: "I'm going to start a new job soon." },
  { kr: '너는 저녁에 시간 있어?', en: 'Are you free tonight?' },
  { kr: '나는 나중에 유학을 가고 싶어.', en: 'I want to study abroad someday.' },
  { kr: '우리 다음에 또 만나자.', en: "Let's meet again next time." },
  { kr: '나는 올해 안에 그걸 끝낼 거야.', en: "I'll finish it by the end of this year." },
  { kr: '나는 곧 운전면허를 딸 거야.', en: "I'm going to get my driver's license soon." },
  { kr: '너는 내일 뭐 할 예정이야?', en: 'What do you plan to do tomorrow?' },
  { kr: '나는 어제 늦게 잤어.', en: 'I went to bed late yesterday.' },
  { kr: '너는 그 영화 봤어?', en: 'Did you watch that movie?' },
  { kr: '나는 작년에 일본에 갔었어.', en: 'I went to Japan last year.' },
  { kr: '나는 예전에 여기 살았었어.', en: 'I used to live here.' },
  { kr: '너는 오늘 아침에 뭐 먹었어?', en: 'What did you eat this morning?' },
  { kr: '나는 지난주에 감기에 걸렸었어.', en: 'I caught a cold last week.' },
  { kr: '나는 그걸 한 번도 해본 적 없어.', en: "I've never done that before." },
  { kr: '너는 거기 가본 적 있어?', en: 'Have you ever been there?' },
  { kr: '나는 예전에 피아노를 배웠었어.', en: 'I used to learn piano.' },
  { kr: '나는 어렸을 때 여기서 자랐어.', en: 'I grew up here as a kid.' },
  { kr: '나는 매운 음식을 좋아해.', en: 'I like spicy food.' },
  { kr: '너는 오늘 점심 뭐 먹었어?', en: 'What did you have for lunch today?' },
  { kr: '나는 커피보다 차를 더 좋아해.', en: 'I prefer tea to coffee.' },
  { kr: '우리 오늘 저녁에 뭐 먹을까?', en: 'What should we eat for dinner today?' },
  { kr: '나는 단 음식을 잘 안 먹어.', en: "I don't eat sweets very often." },
  { kr: '이 음식 정말 맛있다.', en: 'This food is really delicious.' },
  { kr: '너는 못 먹는 음식 있어?', en: "Is there any food you can't eat?" },
  { kr: '나는 아침에 과일을 자주 먹어.', en: 'I often eat fruit in the morning.' },
  { kr: '나는 요즘 다이어트 중이야.', en: "I'm on a diet these days." },
  { kr: '너는 요리 잘해?', en: 'Are you good at cooking?' },
  { kr: '오늘 날씨 진짜 좋다.', en: 'The weather is really nice today.' },
  { kr: '나는 여름보다 겨울을 더 좋아해.', en: 'I like winter more than summer.' },
  { kr: '내일 비가 온대.', en: "It's going to rain tomorrow." },
  { kr: '요즘 너무 더워.', en: "It's really hot these days." },
  { kr: '나는 눈 오는 날을 좋아해.', en: 'I like snowy days.' },
  { kr: '오늘 좀 쌀쌀하네.', en: "It's a bit chilly today." },
  { kr: '이번 여름은 유난히 덥다.', en: 'This summer is unusually hot.' },
  { kr: '나는 봄을 제일 좋아해.', en: 'Spring is my favorite season.' },
  { kr: '밖에 바람이 많이 불어.', en: "It's really windy outside." },
  { kr: '요즘 날씨가 계속 흐려.', en: 'The weather has been cloudy lately.' },
  { kr: '나는 여행 가는 걸 좋아해.', en: 'I love traveling.' },
  { kr: '너는 어디 여행 가고 싶어?', en: 'Where do you want to travel?' },
  { kr: '나는 다음 달에 제주도에 갈 거야.', en: "I'm going to Jeju Island next month." },
  { kr: '여기서 거기까지 얼마나 걸려?', en: 'How long does it take to get there from here?' },
  { kr: '나는 비행기 타는 걸 무서워해.', en: "I'm afraid of flying." },
  { kr: '우리 같이 여행 가자.', en: "Let's travel together." },
  { kr: '나는 혼자 여행하는 걸 좋아해.', en: 'I like traveling alone.' },
  { kr: '너는 어느 나라에 가보고 싶어?', en: 'Which country do you want to visit?' },
  { kr: '나는 지하철을 타고 출근해.', en: 'I take the subway to work.' },
  { kr: '여기서 역까지 걸어서 갈 수 있어.', en: 'You can walk to the station from here.' },
  { kr: '우리 오랜만이다.', en: "It's been a while." },
  { kr: '나는 네 생각이 궁금해.', en: "I'm curious what you think." },
  { kr: '너 요즘 연락이 뜸했네.', en: "You haven't been in touch much lately." },
  { kr: '나는 네 말에 동의해.', en: 'I agree with you.' },
  { kr: '나는 그거 잘 모르겠어.', en: "I'm not really sure about that." },
  { kr: '우리 다음에 밥 한번 먹자.', en: "Let's grab a meal together sometime." },
  { kr: '나는 너한테 할 말이 있어.', en: 'I have something to tell you.' },
  { kr: '너는 그거에 대해 어떻게 생각해?', en: 'What do you think about that?' },
  { kr: '나는 네가 보고 싶었어.', en: 'I missed you.' },
  { kr: '우리 이제 그만 얘기하자.', en: "Let's stop talking about this now." },
];

function makeSentence(kr, en, source) {
  const sentence = { id: Date.now() + Math.random(), kr, en, createdAt: new Date().toISOString(), important: false, unfamiliar: false };
  if (source) sentence.source = source;
  return sentence;
}

// 예전 버전에서 저장된 문장에는 important/unfamiliar 필드가 없을 수 있어 불러올 때 보정
function normalizeSentence(s) {
  return { important: false, unfamiliar: false, ...s };
}

function loadSentences() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    return JSON.parse(raw).map(normalizeSentence);
  }
  // 저장된 데이터가 없으면(최초 실행) 기본문장 100개로 초기화
  const seeded = DEFAULT_SENTENCES.map((s) => makeSentence(s.kr, s.en, 'default'));
  saveSentences(seeded);
  return seeded;
}

function saveSentences(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// 마지막으로 보던 문장 id (앱을 껐다 켜도 이어서 시작하기 위함)
const LAST_SENTENCE_ID_KEY = 'tuktak_last_sentence_id';

const SORT_KEY = 'tuktak_sort_order';
const SORT_MODES = ['random', 'newest', 'oldest', 'unfamiliar', 'important'];
const DEFAULT_SORT_MODE = 'oldest'; // 기존(정렬 기능 도입 전) 순서와 동일해 설정을 건드리지 않은 사용자는 체감 변화 없음
const RANDOM_ORDER_KEY = 'tuktak_random_order';

// 기본문장(source: 'default') 숨기기 설정 — 카드 학습/문장관리 양쪽에 적용(getOrderedSentences 참고)
const HIDE_DEFAULT_KEY = 'tuktak_hide_default';

let sortMode = DEFAULT_SORT_MODE;
let randomOrder = [];
let hideDefaultSentences = localStorage.getItem(HIDE_DEFAULT_KEY) === 'true';

const sentences = loadSentences();
loadRandomOrder();

function addSentence(kr, en) {
  const sentence = makeSentence(kr, en);
  sentences.push(sentence);
  randomOrder.push(String(sentence.id));
  saveRandomOrder();
  saveSentences(sentences);
}

function updateSentence(id, kr, en) {
  const target = sentences.find((s) => String(s.id) === String(id));
  if (!target) return;
  target.kr = kr;
  target.en = en;
  // 기본문장을 사용자가 직접 수정하면 그 순간부터 "내 문장"으로 취급(배지 해제)
  delete target.source;
  saveSentences(sentences);
}

function toggleImportant(id) {
  const target = sentences.find((s) => String(s.id) === String(id));
  if (!target) return;
  target.important = !target.important;
  saveSentences(sentences);
}

function toggleUnfamiliar(id) {
  const target = sentences.find((s) => String(s.id) === String(id));
  if (!target) return;
  target.unfamiliar = !target.unfamiliar;
  saveSentences(sentences);
}

function deleteSentence(id) {
  const index = sentences.findIndex((s) => String(s.id) === String(id));
  if (index === -1) return;
  sentences.splice(index, 1);
  const randIndex = randomOrder.indexOf(String(id));
  if (randIndex !== -1) {
    randomOrder.splice(randIndex, 1);
    saveRandomOrder();
  }
  if (currentIndex >= sentences.length) {
    currentIndex = sentences.length - 1;
  }
  saveSentences(sentences);
}

// ==========================================================================
// 출제/정렬 순서 (랜덤순/최신순/오래된순/못외운것 먼저/중요한것 먼저)
// ==========================================================================
function saveRandomOrder() {
  localStorage.setItem(RANDOM_ORDER_KEY, JSON.stringify(randomOrder));
}

// 저장된 랜덤 순서에서 삭제된 문장은 제거하고, 새로 추가된 문장은 뒤에 이어붙여 보정
function loadRandomOrder() {
  let raw = [];
  try {
    raw = JSON.parse(localStorage.getItem(RANDOM_ORDER_KEY) || '[]');
  } catch {
    raw = [];
  }
  const currentIds = sentences.map((s) => String(s.id));
  const validIds = new Set(currentIds);
  const filtered = raw.filter((id) => validIds.has(id));
  const filteredSet = new Set(filtered);
  const missing = currentIds.filter((id) => !filteredSet.has(id));
  randomOrder = [...filtered, ...missing];
  saveRandomOrder();
}

// "랜덤순" 선택 시(다시 선택할 때마다)에만 새로 섞음 — 앱을 껐다 켜도 순서 유지
function shuffleRandomOrder() {
  const ids = sentences.map((s) => String(s.id));
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  randomOrder = ids;
  saveRandomOrder();
}

// 현재 정렬 기준에 따라 정렬된 새 배열을 반환 (sentences 자체는 변경하지 않음)
// "기본문장 숨기기"가 켜져 있으면 여기서 걸러낸 뒤 정렬 — 카드 학습 순서와 문장관리 목록이
// 둘 다 이 함수를 거치므로 자동으로 같이 반영됨
function getOrderedSentences() {
  const visible = hideDefaultSentences ? sentences.filter((s) => s.source !== 'default') : sentences;
  const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
  const byOldest = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);

  if (sortMode === 'newest') return [...visible].sort(byNewest);
  if (sortMode === 'oldest') return [...visible].sort(byOldest);

  if (sortMode === 'unfamiliar' || sortMode === 'important') {
    const key = sortMode;
    const marked = visible.filter((s) => s[key]).sort(byNewest);
    const rest = visible.filter((s) => !s[key]).sort(byNewest);
    return [...marked, ...rest];
  }

  if (sortMode === 'random') {
    const byId = new Map(visible.map((s) => [String(s.id), s]));
    const ordered = randomOrder.map((id) => byId.get(id)).filter(Boolean);
    const orderedIds = new Set(ordered.map((s) => String(s.id)));
    const extras = visible.filter((s) => !orderedIds.has(String(s.id))).sort(byNewest);
    return [...ordered, ...extras];
  }

  return [...visible];
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
const addBackBtn = document.getElementById('add-back-btn');
const addModalTabsEl = document.getElementById('add-modal-tabs');
const addModalTabBtns = document.querySelectorAll('.add-modal-tab-btn');
const addTabForm = document.getElementById('add-tab-form');
const addTabFile = document.getElementById('add-tab-file');
const addTabPaste = document.getElementById('add-tab-paste');
const addKrInput = document.getElementById('add-kr-input');
const addEnInput = document.getElementById('add-en-input');
const addSubmitBtn = document.getElementById('add-submit-btn');
const importFileInput = document.getElementById('import-file-input');
const importTabOpenBtn = document.getElementById('import-tab-open-btn');
const pasteTextarea = document.getElementById('paste-textarea');
const pasteSubmitBtn = document.getElementById('paste-submit-btn');
const fontSizeDots = document.querySelectorAll('.font-size-dot');
const fontSizeDecBtn = document.getElementById('font-size-dec-btn');
const fontSizeIncBtn = document.getElementById('font-size-inc-btn');
const moreOpenBtn = document.getElementById('more-open-btn');
const moreMenu = document.getElementById('more-menu');
const modeSelectBtns = document.querySelectorAll('.mode-select-btn');
const sortOptionBtns = document.querySelectorAll('.sort-option-btn');
const addModalTitleEl = document.getElementById('add-modal-title');
const listOpenBtn = document.getElementById('list-open-btn');
const listScreen = document.getElementById('list-screen');
const listTopbarEl = document.getElementById('list-topbar');
const listBackBtn = document.getElementById('list-back-btn');
const listTopbarTitleEl = document.getElementById('list-topbar-title');
const listSelectBtn = document.getElementById('list-select-btn');
const listBulkDeleteBtn = document.getElementById('list-bulk-delete-btn');
const sentenceListEl = document.getElementById('sentence-list');
const settingsOpenBtn = document.getElementById('settings-open-btn');
const restartOpenBtn = document.getElementById('restart-open-btn');
const helpOpenBtn = document.getElementById('help-open-btn');
const helpScreen = document.getElementById('help-screen');
const helpBackBtn = document.getElementById('help-back-btn');
const settingsScreen = document.getElementById('settings-screen');
const settingsBackBtn = document.getElementById('settings-back-btn');
const exportBackupBtn = document.getElementById('export-backup-btn');
const resetOpenBtn = document.getElementById('reset-open-btn');
const hideDefaultToggleBtn = document.getElementById('hide-default-toggle-btn');
const deleteDefaultBtn = document.getElementById('delete-default-btn');
const emptyStateMsg = document.getElementById('empty-state-msg');
const cardMarkBar = document.getElementById('card-mark-bar');
const cardStarBtn = document.getElementById('card-star-btn');
const cardFlagBtn = document.getElementById('card-flag-btn');
const cardEditBtn = document.getElementById('card-edit-btn');
const cardDeleteBtn = document.getElementById('card-delete-btn');
const listFilterSection = document.getElementById('list-filter-section');
const listFilterBtns = document.querySelectorAll('.list-filter-btn');
const listCountInfoEl = document.getElementById('list-count-info');

// ==========================================================================
// 렌더링
// ==========================================================================
function renderCard() {
  const ordered = getOrderedSentences();
  const isEmpty = ordered.length === 0;

  emptyStateMsg.classList.toggle('hidden', !isEmpty);
  krTextEl.classList.toggle('hidden', isEmpty);
  prevBtn.disabled = isEmpty;
  checkBtn.disabled = isEmpty;
  nextBtn.disabled = isEmpty;
  if (isEmpty) {
    enTextEl.classList.add('hidden');
    cardEl.classList.remove('revealed');
    cardMarkBar.classList.add('hidden');
    return;
  }

  // 카드 화면에서 삭제 후 남은 문장 수보다 currentIndex가 커질 수 있어 범위 보정
  if (currentIndex >= ordered.length) {
    currentIndex = ordered.length - 1;
  }

  const sentence = ordered[currentIndex];
  localStorage.setItem(LAST_SENTENCE_ID_KEY, String(sentence.id));
  krTextEl.textContent = sentence.kr;
  enTextEl.textContent = sentence.en;

  enTextEl.classList.toggle('hidden', !revealed);
  cardEl.classList.toggle('revealed', revealed);
  checkBtn.classList.toggle('revealed', revealed);

  // 마킹 아이콘(중요/미암기)은 정답을 확인한 뒤에만 노출
  cardMarkBar.classList.toggle('hidden', !revealed);
  cardStarBtn.classList.toggle('active', sentence.important);
  cardFlagBtn.classList.toggle('active', sentence.unfamiliar);
}

// 중요/미암기 토글 시 정렬 기준에 따라 순서가 바뀔 수 있어, 같은 문장이
// 화면에 계속 보이도록 토글 후 그 문장의 새 위치로 currentIndex를 맞춰줌
function toggleCurrentSentenceFlag(toggleFn) {
  const ordered = getOrderedSentences();
  const sentence = ordered[currentIndex];
  if (!sentence) return;

  toggleFn(sentence.id);

  const newOrdered = getOrderedSentences();
  const newIndex = newOrdered.findIndex((s) => String(s.id) === String(sentence.id));
  if (newIndex !== -1) currentIndex = newIndex;

  renderCard();
  if (!listScreen.classList.contains('hidden')) {
    renderSentenceList();
  }
}

cardStarBtn.addEventListener('click', () => toggleCurrentSentenceFlag(toggleImportant));
cardFlagBtn.addEventListener('click', () => toggleCurrentSentenceFlag(toggleUnfamiliar));

// 카드 화면에서 바로 수정/삭제 (문장관리의 수정 모달·삭제 로직을 그대로 재사용)
cardEditBtn.addEventListener('click', () => {
  const sentence = getOrderedSentences()[currentIndex];
  if (!sentence) return;
  openAddModal(sentence);
});

cardDeleteBtn.addEventListener('click', () => {
  const sentence = getOrderedSentences()[currentIndex];
  if (!sentence) return;
  confirmDeleteSingle(sentence.id);
});

// ==========================================================================
// 이벤트 핸들러
// ==========================================================================
function goToSentence(index) {
  const total = getOrderedSentences().length;
  if (total === 0) {
    renderCard();
    return;
  }
  // 문장 목록의 처음/끝에서 순환
  currentIndex = (index + total) % total;
  revealed = false;
  renderCard();
}

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  cardScreen.classList.remove('hidden');

  // 마지막으로 보던 문장부터 이어서 시작 (그 문장이 삭제되는 등 못 찾으면 처음부터)
  const ordered = getOrderedSentences();
  const savedId = localStorage.getItem(LAST_SENTENCE_ID_KEY);
  const savedIndex = savedId ? ordered.findIndex((s) => String(s.id) === savedId) : -1;
  goToSentence(savedIndex !== -1 ? savedIndex : 0);
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
// 문장추가 모달: 새 문장을 넣는 3가지 방법(폼 입력/파일 가져오기/텍스트
// 붙여넣기)을 탭으로 통합. 문장관리·카드 화면에서 문장을 수정할 때도
// 같은 모달을 재사용하되(editingId가 있으면 수정 모드), 이때는 방법을
// 고를 필요가 없으므로 탭을 숨기고 폼만 노출한다.
// ==========================================================================
let editingId = null;
// 문장추가 화면은 카드 화면·문장관리 화면 양쪽에서 열릴 수 있어, 뒤로가기 시
// 원래 있던 화면으로 돌아가기 위해 연 시점의 화면을 기억해둠
let addModalReturnScreen = cardScreen;

function setAddModalTab(tab) {
  addModalTabBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  addTabForm.classList.toggle('hidden', tab !== 'form');
  addTabFile.classList.toggle('hidden', tab !== 'file');
  addTabPaste.classList.toggle('hidden', tab !== 'paste');
}

function openAddModal(sentence) {
  setAddModalTab('form');
  if (sentence) {
    editingId = sentence.id;
    addModalTitleEl.textContent = '문장 수정';
    addSubmitBtn.textContent = '저장';
    addKrInput.value = sentence.kr;
    addEnInput.value = sentence.en;
    addModalTabsEl.classList.add('hidden');
  } else {
    editingId = null;
    addModalTitleEl.textContent = '문장 추가';
    addSubmitBtn.textContent = '추가';
    addModalTabsEl.classList.remove('hidden');
  }
  addModalReturnScreen = listScreen.classList.contains('hidden') ? cardScreen : listScreen;
  addModalReturnScreen.classList.add('hidden');
  addModal.classList.remove('hidden');
}

function closeAddModal() {
  addModal.classList.add('hidden');
  addModalReturnScreen.classList.remove('hidden');
  addKrInput.value = '';
  addEnInput.value = '';
  pasteTextarea.value = '';
  importFileInput.value = '';
  editingId = null;
}

function refreshAfterAdd() {
  renderCard();
  if (!listScreen.classList.contains('hidden')) {
    renderSentenceList();
  }
}

addModalTabBtns.forEach((btn) => {
  btn.addEventListener('click', () => setAddModalTab(btn.dataset.tab));
});

addOpenBtn.addEventListener('click', () => openAddModal());
addBackBtn.addEventListener('click', closeAddModal);

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
  refreshAfterAdd();
});

// --- 파일 가져오기 탭 (CSV/TSV/TXT) ---
importTabOpenBtn.addEventListener('click', () => {
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
    closeAddModal();
    refreshAfterAdd();
  };
  reader.readAsText(file, 'UTF-8');
});

// --- 텍스트 붙여넣기 탭 (파일 저장 없이, 파일가져오기와 동일한 파서 재사용) ---
pasteSubmitBtn.addEventListener('click', () => {
  const parsed = parseSentencesText(pasteTextarea.value);
  parsed.forEach((s) => addSentence(s.kr, s.en));
  alert(`${parsed.length}개 문장을 추가했습니다.`);
  closeAddModal();
  refreshAfterAdd();
});

// ==========================================================================
// 문장 목록 화면 (수정/삭제)
// 기본: 별(즐겨찾기)/깃발(미암기) 토글 + 길게 누르면 해당 문장만 삭제
// 선택 모드: 상단 "선택"으로 진입, 체크박스로 여러 개 골라 한 번에 삭제
// ==========================================================================
const LIST_BACK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
const LIST_CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const LONG_PRESS_MS = 550;

let selecting = false;
let selectedIds = new Set();
let longPressTimer = null;
let longPressFiredId = null;
let filterMode = 'all';

// 정렬은 그대로 적용한 뒤, 필터 조건에 안 맞는 문장만 걸러냄 (정렬·필터는 독립적)
function getFilteredSentences() {
  const ordered = getOrderedSentences();
  if (filterMode === 'important') return ordered.filter((s) => s.important);
  if (filterMode === 'unfamiliar') return ordered.filter((s) => s.unfamiliar);
  return ordered;
}

function applyFilterMode(mode) {
  filterMode = mode;
  listFilterBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === mode);
  });
}

listFilterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    applyFilterMode(btn.dataset.filter);
    renderSentenceList();
  });
});

function updateListTopbar() {
  listTopbarEl.classList.toggle('selecting', selecting);
  listFilterSection.classList.toggle('hidden', selecting);

  if (selecting) {
    const n = selectedIds.size;
    listBackBtn.classList.add('text-mode');
    listBackBtn.textContent = '취소';
    listBackBtn.setAttribute('aria-label', '선택 취소');
    listTopbarTitleEl.textContent = n > 0 ? `${n}개 선택` : '문장 선택';
    listSelectBtn.classList.add('hidden');
    listBulkDeleteBtn.classList.remove('hidden');
    listBulkDeleteBtn.classList.toggle('enabled', n > 0);
  } else {
    listBackBtn.classList.remove('text-mode');
    listBackBtn.innerHTML = LIST_BACK_ICON;
    listBackBtn.setAttribute('aria-label', '뒤로가기');
    listTopbarTitleEl.textContent = '문장 관리';
    listSelectBtn.classList.remove('hidden');
    listBulkDeleteBtn.classList.add('hidden');
  }
}

function enterSelectMode() {
  selecting = true;
  selectedIds.clear();
  renderSentenceList();
  updateListTopbar();
}

function exitSelectMode() {
  selecting = false;
  selectedIds.clear();
  renderSentenceList();
  updateListTopbar();
}

function confirmDeleteSingle(id) {
  if (sentences.length <= 1) {
    alert('최소 1개의 문장은 있어야 합니다.');
    return;
  }
  const sentence = sentences.find((s) => String(s.id) === String(id));
  if (!sentence) return;
  if (!confirm(`"${sentence.kr}" 문장을 삭제하시겠습니까?`)) return;
  deleteSentence(id);
  renderSentenceList();
  renderCard();
}

// 필터별 개수 안내 문구 라벨
const FILTER_COUNT_LABELS = { all: '전체', important: '중요', unfamiliar: '미암기' };

function renderSentenceList() {
  sentenceListEl.innerHTML = '';

  const filtered = getFilteredSentences();
  listCountInfoEl.textContent = `${FILTER_COUNT_LABELS[filterMode]} ${filtered.length}개`;

  if (filtered.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'sentence-list-empty-msg';
    emptyMsg.textContent = '표시할 문장이 없습니다.';
    sentenceListEl.appendChild(emptyMsg);
    return;
  }

  filtered.forEach((s) => {
    const id = String(s.id);
    const item = document.createElement('div');
    item.className = 'sentence-list-item' + (selecting && selectedIds.has(id) ? ' checked' : '');
    item.dataset.id = id;

    if (selecting) {
      const checkbox = document.createElement('span');
      checkbox.className = 'sentence-checkbox';
      checkbox.innerHTML = LIST_CHECK_ICON;
      item.appendChild(checkbox);
    }

    const textWrap = document.createElement('div');
    textWrap.className = 'sentence-list-text';

    if (s.source === 'default') {
      const badge = document.createElement('span');
      badge.className = 'sentence-badge-default';
      badge.textContent = '기본';
      textWrap.appendChild(badge);
    }

    const krEl = document.createElement('p');
    krEl.className = 'sentence-list-kr';
    krEl.textContent = s.kr;

    const enEl = document.createElement('p');
    enEl.className = 'sentence-list-en';
    enEl.textContent = s.en;

    textWrap.appendChild(krEl);
    textWrap.appendChild(enEl);
    item.appendChild(textWrap);

    if (!selecting) {
      const actions = document.createElement('div');
      actions.className = 'sentence-list-actions';

      const starBtn = document.createElement('button');
      starBtn.type = 'button';
      starBtn.className = 'sentence-star-btn';
      starBtn.classList.toggle('active', s.important);
      starBtn.setAttribute('aria-label', '중요 표시');
      starBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

      const unfamiliarBtn = document.createElement('button');
      unfamiliarBtn.type = 'button';
      unfamiliarBtn.className = 'sentence-unfamiliar-btn';
      unfamiliarBtn.classList.toggle('active', s.unfamiliar);
      unfamiliarBtn.setAttribute('aria-label', '미암기 표시');
      unfamiliarBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>';

      actions.appendChild(starBtn);
      actions.appendChild(unfamiliarBtn);
      item.appendChild(actions);
    }

    sentenceListEl.appendChild(item);
  });
}

listOpenBtn.addEventListener('click', () => {
  cardScreen.classList.add('hidden');
  listScreen.classList.remove('hidden');
  selecting = false;
  selectedIds.clear();
  applyFilterMode('all');
  renderSentenceList();
  updateListTopbar();
});

listBackBtn.addEventListener('click', () => {
  if (selecting) {
    exitSelectMode();
    return;
  }
  listScreen.classList.add('hidden');
  cardScreen.classList.remove('hidden');
});

listSelectBtn.addEventListener('click', enterSelectMode);

listBulkDeleteBtn.addEventListener('click', () => {
  if (selectedIds.size === 0) return;
  const remaining = sentences.length - selectedIds.size;
  if (remaining < 1) {
    alert('최소 1개의 문장은 있어야 합니다.');
    return;
  }
  if (!confirm(`선택한 문장 ${selectedIds.size}개를 삭제하시겠습니까?`)) return;
  selectedIds.forEach((id) => deleteSentence(id));
  exitSelectMode();
  renderCard();
});

sentenceListEl.addEventListener('click', (e) => {
  const item = e.target.closest('.sentence-list-item');
  if (!item) return;
  const id = item.dataset.id;

  if (longPressFiredId === id) {
    longPressFiredId = null;
    return;
  }

  if (e.target.closest('.sentence-star-btn')) {
    toggleImportant(id);
    renderSentenceList();
    renderCard();
    return;
  }

  if (e.target.closest('.sentence-unfamiliar-btn')) {
    toggleUnfamiliar(id);
    renderSentenceList();
    return;
  }

  if (selecting) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
    renderSentenceList();
    updateListTopbar();
    return;
  }

  const sentence = sentences.find((s) => String(s.id) === id);
  if (sentence) openAddModal(sentence);
});

// 길게 누르기(약 0.5초) → 해당 문장만 바로 삭제 확인. 선택 모드 중에는 비활성화
sentenceListEl.addEventListener('pointerdown', (e) => {
  if (selecting) return;
  const item = e.target.closest('.sentence-list-item');
  if (!item) return;
  if (e.target.closest('.sentence-star-btn') || e.target.closest('.sentence-unfamiliar-btn')) return;

  const id = item.dataset.id;
  clearTimeout(longPressTimer);
  longPressTimer = setTimeout(() => {
    longPressFiredId = id;
    confirmDeleteSingle(id);
  }, LONG_PRESS_MS);
});

function cancelLongPress() {
  clearTimeout(longPressTimer);
}

sentenceListEl.addEventListener('pointerup', cancelLongPress);
sentenceListEl.addEventListener('pointerleave', cancelLongPress);
sentenceListEl.addEventListener('pointercancel', cancelLongPress);

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

// ==========================================================================
// 도움말 화면
// ==========================================================================
helpOpenBtn.addEventListener('click', () => {
  cardScreen.classList.add('hidden');
  helpScreen.classList.remove('hidden');
});

helpBackBtn.addEventListener('click', () => {
  helpScreen.classList.add('hidden');
  cardScreen.classList.remove('hidden');
});

// 도움말 아코디언: 대분류 헤더를 누르면 해당 항목만 펼치기/접기
document.querySelectorAll('.help-accordion-header').forEach((header) => {
  header.addEventListener('click', () => {
    const item = header.closest('.help-accordion-item');
    const content = document.getElementById(header.dataset.target);
    const isOpen = item.classList.toggle('open');
    content.classList.toggle('hidden', !isOpen);
    header.setAttribute('aria-expanded', String(isOpen));
  });
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
  randomOrder.length = 0;
  saveRandomOrder();
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
// 출제/정렬 순서 선택 UI (설정 화면)
// ==========================================================================
function applySortMode(mode) {
  sortMode = mode;
  sortOptionBtns.forEach((btn) => {
    const isActive = btn.dataset.sort === mode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', String(isActive));
  });
}

function loadSortMode() {
  const saved = localStorage.getItem(SORT_KEY);
  const mode = SORT_MODES.includes(saved) ? saved : DEFAULT_SORT_MODE;
  applySortMode(mode);
}

loadSortMode();

sortOptionBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.sort;
    // 랜덤순은 다시 선택할 때마다 새로 섞음(앱을 껐다 켜는 것만으로는 순서가 바뀌지 않음)
    if (mode === 'random') {
      shuffleRandomOrder();
    }
    localStorage.setItem(SORT_KEY, mode);
    applySortMode(mode);
    currentIndex = 0;
    revealed = false;
    renderCard();
    if (!listScreen.classList.contains('hidden')) {
      renderSentenceList();
    }
  });
});

// ==========================================================================
// 기본문장 관리 (숨기기 토글 / 일괄 삭제) — 설정 화면
// ==========================================================================
function applyHideDefaultToggle() {
  hideDefaultToggleBtn.classList.toggle('active', hideDefaultSentences);
  hideDefaultToggleBtn.setAttribute('aria-checked', String(hideDefaultSentences));
}

applyHideDefaultToggle();

hideDefaultToggleBtn.addEventListener('click', () => {
  hideDefaultSentences = !hideDefaultSentences;
  localStorage.setItem(HIDE_DEFAULT_KEY, String(hideDefaultSentences));
  applyHideDefaultToggle();
  currentIndex = 0;
  renderCard();
  if (!listScreen.classList.contains('hidden')) {
    renderSentenceList();
  }
});

deleteDefaultBtn.addEventListener('click', () => {
  const defaultSentences = sentences.filter((s) => s.source === 'default');
  if (defaultSentences.length === 0) {
    alert('삭제할 기본문장이 없습니다.');
    return;
  }
  const remaining = sentences.length - defaultSentences.length;
  // 개인 문장이 하나도 없어 전부 지우면 0개가 되는 경우: 막지 않고 안내용 기본문장 1개를 자동으로 남김
  const willBeEmpty = remaining < 1;
  const confirmMsg = willBeEmpty
    ? `기본문장 ${defaultSentences.length}개를 삭제하시겠습니까? 남은 문장이 없어 안내용 기본문장 1개가 자동으로 추가됩니다. 이 작업은 되돌릴 수 없습니다.`
    : `기본문장 ${defaultSentences.length}개를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`;
  if (!confirm(confirmMsg)) return;

  defaultSentences.forEach((s) => deleteSentence(s.id));

  if (willBeEmpty) {
    const placeholder = makeSentence('문장이 없습니다.', 'There are no sentences.', 'default');
    sentences.push(placeholder);
    randomOrder.push(String(placeholder.id));
    saveRandomOrder();
    saveSentences(sentences);
  }

  currentIndex = 0;
  renderCard();
  if (!listScreen.classList.contains('hidden')) {
    renderSentenceList();
  }
  alert(`기본문장 ${defaultSentences.length}개를 삭제했습니다.`);
});

// ==========================================================================
// 상단바 더보기 메뉴 (문장추가 / 문장관리 / 설정 / 처음부터)
// ==========================================================================
restartOpenBtn.addEventListener('click', () => {
  goToSentence(0);
});

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
