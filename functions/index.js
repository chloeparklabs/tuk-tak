// Cloud Functions 진입점 — 함수별 파일(generate-variations.js/ai-variation-usage.js)을
// 그대로 재노출만 한다(api/ 폴더 구조와 1:1 대응, 로직은 각 파일에 있음).
const { initializeApp, getApps } = require('firebase-admin/app');

if (getApps().length === 0) {
  initializeApp();
}

exports.generateVariations = require('./generate-variations').generateVariations;
exports.aiVariationUsage = require('./ai-variation-usage').aiVariationUsage;
