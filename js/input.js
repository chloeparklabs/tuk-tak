// PC 빠른 문장 입력 전용 페이지(input.html) 로직 — 카드 앱(js/app.js)과 독립적으로 동작.
// js/firebase-init.js가 노출하는 window.CloudSync만 공유해서 쓴다.

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmailEl = document.getElementById('user-email');
const cloudCountEl = document.getElementById('cloud-count');
const inputRowsEl = document.getElementById('input-rows');
const saveBtn = document.getElementById('save-btn');
const statusTextEl = document.getElementById('status-text');

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

  const krInput = document.createElement('input');
  krInput.type = 'text';
  krInput.className = 'input-kr';
  krInput.placeholder = '한국어';

  const enInput = document.createElement('input');
  enInput.type = 'text';
  enInput.className = 'input-en';
  enInput.placeholder = '영어';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'input-row-delete';
  deleteBtn.setAttribute('aria-label', '이 줄 삭제');
  deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';

  const onInput = () => {
    if (row === inputRowsEl.lastElementChild && (krInput.value.trim() || enInput.value.trim())) {
      inputRowsEl.appendChild(createInputRow());
    }
  };
  krInput.addEventListener('input', onInput);
  enInput.addEventListener('input', onInput);

  deleteBtn.addEventListener('click', () => {
    if (inputRowsEl.children.length <= 1) {
      krInput.value = '';
      enInput.value = '';
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

async function loadCloudCount() {
  cloudCountEl.textContent = '클라우드 백업 확인 중...';
  try {
    const existing = (await window.CloudSync.restore()) || [];
    cloudCountEl.textContent = `현재 클라우드에 문장 ${existing.length}개 저장돼 있음`;
  } catch (err) {
    cloudCountEl.textContent = '';
  }
}

function renderAuthView(user) {
  loginView.classList.toggle('hidden', !!user);
  dashboardView.classList.toggle('hidden', !user);
  if (user) {
    userEmailEl.textContent = user.email;
    loadCloudCount();
  }
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

// 저장: 기존 클라우드 백업을 먼저 불러와 새로 입력한 문장을 뒤에 합친 뒤 다시 저장(덮어쓰기로 인한
// 기존 백업 데이터 유실 방지). 폰에는 자동 반영되지 않으므로 "클라우드에서 복원"을 눌러야 함을 안내
saveBtn.addEventListener('click', async () => {
  const rows = [...inputRowsEl.querySelectorAll('.input-row')];
  const pairs = rows
    .map((row) => ({
      kr: row.querySelector('.input-kr').value.trim(),
      en: row.querySelector('.input-en').value.trim(),
    }))
    .filter((s) => s.kr && s.en);

  if (pairs.length === 0) {
    statusTextEl.textContent = '입력한 문장이 없습니다.';
    return;
  }

  saveBtn.disabled = true;
  statusTextEl.textContent = '저장 중...';

  try {
    const existing = (await window.CloudSync.restore()) || [];
    const merged = [...existing, ...pairs.map((s) => makeSentence(s.kr, s.en))];
    await window.CloudSync.backup(merged);
    statusTextEl.textContent = `${pairs.length}개 문장을 클라우드에 저장했습니다. 폰에서 "클라우드에서 복원"을 눌러 확인하세요.`;
    resetInputRows();
    cloudCountEl.textContent = `현재 클라우드에 문장 ${merged.length}개 저장돼 있음`;
  } catch (err) {
    statusTextEl.textContent = `저장에 실패했습니다: ${err.message}`;
  } finally {
    saveBtn.disabled = false;
  }
});
