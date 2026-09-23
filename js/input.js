// PC 빠른 문장 입력 전용 페이지(input.html) 로직 — 카드 앱(js/app.js)과 독립적으로 동작.
// js/firebase-init.js가 노출하는 window.CloudSync, js/sentence-parser.js가 노출하는
// window.parseSentencesText만 공유해서 쓴다.

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginBtn = document.getElementById('login-btn');
const headerAccountEl = document.getElementById('header-account');
const logoutBtn = document.getElementById('logout-btn');
const headerSettingsEl = document.getElementById('header-settings');
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const settingsPopoverEl = document.getElementById('settings-popover');
const userEmailEl = document.getElementById('user-email');
const inputRowsEl = document.getElementById('input-rows');
const saveBarEl = document.getElementById('save-bar');
const saveBtn = document.getElementById('save-btn');
const statusTextEl = document.getElementById('status-text');
const fontSizeDecreaseBtn = document.getElementById('font-size-decrease');
const fontSizeIncreaseBtn = document.getElementById('font-size-increase');
const fontSizeSampleEl = document.getElementById('font-size-sample');
const fontSizeDots = document.querySelectorAll('.font-size-dot');
const importFileInput = document.getElementById('import-file-input');
const importDropzoneEl = document.getElementById('import-dropzone');
const importResultEl = document.getElementById('import-result');
const pasteToggleBtn = document.getElementById('paste-toggle-btn');
const pastePanel = document.getElementById('paste-panel');
const pasteTextarea = document.getElementById('paste-textarea');
const pasteSubmitBtn = document.getElementById('paste-submit-btn');
const manageRowsEl = document.getElementById('manage-rows');
const manageCountEl = document.getElementById('manage-count');
const manageEmptyEl = document.getElementById('manage-empty');
const manageRefreshBtn = document.getElementById('manage-refresh-btn');
const manageToggleBtn = document.getElementById('manage-toggle-btn');
const manageContentEl = document.getElementById('manage-content');
const manageLoadMoreBtn = document.getElementById('manage-load-more-btn');
const modeSelectBtns = document.querySelectorAll('.mode-select-btn');

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

// 화면모드(시스템/라이트/다크) — 메인 앱(js/app.js)과 같은 방식. 다만 기본값은 메인 앱의
// 'light'가 아니라 'system'으로 둠 — 이 페이지는 원래부터 media query로 시스템 설정만
// 따르고 있었으므로, 수동 토글 도입 이전 사용자가 보던 화면과 기본 동작을 그대로 유지하기 위함
const THEME_STORAGE_KEY = 'tuktak_input_theme';
const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
let themeMode = 'system';

function resolveTheme(mode) {
  if (mode === 'system') return systemDarkQuery.matches ? 'dark' : 'light';
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

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
applyThemeMode(['system', 'light', 'dark'].includes(savedTheme) ? savedTheme : 'system');

modeSelectBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    localStorage.setItem(THEME_STORAGE_KEY, btn.dataset.mode);
    applyThemeMode(btn.dataset.mode);
  });
});

// 시스템 모드 선택 중에는 기기의 다크모드 설정이 바뀌면 이 페이지도 실시간으로 따라감
systemDarkQuery.addEventListener('change', () => {
  if (themeMode === 'system') {
    document.documentElement.setAttribute('data-theme', resolveTheme('system'));
  }
});

// 입력 글자 크기 조절 — 폰 앱 설정 화면(5단계 도트 + 스테퍼)과 같은 방식으로 통일(2026-09-23)
const FONT_SIZE_STORAGE_KEY = 'tuktak_input_font_size_index';
const FONT_SIZE_LEVELS = [14, 16, 18, 20, 22];
const DEFAULT_FONT_SIZE_INDEX = 3; // 18px

function applyFontSize(index) {
  const fontSizeIndex = Math.min(Math.max(index, 1), FONT_SIZE_LEVELS.length);
  const size = FONT_SIZE_LEVELS[fontSizeIndex - 1];

  document.documentElement.style.setProperty('--input-font-size', `${size}px`);
  fontSizeSampleEl.style.fontSize = `${size}px`;
  fontSizeDots.forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.index) === fontSizeIndex);
  });
  fontSizeDecreaseBtn.disabled = fontSizeIndex === 1;
  fontSizeIncreaseBtn.disabled = fontSizeIndex === FONT_SIZE_LEVELS.length;
  // 글자 크기가 바뀌면 기존 문장들의 줄바꿈 수도 달라질 수 있어 높이를 다시 계산
  document.querySelectorAll('.input-kr, .input-en').forEach(autoGrow);
  return fontSizeIndex;
}

const savedFontSizeIndex = parseInt(localStorage.getItem(FONT_SIZE_STORAGE_KEY), 10);
let currentFontSizeIndex = applyFontSize(
  FONT_SIZE_LEVELS[savedFontSizeIndex - 1] ? savedFontSizeIndex : DEFAULT_FONT_SIZE_INDEX
);

fontSizeDecreaseBtn.addEventListener('click', () => {
  currentFontSizeIndex = applyFontSize(currentFontSizeIndex - 1);
  localStorage.setItem(FONT_SIZE_STORAGE_KEY, currentFontSizeIndex);
});
fontSizeIncreaseBtn.addEventListener('click', () => {
  currentFontSizeIndex = applyFontSize(currentFontSizeIndex + 1);
  localStorage.setItem(FONT_SIZE_STORAGE_KEY, currentFontSizeIndex);
});

// 설정(톱니바퀴) 팝오버 — 지금은 입력 글자 크기 하나뿐이라 더보기 메뉴 대신 가벼운 팝오버로 노출
settingsToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = settingsPopoverEl.classList.contains('hidden');
  settingsPopoverEl.classList.toggle('hidden', !isHidden);
  settingsToggleBtn.setAttribute('aria-expanded', String(isHidden));
});

document.addEventListener('click', (e) => {
  if (settingsPopoverEl.classList.contains('hidden')) return;
  if (headerSettingsEl.contains(e.target)) return;
  settingsPopoverEl.classList.add('hidden');
  settingsToggleBtn.setAttribute('aria-expanded', 'false');
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
  enInput.placeholder = '영어';

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

// 파일 가져오기/텍스트 붙여넣기 전용 중복 검사(2026-09-15) — 같은 파일·텍스트를 실수로
// 반복해서 가져올 때 완전히 같은 문장이 계속 쌓이는 문제 방지. "클라우드에 저장된 문장"
// 관리 목록(수정 전 원본 포함)과 아직 저장 전인 "새 문장 추가" 행 둘 다와 비교(한국어+영어
// 텍스트 trim 후 완전일치, 28번 클라우드 병합 로직과 동일 기준)
function isDuplicateInputSentence(kr, en) {
  const krTrim = kr.trim();
  const enTrim = en.trim();
  const rowMatches = (row) => {
    const k = (row.querySelector('.input-kr')?.value || '').trim();
    const e = (row.querySelector('.input-en')?.value || '').trim();
    return k === krTrim && e === enTrim;
  };
  return [...manageRowsEl.querySelectorAll('.input-row')].some(rowMatches)
    || [...inputRowsEl.querySelectorAll('.input-row')].some(rowMatches);
}

// 파일 가져오기(CSV/TSV/TXT)·텍스트 붙여넣기 공통 — 폰 앱과 같은 파서
// (js/sentence-parser.js의 window.parseSentencesText) 재사용. 불러온 문장은 즉시 저장하지
// 않고 입력 행 목록에 채워 넣어 검토할 수 있게 하며, 마지막 빈 행은 그대로 남겨둬 계속
// 이어서 입력할 수 있게 함. 중복 문장은 건너뛰고 { addedCount, skippedCount }를 반환
function insertParsedRows(parsed) {
  const lastRow = inputRowsEl.lastElementChild;
  let addedCount = 0;
  let skippedCount = 0;
  parsed.forEach((s) => {
    if (isDuplicateInputSentence(s.kr, s.en)) {
      skippedCount++;
      return;
    }
    const row = createInputRow();
    const krInput = row.querySelector('.input-kr');
    const enInput = row.querySelector('.input-en');
    krInput.value = s.kr;
    enInput.value = s.en;
    inputRowsEl.insertBefore(row, lastRow);
    autoGrow(krInput);
    autoGrow(enInput);
    addedCount++;
  });
  return { addedCount, skippedCount };
}

// 가져오기 결과 안내 문구 공통 생성(파일 가져오기/텍스트 붙여넣기 공유)
function buildImportStatusText(addedCount, skippedCount) {
  if (addedCount === 0 && skippedCount > 0) {
    return `가져온 문장이 모두 이미 있는 문장이라 추가하지 않았어요. (${skippedCount}개 건너뜀)`;
  }
  return skippedCount > 0
    ? `${addedCount}개 문장을 불러왔습니다. (이미 있는 문장 ${skippedCount}개는 건너뛰었어요) 확인 후 "변경사항 저장"을 눌러주세요.`
    : `${addedCount}개 문장을 불러왔습니다. 확인 후 "변경사항 저장"을 눌러주세요.`;
}

// 드롭존 바로 아래에 가져오기 결과를 표시(저장 상태를 알리는 하단 status-text와는 별개)
function showImportResult(text) {
  importResultEl.textContent = text;
  importResultEl.classList.remove('hidden');
}

function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = window.parseSentencesText(String(reader.result));
    if (parsed.length === 0) {
      showImportResult('파일에서 문장을 찾지 못했습니다.');
      return;
    }
    const { addedCount, skippedCount } = insertParsedRows(parsed);
    showImportResult(buildImportStatusText(addedCount, skippedCount));
  };
  reader.readAsText(file, 'UTF-8');
}

importDropzoneEl.addEventListener('click', () => {
  importFileInput.click();
});

importDropzoneEl.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  importFileInput.click();
});

['dragenter', 'dragover'].forEach((evt) => {
  importDropzoneEl.addEventListener(evt, (e) => {
    e.preventDefault();
    importDropzoneEl.classList.add('dragover');
  });
});

['dragleave', 'dragend'].forEach((evt) => {
  importDropzoneEl.addEventListener(evt, () => {
    importDropzoneEl.classList.remove('dragover');
  });
});

importDropzoneEl.addEventListener('drop', (e) => {
  e.preventDefault();
  importDropzoneEl.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleImportFile(file);
});

importFileInput.addEventListener('change', () => {
  const file = importFileInput.files[0];
  if (!file) return;
  handleImportFile(file);
  importFileInput.value = '';
});

// 텍스트 붙여넣기 — 카메라로 찍은 문장을 AI가 텍스트로 만들어준 결과 등을 파일로 저장하지
// 않고 바로 붙여넣을 때 유용(2026-09-14). 버튼으로 패널을 펼치고/접고, 가져오면 패널은
// 다시 접히고 내용은 비움(같은 텍스트를 실수로 중복 반영하지 않도록)
pasteToggleBtn.addEventListener('click', () => {
  const isHidden = pastePanel.classList.contains('hidden');
  pastePanel.classList.toggle('hidden', !isHidden);
  pasteToggleBtn.setAttribute('aria-expanded', String(isHidden));
  if (isHidden) pasteTextarea.focus();
});

pasteSubmitBtn.addEventListener('click', () => {
  const parsed = window.parseSentencesText(pasteTextarea.value);
  if (parsed.length === 0) {
    showImportResult('붙여넣은 텍스트에서 문장을 찾지 못했습니다.');
    return;
  }

  const { addedCount, skippedCount } = insertParsedRows(parsed);
  showImportResult(buildImportStatusText(addedCount, skippedCount));
  pasteTextarea.value = '';
  pastePanel.classList.add('hidden');
  pasteToggleBtn.setAttribute('aria-expanded', 'false');
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

// 문장이 많을 때 한꺼번에 다 그리면 스크롤바 썸이 너무 작아져 다루기 어려워짐(2026-09-14
// 사용자 피드백) — 처음엔 이 개수만 보여주고 "더보기"로 이어서 노출. 저장/병합 로직은
// 항상 .input-row 전체를 querySelectorAll로 찾으므로, 숨긴 행도 DOM에는 그대로 남겨둠(제거 아님)
const MANAGE_PAGE_SIZE = 20;
let manageVisibleCount = 0;

function updateManageLoadMoreBtn(total) {
  const remaining = total - manageVisibleCount;
  if (remaining <= 0) {
    manageLoadMoreBtn.classList.add('hidden');
    return;
  }
  manageLoadMoreBtn.textContent = `더보기 (${remaining}개 더 있음)`;
  manageLoadMoreBtn.classList.remove('hidden');
}

manageLoadMoreBtn.addEventListener('click', () => {
  const hiddenRows = manageRowsEl.querySelectorAll('.input-row.hidden');
  const nextBatch = Array.from(hiddenRows).slice(0, MANAGE_PAGE_SIZE);
  nextBatch.forEach((row) => {
    row.classList.remove('hidden');
    // 숨겨져 있던 동안(display:none) textarea의 scrollHeight가 0으로 잘못 잡히므로
    // 실제로 보이게 된 지금 다시 계산해야 함(관리 섹션 펼침 토글과 같은 이유)
    row.querySelectorAll('.input-kr, .input-en').forEach(autoGrow);
  });
  manageVisibleCount += nextBatch.length;
  updateManageLoadMoreBtn(manageRowsEl.children.length);
});

async function loadManageList() {
  manageDirty = false;
  manageRowsEl.innerHTML = '';
  manageEmptyEl.classList.add('hidden');
  try {
    const existing = ((await window.CloudSync.restore()) || []).map(normalizeSentence);
    manageSentencesById = new Map(existing.map((s) => [String(s.id), s]));
    existing.forEach((s, index) => {
      const row = createManageRow(s);
      if (index >= MANAGE_PAGE_SIZE) row.classList.add('hidden');
      manageRowsEl.appendChild(row);
    });
    manageVisibleCount = Math.min(MANAGE_PAGE_SIZE, existing.length);
    updateManageLoadMoreBtn(existing.length);
    manageRowsEl.querySelectorAll('.input-row:not(.hidden) .input-kr, .input-row:not(.hidden) .input-en')
      .forEach(autoGrow);
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

// 목록은 접힌 상태에서도 로그인 시점에 이미 불러와져 있음(저장 시 이 목록이 그대로 반영돼야
// 하므로) — 다만 접혀있는(display:none) 동안 계산된 textarea 높이는 0으로 잘못 잡히므로
// 펼칠 때마다 다시 계산해줘야 함
manageToggleBtn.addEventListener('click', () => {
  const isExpanded = manageToggleBtn.getAttribute('aria-expanded') === 'true';
  manageToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
  manageContentEl.classList.toggle('hidden', isExpanded);
  if (!isExpanded) {
    manageRowsEl.querySelectorAll('.input-kr, .input-en').forEach(autoGrow);
  }
});

// 대시보드가 로그아웃→로그인 전환으로 처음 나타나는 순간에만 첫 입력칸에 자동 포커스
// (매 auth 상태 갱신마다 포커스를 뺏어가지 않도록 이전 로그인 상태와 비교)
let wasLoggedIn = false;
function renderAuthView(user) {
  const isLoggedIn = !!user;
  loginView.classList.toggle('hidden', isLoggedIn);
  dashboardView.classList.toggle('hidden', !isLoggedIn);
  saveBarEl.classList.toggle('hidden', !isLoggedIn);
  loginBtn.classList.toggle('hidden', isLoggedIn);
  headerAccountEl.classList.toggle('hidden', !isLoggedIn);
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
// 2026-09-14 방향 확정("저장은 항상 병합") → 같은 날 구현: 이 페이지를 연 시점의 스냅샷
// (manageSentencesById)만 기준으로 통째로 덮어쓰면, 그 사이 폰에서 따로 추가/수정한 문장이
// 조용히 사라질 수 있음(동시편집 유실 위험) — 저장 직전에 클라우드를 한 번 더 불러와
// "이 페이지에서 편집/삭제한 항목"의 의도만 반영하고, 이 페이지가 모르는(다른 기기가 그 사이
// 추가한) 항목은 그대로 보존하는 방식으로 병합. 폰에는 자동 반영되지 않으므로
// "클라우드에서 복원"을 눌러야 함을 안내
saveBtn.addEventListener('click', async () => {
  const editedById = new Map();
  manageRowsEl.querySelectorAll('.input-row').forEach((row) => {
    editedById.set(row.dataset.id, {
      kr: row.querySelector('.input-kr').value.trim(),
      en: row.querySelector('.input-en').value.trim(),
    });
  });
  // 관리 목록을 불러온 시점엔 있었는데 지금 화면엔 없는 id = 이 페이지에서 명시적으로 삭제한 것
  const deletedIds = new Set(
    [...manageSentencesById.keys()].filter((id) => !editedById.has(id))
  );

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
    // 저장 직전에 클라우드 최신 상태를 다시 불러옴 — 이 페이지를 연 뒤 다른 기기(폰)가
    // 추가/수정했을 수 있는 항목까지 반영하기 위함(레이스 컨디션 최소화)
    const freshCloud = ((await window.CloudSync.restore()) || []).map(normalizeSentence);
    const managedList = [];
    freshCloud.forEach((cs) => {
      const id = String(cs.id);
      if (deletedIds.has(id)) return; // 이 페이지에서 명시적으로 삭제한 항목은 제외
      const edit = editedById.get(id);
      if (edit) {
        if (edit.kr && edit.en) managedList.push({ ...cs, kr: edit.kr, en: edit.en });
        // 편집 중 칸을 비웠다면 삭제 의도로 보고 제외(기존 필터 규칙과 동일)
      } else {
        // 이 페이지의 관리 목록을 불러온 뒤 다른 기기가 새로 추가/변경한 항목 — 그대로 보존
        managedList.push(cs);
      }
    });

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
