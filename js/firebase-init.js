// 클라우드 백업/동기화(체크리스트 18번) — Firebase Auth(Google 로그인) + Firestore 연동
// 이 파일만 ES 모듈(type="module")로 로드되고, js/app.js는 기존처럼 일반 스크립트로 유지되므로
// window.CloudSync 객체로 필요한 기능만 노출해 app.js에서 가져다 쓴다.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

// 클라이언트에 공개돼도 되는 값(실제 보안은 Firestore 보안 규칙이 담당)
const firebaseConfig = {
  apiKey: 'AIzaSyDA4tdX8bKBiSgPfXOI6jLhVoym4igQ9P0',
  authDomain: 'tuk-tak-2c172.firebaseapp.com',
  projectId: 'tuk-tak-2c172',
  storageBucket: 'tuk-tak-2c172.firebasestorage.app',
  messagingSenderId: '206884017307',
  appId: '1:206884017307:web:8555e9988066fa88fd223e',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

async function backupSentences(sentenceList) {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');
  await setDoc(doc(db, 'users', user.uid), {
    sentences: sentenceList,
    updatedAt: serverTimestamp(),
  });
}

async function restoreSentences() {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return Array.isArray(data.sentences) ? data.sentences : null;
}

// 클라우드 백업 삭제(체크리스트 18번 보완 3번) — 이 기기의 로컬 문장에는 영향 없이,
// Firestore에 저장된 백업 문서만 삭제한다. Google Play "계정 및 데이터 자기서비스 삭제" 정책 대비 목적도 있음
async function deleteBackup() {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');
  await deleteDoc(doc(db, 'users', user.uid));
}

window.CloudSync = {
  signIn: () => signInWithPopup(auth, googleProvider),
  signOut: () => signOut(auth),
  onAuthChange: (callback) => onAuthStateChanged(auth, callback),
  backup: backupSentences,
  restore: restoreSentences,
  deleteBackup,
  getCurrentUser: () => auth.currentUser,
  // 15-2 유료판: 서버리스 함수 호출 시 본인 확인용 ID 토큰(Firebase Admin SDK가 검증)
  getIdToken: () => {
    if (!auth.currentUser) return Promise.reject(new Error('로그인이 필요합니다.'));
    return auth.currentUser.getIdToken();
  },
};

// js/app.js는 일반 스크립트라 이 모듈보다 먼저 실행될 수 있어(모듈 스크립트는
// 파싱 완료 후 실행됨), window.CloudSync 준비 완료를 알리는 이벤트를 함께 쏴준다.
window.dispatchEvent(new Event('cloudsync-ready'));
