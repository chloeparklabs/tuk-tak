// tips.html 전용 스크립트 — Google 로그인 상태에 따라 input.html 바로가기를 노출한다.
// 여기서는 로그인 여부만 확인(이 버튼 자체는 단순 링크라 우회해도 위험 없음) — 실제 purchased
// 게이팅은 input.html 쪽(js/input.js renderAuthView)에서 처리, 미구매면 안내 화면만 보여줌
const loginBtn = document.getElementById('login-btn');
const headerAccountEl = document.getElementById('header-account');
const userEmailEl = document.getElementById('user-email');
const inputLinkEl = document.getElementById('input-link');
const logoutBtn = document.getElementById('logout-btn');

function renderAuthView(user) {
  const isLoggedIn = !!user;
  loginBtn.classList.toggle('hidden', isLoggedIn);
  headerAccountEl.classList.toggle('hidden', !isLoggedIn);
  inputLinkEl.classList.toggle('hidden', !isLoggedIn);
  if (isLoggedIn) {
    userEmailEl.textContent = user.email;
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
