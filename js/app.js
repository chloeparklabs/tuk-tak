// ==========================================================================
// 샘플 문장 데이터 (임시 하드코딩 — 추후 구글시트 연동으로 대체 예정)
// ==========================================================================
const sentences = [
  { kr: '오늘 날씨가 어때?', en: 'How is the weather?' },
  { kr: '나는 커피를 좋아해.', en: 'I like coffee.' },
  { kr: '몇 시에 만날까?', en: 'What time should we meet?' },
  { kr: '이거 얼마예요?', en: 'How much is this?' },
  { kr: '조심히 들어가세요.', en: 'Get home safe.' },
];

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
