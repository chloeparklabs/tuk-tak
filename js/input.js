// PC 빠른 문장 입력 전용 페이지(input.html) 로직 — 카드 앱(js/app.js)과 독립적으로 동작.
// js/firebase-init.js가 노출하는 window.CloudSync, js/sentence-parser.js가 노출하는
// window.parseSentencesText만 공유해서 쓴다.

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmailEl = document.getElementById('user-email');
const inputRowsEl = document.getElementById('input-rows');
const saveBtn = document.getElementById('save-btn');
const statusTextEl = document.getElementById('status-text');
const fontSizeDecreaseBtn = document.getElementById('font-size-decrease');
const fontSizeIncreaseBtn = document.getElementById('font-size-increase');
const importFileInput = document.getElementById('import-file-input');
const importFileBtn = document.getElementById('import-file-btn');
const manageRowsEl = document.getElementById('manage-rows');
const manageCountEl = document.getElementById('manage-count');
const manageEmptyEl = document.getElementById('manage-empty');
const manageRefreshBtn = document.getElementById('manage-refresh-btn');

const TRASH_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';

// 입력하는 대로 내용에 맞춰 textarea 높이를 늘림(줄바꿈된 문장이 잘리지 않도록)
function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

// 창 크기 변경(브라우저 폭 조절, 기기 회전 등)으로 줄바꿈 수가 달라지면 높이도 다시 계산해야
// 함 — 그대로 두면 좁아진 폭 기준으로 늘어난 줄 수만큼 텍스트 아랫부분이 잘려 보임
let resizeGrowTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeGrowTimer);
  resizeGrowTimer = setTimeout(() => {
    document.querySelectorAll('.input-kr, .input-en').forEach(autoGrow);
  }, 100);
});

// 입력 글자 크기 조절 — 문장이 길어 타이핑할 때 글자를 크게 보고 싶은 경우를 위함(localStorage로 재방문해도 유지)
const FONT_SIZE_STORAGE_KEY = 'tuktak_input_font_size';
const FONT_SIZE_DEFAULT = 15;
const FONT_SIZE_MIN = 13;
const FONT_SIZE_MAX = 25;
const FONT_SIZE_STEP = 2;

function applyFontSize(size) {
  document.documentElement.style.setProperty('--input-font-size', `${size}px`);
  fontSizeDecreaseBtn.disabled = size <= FONT_SIZE_MIN;
  fontSizeIncreaseBtn.disabled = size >= FONT_SIZE_MAX;
  // 글자 크기가 바뀌면 기존 문장들의 줄바꿈 수도 달라질 수 있어 높이를 다시 계산
  document.querySelectorAll('.input-kr, .input-en').forEach(autoGrow);
}

const savedFontSize = parseInt(localStorage.getItem(FONT_SIZE_STORAGE_KEY), 10);
let currentFontSize = Number.isFinite(savedFontSize) ? savedFontSize : FONT_SIZE_DEFAULT;
applyFontSize(currentFontSize);

fontSizeDecreaseBtn.addEventListener('click', () => {
  currentFontSize = Math.max(FONT_SIZE_MIN, currentFontSize - FONT_SIZE_STEP);
  localStorage.setItem(FONT_SIZE_STORAGE_KEY, currentFontSize);
  applyFontSize(currentFontSize);
});
fontSizeIncreaseBtn.addEventListener('click', () => {
  currentFontSize = Math.min(FONT_SIZE_MAX, currentFontSize + FONT_SIZE_STEP);
  localStorage.setItem(FONT_SIZE_STORAGE_KEY, currentFontSize);
  applyFontSize(currentFontSize);
});

function makeSentence(kr, en) {
  return {
    id: Date.now() + Math.random(),
    kr,
    en,
    createdAt: new Date().toISOString(),
    important: false,
    unfamiliar: false,
  };
}

// 마지막 행에 뭔가 입력되면 새 빈 행을 자동으로 이어 붙임(문장추가 화면의 "빠른입력" 탭과 같은 방식)
function createInputRow() {
  const row = document.createElement('div');
  row.className = 'input-row';

  // <input> 대신 <textarea>를 써서 긴 문장이 줄바꿈되며 항상 전체가 보이게 함(가로 스크롤로 앞부분이 가려지는 문제 방지)
  const krInput = document.createElement('textarea');
  krInput.rows = 1;
  krInput.className = 'input-kr';
  krInput.placeholder = '한국어';

  const enInput = document.createElement('textarea');
  enInput.rows = 1;
  enInput.className = 'input-en';
  enInput.placeholder = '학습어';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'input-row-delete';
  deleteBtn.setAttribute('aria-label', '이 줄 삭제');
  deleteBtn.innerHTML = TRASH_ICON_SVG;

  const onInput = () => {
    autoGrow(krInput);
    autoGrow(enInput);
    if (row === inputRowsEl.lastElementChild && (krInput.value.trim() || enInput.value.trim())) {
      inputRowsEl.appendChild(createInputRow());
    }
  };
  krInput.addEventListener('input', onInput);
  enInput.addEventListener('input', onInput);

  // Enter 키로 한국어 → 영어(같은 행) → 다음 행 한국어로 자동 이동(엑셀 타이핑 흐름과 유사하게)
  krInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    enInput.focus();
  });
  enInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    let nextRow = row.nextElementSibling;
    if (!nextRow) {
      nextRow = createInputRow();
      inputRowsEl.appendChild(nextRow);
    }
    nextRow.querySelector('.input-kr').focus();
  });

  // 삭제 버튼은 Tab 순서에서 건너뛰게 함(한국어→영어→다음 행 흐름을 방해하지 않도록)
  deleteBtn.tabIndex = -1;

  deleteBtn.addEventListener('click', () => {
    if (inputRowsEl.children.length <= 1) {
      krInput.value = '';
      enInput.value = '';
      autoGrow(krInput);
      autoGrow(enInput);
      return;
    }
    row.remove();
  });

  row.appendChild(krInput);
  row.appendChild(enInput);
  row.appendChild(deleteBtn);
  return row;
}

function resetInputRows() {
  inputRowsEl.innerHTML = '';
  inputRowsEl.appendChild(createInputRow());
}
resetInputRows();

// 파일 가져오기(CSV/TSV/TXT) — 폰 앱과 같은 파서(js/sentence-parser.js의 window.parseSentencesText) 재사용.
// 불러온 문장은 즉시 저장하지 않고 입력 행 목록에 채워 넣어 검토할 수 있게 하며, 마지막 빈 행은
// 그대로 남겨둬 계속 이어서 입력할 수 있게 함
importFileBtn.addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', () => {
  const file = importFileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const parsed = window.parseSentencesText(String(reader.result));
    if (parsed.length === 0) {
      statusTextEl.textContent = '파일에서 문장을 찾지 못했습니다.';
      importFileInput.value = '';
      return;
    }

    const lastRow = inputRowsEl.lastElementChild;
    parsed.forEach((s) => {
      const row = createInputRow();
      const krInput = row.querySelector('.input-kr');
      const enInput = row.querySelector('.input-en');
      krInput.value = s.kr;
      enInput.value = s.en;
      inputRowsEl.insertBefore(row, lastRow);
      autoGrow(krInput);
      autoGrow(enInput);
    });

    statusTextEl.textContent = `${parsed.length}개 문장을 불러왔습니다. 확인 후 "변경사항 저장"을 눌러주세요.`;
    importFileInput.value = '';
  };
  reader.readAsText(file, 'UTF-8');
});

// 예전 버전 백업에는 important/unfamiliar 필드가 없을 수 있어 불러올 때 보정(카드 앱과 같은 규칙)
function normalizeSentence(s) {
  return { important: false, unfamiliar: false, ...s };
}

// 클라우드에 저장된 기존 문장 관리(조회+수정+삭제) — 데스크탑 빠른입력이 "던져 넣기만 하는
// 창구"가 아니라 실제로 관리까지 가능해야 의미가 있다는 판단으로 추가(2026-09-13). id로
// 원본(important/unfamiliar 등 이 화면에서 건드리지 않는 필드)을 찾아 저장 시 보존하기 위한 맵
let manageSentencesById = new Map();
// 저장 전 새로고침 시 편집 내용을 잃을 수 있다는 걸 경고하기 위한 "편집됨" 플래그(삭제도 포함)
let manageDirty = false;

function updateManageCount() {
  manageCountEl.textContent = manageRowsEl.children.length;
}

function createManageRow(sentence) {
  const row = document.createElement('div');
  row.className = 'input-row';
  row.dataset.id = String(sentence.id);

  const krInput = document.createElement('textarea');
  krInput.rows = 1;
  krInput.className = 'input-kr';
  krInput.value = sentence.kr;

  const enInput = document.createElement('textarea');
  enInput.rows = 1;
  enInput.className = 'input-en';
  enInput.value = sentence.en;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'input-row-delete';
  deleteBtn.setAttribute('aria-label', '이 문장 삭제');
  deleteBtn.innerHTML = TRASH_ICON_SVG;
  deleteBtn.tabIndex = -1;

  const onInput = () => {
    autoGrow(krInput);
    autoGrow(enInput);
    manageDirty = true;
  };
  krInput.addEventListener('input', onInput);
  enInput.addEventListener('input', onInput);

  // 관리 목록은 개수가 고정돼 있어(새 행 자동 추가 없음) Enter는 다음 칸/다음 행으로만 이동
  krInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    enInput.focus();
  });
  enInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    row.nextElementSibling?.querySelector('.input-kr')?.focus();
  });

  deleteBtn.addEventListener('click', () => {
    if (!confirm('이 문장을 목록에서 지울까요? "변경사항 저장"을 눌러야 실제로 반영됩니다.')) return;
    row.remove();
    manageDirty = true;
    updateManageCount();
  });

  row.appendChild(krInput);
  row.appendChild(enInput);
  row.appendChild(deleteBtn);
  return row;
}

async function loadManageList() {
  manageDirty = false;
  manageRowsEl.innerHTML = '';
  manageEmptyEl.classList.add('hidden');
  try {
    const existing = ((await window.CloudSync.restore()) || []).map(normalizeSentence);
    manageSentencesById = new Map(existing.map((s) => [String(s.id), s]));
    existing.forEach((s) => manageRowsEl.appendChild(createManageRow(s)));
    document.querySelectorAll('.input-kr, .input-en').forEach(autoGrow);
    if (existing.length === 0) {
      manageEmptyEl.textContent = '클라우드에 저장된 문장이 없습니다.';
      manageEmptyEl.classList.remove('hidden');
    }
  } catch (err) {
    manageEmptyEl.textContent = `문장을 불러오지 못했습니다: ${err.message}`;
    manageEmptyEl.classList.remove('hidden');
  }
  updateManageCount();
}

manageRefreshBtn.addEventListener('click', () => {
  if (manageDirty && !confirm('저장하지 않은 편집 내용이 있습니다. 새로고침하면 사라집니다. 계속할까요?')) return;
  loadManageList();
});

// 대시보드가 로그아웃→로그인 전환으로 처음 나타나는 순간에만 첫 입력칸에 자동 포커스
// (매 auth 상태 갱신마다 포커스를 뺏어가지 않도록 이전 로그인 상태와 비교)
let wasLoggedIn = false;
function renderAuthView(user) {
  const isLoggedIn = !!user;
  loginView.classList.toggle('hidden', isLoggedIn);
  dashboardView.classList.toggle('hidden', !isLoggedIn);
  if (isLoggedIn) {
    userEmailEl.textContent = user.email;
    loadManageList();
    if (!wasLoggedIn) {
      inputRowsEl.querySelector('.input-kr')?.focus();
    }
  }
  wasLoggedIn = isLoggedIn;
}

function setupCloudSync() {
  if (!window.CloudSync) {
    window.addEventListener('cloudsync-ready', setupCloudSync, { once: true });
    return;
  }
  window.CloudSync.onAuthChange(renderAuthView);
}
setupCloudSync();

loginBtn.addEventListener('click', async () => {
  try {
    await window.CloudSync.signIn();
  } catch (err) {
    alert(`로그인에 실패했습니다: ${err.message}`);
  }
});

logoutBtn.addEventListener('click', () => {
  window.CloudSync.signOut();
});

// 저장: (관리 섹션에서 편집/삭제한 기존 문장) + (새로 입력한 문장)을 합쳐 한 번에 저장.
// 관리 섹션이 이미 "클라우드의 현재 상태"를 그대로 보여주고 있어 별도로 restore를 다시
// 호출하지 않음(화면에 보이는 그대로가 저장 결과 — 최신 상태가 궁금하면 "새로고침" 사용).
// 폰에는 자동 반영되지 않으므로 "클라우드에서 복원"을 눌러야 함을 안내
saveBtn.addEventListener('click', async () => {
  const managedList = [...manageRowsEl.querySelectorAll('.input-row')]
    .map((row) => {
      const original = manageSentencesById.get(row.dataset.id) || {};
      return {
        ...original,
        kr: row.querySelector('.input-kr').value.trim(),
        en: row.querySelector('.input-en').value.trim(),
      };
    })
    .filter((s) => s.kr && s.en);

  const newSentences = [...inputRowsEl.querySelectorAll('.input-row')]
    .map((row) => ({
      kr: row.querySelector('.input-kr').value.trim(),
      en: row.querySelector('.input-en').value.trim(),
    }))
    .filter((s) => s.kr && s.en)
    .map((s) => makeSentence(s.kr, s.en));

  if (newSentences.length === 0 && !manageDirty) {
    statusTextEl.textContent = '저장할 변경사항이 없습니다.';
    return;
  }

  saveBtn.disabled = true;
  statusTextEl.textContent = '저장 중...';

  try {
    const finalList = [...managedList, ...newSentences];
    await window.CloudSync.backup(finalList);
    statusTextEl.textContent = `저장했습니다. (전체 ${finalList.length}개, 새 문장 ${newSentences.length}개) 폰에서 "클라우드에서 복원"을 눌러 확인하세요.`;
    resetInputRows();
    await loadManageList();
  } catch (err) {
    statusTextEl.textContent = `저장에 실패했습니다: ${err.message}`;
  } finally {
    saveBtn.disabled = false;
  }
});
