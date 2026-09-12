// 공통 파서 (TSV/CSV/TXT → {kr, en}[])
// 폰 앱(js/app.js)의 파일 가져오기/텍스트 붙여넣기와 PC 빠른입력(input.html, js/input.js)의
// 파일 가져오기가 함께 쓴다. 일반 스크립트(모듈 아님)로 로드 — 최상위 function 선언은 자동으로
// window에 노출되므로, 같은 전역 스코프를 쓰는 app.js(일반 스크립트)는 바로 호출하고,
// 모듈 스크립트인 input.js는 window.parseSentencesText(...)로 접근한다.
const SENTENCE_PARSER_HEADER_KEYWORDS = ['한국어', 'kr', 'korean'];

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
    if (index === 0 && SENTENCE_PARSER_HEADER_KEYWORDS.includes(kr.toLowerCase())) return;

    result.push({ kr, en });
  });

  return result;
}
