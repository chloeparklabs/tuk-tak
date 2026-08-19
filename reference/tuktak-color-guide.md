# TUK TAK 컬러 스타일가이드

> 2026-08-18 논의 반영. 배경색은 쿨톤 오프화이트, 텍스트/버튼 위계, 즐겨찾기 아이콘 컬러(Point Coral 대체)까지 확정된 버전.

## 1. Brand

| 이름 | 변수 | 값 | 용도 |
|---|---|---|---|
| Brand Blue | `--color-brand` | `#378ADD` | 앱 아이콘, 헤더/네비게이션 바, 주요 CTA 버튼(확인 - 탭 전), 로고 |
| Brand Navy | `--color-brand-dark` | `#0C447C` | 헤더 타이틀, 정답 텍스트, 확인 버튼(탭 후 상태), 진한 배경 위 아이콘 |
| Point Coral | `--color-point` | `#D85A30` | **2026-08-08부로 사용 보류.** 정답/즐겨찾기 표시는 `--color-accent-star`로 대체 |

## 2. Surface

| 이름 | 변수 | 값 | 용도 |
|---|---|---|---|
| Base White | `--color-base` | `#FFFFFF` | 순백이 필요한 표면(카드 등). 브랜드색 배경 위 고정 텍스트/아이콘은 변수 대신 리터럴 `#FFFFFF` 사용 |
| Surface | `--color-surface` | `#F4F6F8` | 기본 화면 배경. 순백 대신 쿨톤 오프화이트 — 장시간 시청 시 눈 피로 감소, 브랜드 블루와 색감 조화 |
| Surface Dark | `--color-surface-dark` | `#14171C` | 다크모드 배경 |
| Chip Answer | `--color-chip-answer` | `#E6F1FB` | 정답 텍스트 강조용 하이라이트 칩 배경 |

## 3. Text

본문/정답용, 브랜드 톤을 옅게 머금은 뉴트럴. 순검정 대신 사용해 눈 피로 감소.

| 이름 | 변수 | 값 | 대비(on Surface) | 용도 |
|---|---|---|---|---|
| Text Primary | `--color-text-primary` | `#1E2A38` | 13.4:1 | 본문, 정답 텍스트 |
| Text Secondary | `--color-text-secondary` | `#4B5D6B` | 6.4:1 | 보조 설명 텍스트 |
| Text Muted | `--color-text-muted` | `#7C8A96` | 3.3:1 | 캡션/힌트 — 큰 텍스트 전용, 소글씨 본문엔 사용 금지 |

## 4. Grayscale

완전 무채색(R=G=B, 채도 0%). 브랜드 색조를 배제해 문제 힌트 텍스트, 내비게이션 버튼, 비활성 아이콘 등에 사용. 배경(쿨톤)·브랜드(쿨톤)와 색조가 섞이지 않도록 의도적으로 중성 유지.

| 단계 | 값 | 비고 |
|---|---|---|
| `--gray-50` | `#F7F7F7` | |
| `--gray-100` | `#ECECEC` | |
| `--gray-200` | `#D9D9D9` | |
| `--gray-300` | `#C2C2C2` | |
| `--gray-400` | `#A6A6A6` | |
| `--gray-500` | `#8A8A8A` | |
| `--gray-600` | `#6B6B6B` | 한글 힌트 텍스트, 이전/다음 버튼 테두리·텍스트 — 대비 4.92:1 (AA 통과) |
| `--gray-700` | `#545454` | |
| `--gray-800` | `#3C3C3C` | |
| `--gray-900` | `#242424` | |

## 5. Accent (마킹 전용)

Point Coral 대체. 브랜드 블루(CTA)와 역할이 겹치지 않도록 별도 색상 사용.

| 이름 | 변수 | 값 | 용도 |
|---|---|---|---|
| Accent Star | `--color-accent-star` | `#BA7517` | 별표·깃발 활성 아이콘 |
| Accent Star Bg | `--color-accent-star-bg` | `#FAEEDA` | 활성 아이콘 원형 배경(칩) |

> 깃발 아이콘을 "복습 표시"가 아닌 "오류 신고"용으로 쓸 경우, 신고 접수 상태에만 `#E24B4A`(danger red) 적용 검토.

## 6. 컴포넌트 상태 규칙

- **확인 버튼**: 탭 전 = `--color-brand` 채움 / 탭 후 = `--color-brand-dark` 채움 + 체크 아이콘. 새 색상 추가 없이 브랜드 2색만으로 상태 구분.
- **이전 / 다음 버튼**: 텍스트·테두리 모두 `--gray-600` 통일 (아웃라인 스타일, 확인 버튼 대비 위계 낮춤).
- **별표 / 깃발 아이콘**: 기본 상태 `--gray-600`, 활성 상태 `--color-accent-star` + `--color-accent-star-bg` 원형 칩.

---

## CSS 전체 (복사용)

```css
:root {
  /* Brand */
  --color-brand: #378ADD;
  --color-brand-dark: #0C447C;
  --color-point: #D85A30; /* 2026-08-08 사용 보류 */

  /* Surface */
  --color-base: #FFFFFF;
  --color-surface: #F4F6F8;
  --color-surface-dark: #14171C;
  --color-chip-answer: #E6F1FB;

  /* Text */
  --color-text-primary: #1E2A38;
  --color-text-secondary: #4B5D6B;
  --color-text-muted: #7C8A96;

  /* Grayscale */
  --gray-50: #F7F7F7;
  --gray-100: #ECECEC;
  --gray-200: #D9D9D9;
  --gray-300: #C2C2C2;
  --gray-400: #A6A6A6;
  --gray-500: #8A8A8A;
  --gray-600: #6B6B6B;
  --gray-700: #545454;
  --gray-800: #3C3C3C;
  --gray-900: #242424;

  /* Accent */
  --color-accent-star: #BA7517;
  --color-accent-star-bg: #FAEEDA;
}
```
