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

// ==========================================================================
// 15-1 문장변형 체험판 데이터 (2026-08-25 콘텐츠 확정, reference/문장변형_체험판_콘텐츠_초안.md 기준)
// 문장 10개 고정 목록 — 사용자가 직접 넣은 문장(sentences)과는 별개의 정적 콘텐츠라 DEFAULT_SENTENCES와 무관
// 카테고리는 문장마다 자연스러운 것만 선별(전부 5종은 아님) — label 순서가 화면 노출 순서
// ==========================================================================
const VARIATION_SENTENCES = [
  {
    kr: '나 피곤해.', en: "I'm tired.",
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나 피곤해.', en: "I'm tired." },
        { tag: '과거', kr: '나 피곤했어.', en: 'I was tired.' },
        { tag: '미래', kr: '나 피곤할 거야.', en: 'I will be tired.' },
        { tag: '현재완료', kr: '나 계속 피곤했어.', en: "I've been tired." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너 피곤하구나.', en: "You're tired." },
        { tag: '3인칭 단수', kr: '그녀는 피곤해.', en: "She's tired." },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리 피곤해.', en: "We're tired." },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나 안 피곤해.', en: "I'm not tired." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너 피곤해?', en: 'Are you tired?' },
      ] },
    ],
  },
  {
    kr: '나는 집에서 일해.', en: 'I work from home.',
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나는 집에서 일해.', en: 'I work from home.' },
        { tag: '과거', kr: '나는 집에서 일했어.', en: 'I worked from home.' },
        { tag: '미래', kr: '나는 집에서 일할 거야.', en: 'I will work from home.' },
        { tag: '현재완료', kr: '나는 집에서 일해왔어.', en: "I've worked from home." },
      ] },
      { label: '진행형', items: [
        { tag: '진행형', kr: '나는 오늘 집에서 일하고 있어.', en: "I'm working from home today." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너는 집에서 일하는구나.', en: 'You work from home.' },
        { tag: '3인칭 단수', kr: '그는 집에서 일해.', en: 'He works from home.' },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리는 집에서 일해.', en: 'We work from home.' },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나는 집에서 일 안 해.', en: "I don't work from home." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너는 집에서 일해?', en: 'Do you work from home?' },
      ] },
    ],
  },
  {
    kr: '나 그거 좋아해.', en: 'I like it.',
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나 그거 좋아해.', en: 'I like it.' },
        { tag: '과거', kr: '나 그거 좋아했어.', en: 'I liked it.' },
        { tag: '미래', kr: '나 그거 좋아할 거야.', en: 'I will like it.' },
        { tag: '현재완료', kr: '나 그거 계속 좋아했어.', en: "I've liked it." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너 그거 좋아하는구나.', en: 'You like it.' },
        { tag: '3인칭 단수', kr: '그는 그거 좋아해.', en: 'He likes it.' },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리 그거 좋아해.', en: 'We like it.' },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나 그거 안 좋아해.', en: "I don't like it." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너 그거 좋아해?', en: 'Do you like it?' },
      ] },
    ],
  },
  {
    kr: '나는 요즘 스트레스를 많이 받아.', en: "I've been really stressed lately.",
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나 스트레스 많이 받아.', en: "I'm really stressed." },
        { tag: '과거', kr: '나 스트레스 많이 받았어.', en: 'I was really stressed.' },
        { tag: '미래', kr: '나 스트레스 많이 받을 거야.', en: 'I will be really stressed.' },
        { tag: '현재완료', kr: '나는 요즘 스트레스를 많이 받아.', en: "I've been really stressed lately." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너 요즘 스트레스 많이 받는구나.', en: "You've been really stressed lately." },
        { tag: '3인칭 단수', kr: '그녀는 요즘 스트레스 많이 받아.', en: "She's been really stressed lately." },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리 요즘 스트레스 많이 받아.', en: "We've been really stressed lately." },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나 요즘 그렇게 스트레스 받진 않아.', en: "I haven't been that stressed lately." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너 요즘 스트레스 받아?', en: 'Have you been stressed lately?' },
      ] },
    ],
  },
  {
    kr: '나는 오늘 회의가 있어.', en: 'I have a meeting today.',
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나는 오늘 회의가 있어.', en: 'I have a meeting today.' },
        { tag: '과거', kr: '나는 오늘 회의가 있었어.', en: 'I had a meeting today.' },
        { tag: '미래', kr: '나는 오늘 회의가 있을 거야.', en: 'I will have a meeting today.' },
      ] },
      { label: '진행형', items: [
        { tag: '진행형', kr: '나 오늘 회의하고 있어.', en: "I'm having a meeting today." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너 오늘 회의가 있구나.', en: 'You have a meeting today.' },
        { tag: '3인칭 단수', kr: '그녀는 오늘 회의가 있어.', en: 'She has a meeting today.' },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리는 오늘 회의가 있어.', en: 'We have a meeting today.' },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나는 오늘 회의가 없어.', en: "I don't have a meeting today." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너 오늘 회의 있어?', en: 'Do you have a meeting today?' },
      ] },
    ],
  },
  {
    kr: '나는 네 말에 동의해.', en: 'I agree with you.',
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나는 네 말에 동의해.', en: 'I agree with you.' },
        { tag: '과거', kr: '나는 네 말에 동의했어.', en: 'I agreed with you.' },
        { tag: '미래', kr: '나는 네 말에 동의할 거야.', en: 'I will agree with you.' },
        { tag: '현재완료', kr: '나는 네 말에 계속 동의해왔어.', en: "I've agreed with you." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너는 내 말에 동의하는구나.', en: 'You agree with me.' },
        { tag: '3인칭 단수', kr: '그녀는 네 말에 동의해.', en: 'She agrees with you.' },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리는 네 말에 동의해.', en: 'We agree with you.' },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나는 네 말에 동의 안 해.', en: "I don't agree with you." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너 내 말에 동의해?', en: 'Do you agree with me?' },
      ] },
    ],
  },
  {
    kr: '나는 아침에 과일을 자주 먹어.', en: 'I often eat fruit in the morning.',
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나는 아침에 과일을 자주 먹어.', en: 'I often eat fruit in the morning.' },
        { tag: '과거', kr: '나는 아침에 과일을 자주 먹었어.', en: 'I often ate fruit in the morning.' },
        { tag: '미래', kr: '나는 아침에 과일을 자주 먹을 거야.', en: 'I will often eat fruit in the morning.' },
        { tag: '현재완료', kr: '나는 아침에 과일을 자주 먹어왔어.', en: "I've often eaten fruit in the morning." },
      ] },
      { label: '진행형', items: [
        { tag: '진행형', kr: '나 지금 과일 먹고 있어.', en: "I'm eating fruit right now." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너는 아침에 과일을 자주 먹는구나.', en: 'You often eat fruit in the morning.' },
        { tag: '3인칭 단수', kr: '그는 아침에 과일을 자주 먹어.', en: 'He often eats fruit in the morning.' },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리는 아침에 과일을 자주 먹어.', en: 'We often eat fruit in the morning.' },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나는 아침에 과일을 자주 먹지는 않아.', en: "I don't often eat fruit in the morning." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너는 아침에 과일을 자주 먹어?', en: 'Do you often eat fruit in the morning?' },
      ] },
    ],
  },
  {
    kr: '나는 비행기 타는 걸 무서워해.', en: "I'm afraid of flying.",
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나는 비행기 타는 걸 무서워해.', en: "I'm afraid of flying." },
        { tag: '과거', kr: '나는 비행기 타는 걸 무서워했어.', en: 'I was afraid of flying.' },
        { tag: '미래', kr: '나는 비행기 타는 걸 무서워할 거야.', en: 'I will be afraid of flying.' },
        { tag: '현재완료', kr: '나는 비행기 타는 걸 계속 무서워했어.', en: "I've been afraid of flying." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너는 비행기 타는 걸 무서워하는구나.', en: "You're afraid of flying." },
        { tag: '3인칭 단수', kr: '그녀는 비행기 타는 걸 무서워해.', en: "She's afraid of flying." },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리는 비행기 타는 걸 무서워해.', en: "We're afraid of flying." },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나는 비행기 타는 거 안 무서워해.', en: "I'm not afraid of flying." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너는 비행기 타는 거 무서워해?', en: 'Are you afraid of flying?' },
      ] },
    ],
  },
  {
    kr: '요즘 날씨가 계속 흐려.', en: 'The weather has been cloudy lately.',
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '오늘 날씨가 흐려.', en: 'The weather is cloudy today.' },
        { tag: '과거', kr: '어제 날씨가 흐렸어.', en: 'The weather was cloudy yesterday.' },
        { tag: '미래', kr: '내일 날씨가 흐릴 거야.', en: 'The weather will be cloudy tomorrow.' },
        { tag: '현재완료', kr: '요즘 날씨가 계속 흐려.', en: 'The weather has been cloudy lately.' },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '요즘 날씨가 흐리지 않았어.', en: "The weather hasn't been cloudy lately." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '요즘 날씨가 계속 흐려?', en: 'Has the weather been cloudy lately?' },
      ] },
    ],
  },
  {
    kr: '나 어제 그를 봤어.', en: 'I saw him yesterday.',
    categories: [
      { label: '시제', items: [
        { tag: '현재', kr: '나 그를 매일 봐.', en: 'I see him every day.' },
        { tag: '과거', kr: '나 어제 그를 봤어.', en: 'I saw him yesterday.' },
        { tag: '미래', kr: '나 내일 그를 볼 거야.', en: 'I will see him tomorrow.' },
        { tag: '현재완료', kr: '나 그를 전에 본 적 있어.', en: "I've seen him before." },
      ] },
      { label: '인칭', items: [
        { tag: '2인칭', kr: '너 어제 그를 봤구나.', en: 'You saw him yesterday.' },
        { tag: '3인칭 단수', kr: '그녀는 어제 그를 봤어.', en: 'She saw him yesterday.' },
      ] },
      { label: '수', items: [
        { tag: '복수', kr: '우리는 어제 그를 봤어.', en: 'We saw him yesterday.' },
      ] },
      { label: '부정문', items: [
        { tag: '부정문', kr: '나 어제 그를 못 봤어.', en: "I didn't see him yesterday." },
      ] },
      { label: '의문문', items: [
        { tag: '의문문', kr: '너 어제 그를 봤어?', en: 'Did you see him yesterday?' },
      ] },
    ],
  },
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

// 로컬 백업 리마인더 — 마지막 백업(또는 배너 닫기) 시점 이후 7일 경과 OR 그 이후 내 문장(기본문장 제외)
// 10개 이상 추가 시 카드 화면 상단 배너로 노출(2026-08-28). {at, count} 형태로 localStorage에 저장
const BACKUP_CHECKPOINT_KEY = 'tuktak_backup_checkpoint';
const BACKUP_REMINDER_DAYS = 7;
const BACKUP_REMINDER_SENTENCE_COUNT = 10;

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

// 카드 화면 전용 순서 — 미니 학습 중에는 방금 추가한 문장들로만 한정. 문장관리 목록 등
// 다른 화면은 getOrderedSentences()를 그대로 쓰므로 미니 학습과 무관하게 항상 전체를 보여줌
function getCardOrderedSentences() {
  if (miniSessionActive) {
    const byId = new Map(sentences.map((s) => [String(s.id), s]));
    return miniSessionIds.map((id) => byId.get(id)).filter(Boolean);
  }
  return getOrderedSentences();
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

// 15-2 AI 변형(무료판)으로 방금 추가한 문장만 임시로 학습하는 "미니 학습" 상태.
// localStorage에 저장하지 않는 즉석 상태 — 앱을 껐다 켜면 항상 꺼져 있음
let miniSessionActive = false;
let miniSessionIds = [];

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
const listBulkDeleteFooterEl = document.getElementById('list-bulk-delete-footer');
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
const storageUsageCountEl = document.getElementById('storage-usage-count');
const storageUsageBarFillEl = document.getElementById('storage-usage-bar-fill');
const storageUsageDetailEl = document.getElementById('storage-usage-detail');
const emptyStateMsg = document.getElementById('empty-state-msg');
const cardMarkBar = document.getElementById('card-mark-bar');
const cardStarBtn = document.getElementById('card-star-btn');
const cardFlagBtn = document.getElementById('card-flag-btn');
const cardEditBtn = document.getElementById('card-edit-btn');
const cardDeleteBtn = document.getElementById('card-delete-btn');
const listFilterSection = document.getElementById('list-filter-section');
const listFilterBtns = document.querySelectorAll('.list-filter-btn');
const listCountInfoEl = document.getElementById('list-count-info');
const variationOpenBtn = document.getElementById('variation-open-btn');
const variationListScreen = document.getElementById('variation-list-screen');
const variationListBackBtn = document.getElementById('variation-list-back-btn');
const variationSentenceListEl = document.getElementById('variation-sentence-list');
const variationDetailScreen = document.getElementById('variation-detail-screen');
const variationDetailBackBtn = document.getElementById('variation-detail-back-btn');
const variationDetailHomeBtn = document.getElementById('variation-detail-home-btn');
const variationDetailBodyEl = document.getElementById('variation-detail-body');
const variationAddSelectedBtn = document.getElementById('variation-add-selected-btn');
const aiVariationPromptScreen = document.getElementById('ai-variation-prompt-screen');
const aiVariationPromptBackBtn = document.getElementById('ai-variation-prompt-back-btn');
const aiVariationPromptHomeBtn = document.getElementById('ai-variation-prompt-home-btn');
const aiVariationSelectedKrEl = document.getElementById('ai-variation-selected-kr');
const aiVariationPromptTextarea = document.getElementById('ai-variation-prompt-textarea');
const aiVariationCopyBtn = document.getElementById('ai-variation-copy-btn');
const aiVariationPasteTextarea = document.getElementById('ai-variation-paste-textarea');
const aiVariationPreviewBtn = document.getElementById('ai-variation-preview-btn');
const aiVariationPreviewScreen = document.getElementById('ai-variation-preview-screen');
const aiVariationPreviewBackBtn = document.getElementById('ai-variation-preview-back-btn');
const aiVariationPreviewHomeBtn = document.getElementById('ai-variation-preview-home-btn');
const aiVariationPreviewCountEl = document.getElementById('ai-variation-preview-count');
const aiVariationSelectAllBtn = document.getElementById('ai-variation-select-all-btn');
const aiVariationPreviewListEl = document.getElementById('ai-variation-preview-list');
const aiVariationAddBtn = document.getElementById('ai-variation-add-btn');
const miniSessionBanner = document.getElementById('mini-session-banner');
const miniSessionBannerText = document.getElementById('mini-session-banner-text');
const miniSessionExitBtn = document.getElementById('mini-session-exit-btn');

const backupReminderBanner = document.getElementById('backup-reminder-banner');
const backupReminderCloseBtn = document.getElementById('backup-reminder-close-btn');
const backupReminderBtn = document.getElementById('backup-reminder-btn');

// 뒤로가기를 2번 이상 눌러야 메인(카드) 화면에 닿는 화면(문장변형 상세, AI 변형 프롬프트/미리보기)에
// "홈" 버튼으로 탐색 단계를 건너뛸 수 있게 함 — 뒤로가기 체인을 그대로 두고 지름길만 추가(2026-08-27)
function goToCardScreen() {
  document.querySelectorAll('.screen').forEach((el) => el.classList.add('hidden'));
  cardScreen.classList.remove('hidden');
}

variationDetailHomeBtn.addEventListener('click', goToCardScreen);
aiVariationPromptHomeBtn.addEventListener('click', goToCardScreen);
aiVariationPreviewHomeBtn.addEventListener('click', goToCardScreen);

// ==========================================================================
// 로컬 백업 리마인더
// ==========================================================================
function getUserSentenceCount() {
  return sentences.filter((s) => s.source !== 'default').length;
}

function loadBackupCheckpoint() {
  const raw = localStorage.getItem(BACKUP_CHECKPOINT_KEY);
  return raw ? JSON.parse(raw) : null;
}

// 백업 성공 시, 그리고 배너를 닫을 때 모두 이 함수로 "지금 시점"을 새 기준점으로 저장
// (백업하든 닫기만 하든 다음 노출까지 다시 7일/10개 조건을 채워야 함)
function saveBackupCheckpoint() {
  const checkpoint = { at: Date.now(), count: getUserSentenceCount() };
  localStorage.setItem(BACKUP_CHECKPOINT_KEY, JSON.stringify(checkpoint));
}

function shouldShowBackupReminder() {
  if (getUserSentenceCount() === 0) return false;

  const checkpoint = loadBackupCheckpoint();
  if (!checkpoint) {
    // 이 기능이 배포되기 전부터 쌓여있던 문장 때문에 곧바로 뜨지 않도록,
    // 최초 판정 시점을 기준점으로 저장만 하고 이번엔 노출하지 않음
    saveBackupCheckpoint();
    return false;
  }

  const daysSince = (Date.now() - checkpoint.at) / (1000 * 60 * 60 * 24);
  const newSentenceCount = getUserSentenceCount() - checkpoint.count;
  return daysSince >= BACKUP_REMINDER_DAYS || newSentenceCount >= BACKUP_REMINDER_SENTENCE_COUNT;
}

function renderBackupReminder() {
  backupReminderBanner.classList.toggle('hidden', !shouldShowBackupReminder());
}

backupReminderCloseBtn.addEventListener('click', () => {
  saveBackupCheckpoint();
  renderBackupReminder();
});

// ==========================================================================
// 렌더링
// ==========================================================================
function renderCard() {
  renderBackupReminder();

  const ordered = getCardOrderedSentences();
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
  const ordered = getCardOrderedSentences();
  const sentence = ordered[currentIndex];
  if (!sentence) return;

  toggleFn(sentence.id);

  const newOrdered = getCardOrderedSentences();
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
  const sentence = getCardOrderedSentences()[currentIndex];
  if (!sentence) return;
  openAddModal(sentence);
});

cardDeleteBtn.addEventListener('click', () => {
  const sentence = getCardOrderedSentences()[currentIndex];
  if (!sentence) return;
  confirmDeleteSingle(sentence.id);
});

// ==========================================================================
// 이벤트 핸들러
// ==========================================================================
function goToSentence(index) {
  const total = getCardOrderedSentences().length;
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
  const ordered = getCardOrderedSentences();
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
// 문장변형 상세 화면의 "내 문장으로 추가" 버튼 아이콘(circle-plus), 추가 완료 시 LIST_CHECK_ICON으로 교체
const VARIATION_ADD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
// 문장관리 목록 항목의 "AI로 변형하기" 아이콘(sparkles) — 15-2, 별표/깃발과 달리 즉시 토글이 아니라
// 새 화면(프롬프트 생성)으로 이동하는 무거운 동작이라 시각적으로 확실히 구분되는 모양을 사용
const AI_VARIATION_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>';

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
  listBulkDeleteFooterEl.classList.toggle('hidden', !selecting);

  if (selecting) {
    const n = selectedIds.size;
    listBackBtn.classList.add('text-mode');
    listBackBtn.textContent = '취소';
    listBackBtn.setAttribute('aria-label', '선택 취소');
    listTopbarTitleEl.textContent = n > 0 ? `${n}개 선택` : '문장 선택';
    listSelectBtn.classList.add('hidden');
    listBulkDeleteBtn.disabled = n === 0;
    listBulkDeleteBtn.textContent = n > 0 ? `삭제 (${n}개)` : '삭제';
  } else {
    listBackBtn.classList.remove('text-mode');
    listBackBtn.innerHTML = LIST_BACK_ICON;
    listBackBtn.setAttribute('aria-label', '뒤로가기');
    listTopbarTitleEl.textContent = '문장 관리';
    listSelectBtn.classList.remove('hidden');
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

      const divider = document.createElement('span');
      divider.className = 'sentence-list-actions-divider';

      const aiBtn = document.createElement('button');
      aiBtn.type = 'button';
      aiBtn.className = 'sentence-ai-btn';
      aiBtn.setAttribute('aria-label', 'AI로 변형하기');
      aiBtn.innerHTML = AI_VARIATION_ICON;

      actions.appendChild(starBtn);
      actions.appendChild(unfamiliarBtn);
      actions.appendChild(divider);
      actions.appendChild(aiBtn);
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

  if (e.target.closest('.sentence-ai-btn')) {
    const sentence = sentences.find((s) => String(s.id) === id);
    if (sentence) openAiVariationPromptFor(sentence);
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
  if (e.target.closest('.sentence-star-btn') || e.target.closest('.sentence-unfamiliar-btn') || e.target.closest('.sentence-ai-btn')) return;

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
// 문장변형 체험 화면 (목록 → 상세 열람, 읽기 전용)
// ==========================================================================
function renderVariationList() {
  variationSentenceListEl.innerHTML = '';

  VARIATION_SENTENCES.forEach((s, index) => {
    const totalCount = s.categories.reduce((sum, category) => sum + category.items.length, 0);

    const item = document.createElement('div');
    item.className = 'variation-card';
    item.dataset.index = String(index);

    const krEl = document.createElement('p');
    krEl.className = 'variation-card-kr';
    krEl.textContent = s.kr;

    const enEl = document.createElement('p');
    enEl.className = 'variation-card-en';
    enEl.textContent = s.en;

    const footer = document.createElement('div');
    footer.className = 'variation-card-footer';

    const countEl = document.createElement('span');
    countEl.className = 'variation-card-count';
    countEl.textContent = `${totalCount}개 변형`;

    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('fill', 'none');
    chevron.setAttribute('stroke', 'currentColor');
    chevron.setAttribute('stroke-width', '2');
    chevron.setAttribute('stroke-linecap', 'round');
    chevron.setAttribute('stroke-linejoin', 'round');
    chevron.innerHTML = '<path d="m9 18 6-6-6-6"/>';

    footer.appendChild(countEl);
    footer.appendChild(chevron);

    item.appendChild(krEl);
    item.appendChild(enEl);
    item.appendChild(footer);

    variationSentenceListEl.appendChild(item);
  });
}

// 상세 화면에 진입할 때마다 초기화되는 "선택 후 한 번에 추가" 상태.
// flatIndex(항목 순서)를 key로 써서 어떤 항목이 선택됐는지 추적, 실제 추가는
// 하단 "선택한 문장 추가하기" 버튼을 눌러야 일어남(2026-08-27, 기존 탭-즉시-추가에서 변경)
let variationSelectedIndexes = new Set();
let variationDetailFlatItems = [];

function updateVariationDetailFooter() {
  const n = variationSelectedIndexes.size;
  variationAddSelectedBtn.disabled = n === 0;
  variationAddSelectedBtn.textContent = n > 0 ? `선택한 문장 추가하기 (${n}개)` : '선택한 문장 추가하기';
}

function renderVariationDetail(index) {
  const data = VARIATION_SENTENCES[index];
  variationDetailBodyEl.innerHTML = '';
  variationSelectedIndexes = new Set();
  variationDetailFlatItems = [];
  let flatIndex = 0;

  // 카테고리(시제/진행형/인칭 등) 그룹 제목 없이 변형 항목을 하나의 목록으로 이어서 표시.
  // 태그는 "[대괄호]"로 구분, "시제" 카테고리 태그(현재/과거/미래/현재완료)만 단독으로는 뜻이 모호해
  // "~시제"를 붙임(예: 현재→현재시제) — 나머지(진행형/인칭/수/부정문/의문문)는 그 자체로 뜻이 분명해 그대로 둠.
  // 한국어가 먼저 보이고 탭하면 영어로 플립(카드 화면의 "확인"과 같은 개념) — 2026-08-25 최초 구현,
  // 2026-08-26 플립 애니메이션으로 전환. "탭해서 영어/한국어 보기" 안내는 처음엔 항목마다 넣었다가
  // 매번 반복돼 번잡하다는 피드백으로 화면 상단에 한 번(.variation-list-intro)만 두는 것으로 변경.
  // 별도 "원문" 강조박스는 2026-08-26 제거. 하늘색 배경은 처음엔 "원문과 내용이 같은 항목"에 고정
  // 적용했으나, "영어로 보이고 있는 항목이 하늘색이어야지 항상 현재시제만 고정되는 건 이상하다"는
  // 피드백으로 **지금 영어가 보이는(플립된) 항목**을 동적으로 강조하는 방식으로 전환(.variation-item-flipped,
  // 탭할 때마다 플립 애니메이션과 함께 토글). 원문과 내용이 같은 항목(대부분 "현재시제")은 목록에서
  // 이미 한국어 원문을 보고 들어온 것이므로 처음부터 영어가 보이는 상태로 시작 — 결과적으로 이 항목이
  // 렌더링 직후에는 하늘색으로 보이지만, 사용자가 다른 항목을 플립하면 그쪽으로 하늘색이 옮겨감.
  // 각 항목에 "내 문장으로 추가" 버튼(circle-plus)을 붙여 카드 학습 덱에 바로 추가 가능(2026-08-26) —
  // 이미 내 문장 목록에 똑같은 kr/en이 있으면(기본문장으로 이미 들어있는 경우 포함) 처음부터 체크 표시로
  // 시작해 중복 추가를 막음. addSentence()를 그대로 재사용, 추가된 문장은 기본문장이 아닌 일반 "내 문장"
  data.categories.forEach((category) => {
    category.items.forEach((item) => {
      const tagText = category.label === '시제' ? `${item.tag}시제` : item.tag;
      const startFlipped = item.kr === data.kr && item.en === data.en;
      const alreadyAdded = sentences.some((s) => s.kr === item.kr && s.en === item.en);

      const itemEl = document.createElement('div');
      itemEl.className = startFlipped ? 'variation-item variation-item-flipped' : 'variation-item';

      const headerEl = document.createElement('div');
      headerEl.className = 'variation-item-header';

      const tagEl = document.createElement('p');
      tagEl.className = 'variation-item-tag';
      tagEl.textContent = `[${tagText}]`;

      variationDetailFlatItems.push({ kr: item.kr, en: item.en });

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = alreadyAdded ? 'variation-item-add-btn added' : 'variation-item-add-btn';
      addBtn.setAttribute('aria-label', alreadyAdded ? '이미 추가된 문장' : '추가할 문장으로 선택');
      addBtn.dataset.flatIndex = String(flatIndex);
      addBtn.innerHTML = alreadyAdded ? LIST_CHECK_ICON : VARIATION_ADD_ICON;
      flatIndex++;

      headerEl.appendChild(tagEl);
      headerEl.appendChild(addBtn);

      const flipEl = document.createElement('div');
      flipEl.className = 'variation-item-flip';

      const flipInnerEl = document.createElement('div');
      flipInnerEl.className = startFlipped ? 'variation-item-flip-inner flipped' : 'variation-item-flip-inner';

      const krEl = document.createElement('p');
      krEl.className = 'variation-item-kr';
      krEl.textContent = item.kr;

      const enEl = document.createElement('p');
      enEl.className = 'variation-item-en';
      enEl.textContent = item.en;

      flipInnerEl.appendChild(krEl);
      flipInnerEl.appendChild(enEl);
      flipEl.appendChild(flipInnerEl);

      itemEl.appendChild(headerEl);
      itemEl.appendChild(flipEl);
      variationDetailBodyEl.appendChild(itemEl);
    });
  });

  updateVariationDetailFooter();
}

// 추가 버튼 탭 → 즉시 추가하지 않고 "선택됨" 상태로만 토글(플립과 별개 동작이라 이벤트 버블링 차단).
// 실제 추가는 하단 "선택한 문장 추가하기" 버튼을 눌러야 일어남(2026-08-27)
variationDetailBodyEl.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.variation-item-add-btn');
  if (addBtn) {
    e.stopPropagation();
    if (addBtn.classList.contains('added')) return;
    const flatIndex = Number(addBtn.dataset.flatIndex);
    if (variationSelectedIndexes.has(flatIndex)) {
      variationSelectedIndexes.delete(flatIndex);
      addBtn.classList.remove('selected');
    } else {
      variationSelectedIndexes.add(flatIndex);
      addBtn.classList.add('selected');
    }
    updateVariationDetailFooter();
    return;
  }
  const item = e.target.closest('.variation-item');
  if (!item) return;

  const flipped = item.querySelector('.variation-item-flip-inner').classList.toggle('flipped');
  item.classList.toggle('variation-item-flipped', flipped);
});

// 하단 "선택한 문장 추가하기" 버튼 → 선택된 항목을 한 번에 addSentence()로 추가하고,
// 해당 버튼들을 전부 최종 "추가됨"(체크) 상태로 전환
variationAddSelectedBtn.addEventListener('click', () => {
  if (variationSelectedIndexes.size === 0) return;

  variationSelectedIndexes.forEach((flatIndex) => {
    const item = variationDetailFlatItems[flatIndex];
    if (item) addSentence(item.kr, item.en);
  });

  const addedCount = variationSelectedIndexes.size;
  variationDetailBodyEl.querySelectorAll('.variation-item-add-btn.selected').forEach((btn) => {
    btn.classList.remove('selected');
    btn.classList.add('added');
    btn.setAttribute('aria-label', '이미 추가된 문장');
    btn.innerHTML = LIST_CHECK_ICON;
  });

  variationSelectedIndexes.clear();
  updateVariationDetailFooter();
  alert(`${addedCount}개 문장을 추가했습니다.`);
});

variationOpenBtn.addEventListener('click', () => {
  cardScreen.classList.add('hidden');
  variationListScreen.classList.remove('hidden');
  renderVariationList();
});

variationListBackBtn.addEventListener('click', () => {
  variationListScreen.classList.add('hidden');
  cardScreen.classList.remove('hidden');
});

variationSentenceListEl.addEventListener('click', (e) => {
  const item = e.target.closest('.variation-card');
  if (!item) return;
  variationListScreen.classList.add('hidden');
  variationDetailScreen.classList.remove('hidden');
  renderVariationDetail(Number(item.dataset.index));
});

variationDetailBackBtn.addEventListener('click', () => {
  variationDetailScreen.classList.add('hidden');
  variationListScreen.classList.remove('hidden');
});

// ==========================================================================
// 15-2 AI 변형(무료판 안내형 파이프라인)
// ① 문장관리 목록 각 항목의 AI 아이콘으로 바로 진입(원문 선택 화면 없음 — 문장관리 목록 자체가
// 그 역할을 겸함, 2026-08-27 재설계) ② 프롬프트 생성+복사 → 외부 AI에서 결과를 받아 붙여넣기
// (기존 parseSentencesText 재사용) ③ 파싱 결과 미리보기(체크박스 다중선택, 기본 전체 선택)
// ④ 선택 항목만 addSentence()로 추가한 뒤, 그 항목들만 임시로(miniSessionActive) 카드 화면에서
// 즉석 학습
// ==========================================================================
let aiVariationSelectedSentence = null;
let aiVariationParsedItems = [];
let aiVariationSelectedIndexes = new Set();

function buildAiVariationPrompt(sentence) {
  return `다음 한국어-영어 문장을 아래 5가지 방식으로 변형해줘. 문장 의미상 부자연스럽거나 실제로 잘 쓰지 않는 조합(예: 인사말의 의문문, 날씨 표현의 인칭 변화 등)은 억지로 만들지 말고 자연스러운 것만 골라서 답해줘. 각 줄에 "한국어 문장" 다음 탭(Tab)을 하나 넣고 이어서 "English sentence"를 쓰는 형식으로, 결과를 코드블록 안에 한 줄에 하나씩만 적어줘(설명 없이 결과만).

원문: ${sentence.kr} / ${sentence.en}

변형 요청: 시제(현재/과거/미래/현재완료), 인칭(2인칭/3인칭), 수(복수), 부정문, 의문문`;
}

// 문장관리 목록 항목의 AI 아이콘 탭 → 그 문장으로 바로 프롬프트 화면 진입
function openAiVariationPromptFor(sentence) {
  aiVariationSelectedSentence = { kr: sentence.kr, en: sentence.en };
  aiVariationSelectedKrEl.textContent = sentence.kr;
  aiVariationPromptTextarea.value = buildAiVariationPrompt(sentence);
  aiVariationPasteTextarea.value = '';

  listScreen.classList.add('hidden');
  aiVariationPromptScreen.classList.remove('hidden');
}

// --- 프롬프트 복사 + 결과 붙여넣기 ---
aiVariationPromptBackBtn.addEventListener('click', () => {
  aiVariationPromptScreen.classList.add('hidden');
  listScreen.classList.remove('hidden');
});

aiVariationCopyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(aiVariationPromptTextarea.value);
    aiVariationCopyBtn.textContent = '복사됨';
    setTimeout(() => {
      aiVariationCopyBtn.textContent = '복사하기';
    }, 1500);
  } catch {
    // 클립보드 API를 쓸 수 없는 환경(권한 거부 등) 대비 — 직접 선택해서 복사하도록 안내
    aiVariationPromptTextarea.select();
    alert('복사에 실패했습니다. 텍스트를 직접 선택해 복사해주세요.');
  }
});

aiVariationPreviewBtn.addEventListener('click', () => {
  const parsed = parseSentencesText(aiVariationPasteTextarea.value);
  if (parsed.length === 0) {
    alert('붙여넣은 텍스트에서 문장을 찾지 못했습니다. 형식을 확인해주세요.');
    return;
  }
  aiVariationParsedItems = parsed;
  aiVariationSelectedIndexes = new Set(parsed.map((_, i) => i)); // 기본값: 전체 선택

  aiVariationPromptScreen.classList.add('hidden');
  aiVariationPreviewScreen.classList.remove('hidden');
  renderAiVariationPreview();
});

// --- 3단계: 파싱 결과 미리보기 (체크박스 다중선택, 한/영 동시 노출) ---
function renderAiVariationPreview() {
  aiVariationPreviewListEl.innerHTML = '';
  aiVariationPreviewCountEl.textContent = `${aiVariationSelectedIndexes.size}/${aiVariationParsedItems.length}개 선택`;
  aiVariationAddBtn.disabled = aiVariationSelectedIndexes.size === 0;
  aiVariationSelectAllBtn.textContent =
    aiVariationSelectedIndexes.size === aiVariationParsedItems.length ? '전체 해제' : '전체 선택';

  aiVariationParsedItems.forEach((item, index) => {
    const checked = aiVariationSelectedIndexes.has(index);

    const el = document.createElement('div');
    el.className = checked ? 'sentence-list-item checked' : 'sentence-list-item';
    el.dataset.index = String(index);

    const checkbox = document.createElement('span');
    checkbox.className = 'sentence-checkbox';
    checkbox.innerHTML = LIST_CHECK_ICON;
    el.appendChild(checkbox);

    const textWrap = document.createElement('div');
    textWrap.className = 'sentence-list-text';

    const krEl = document.createElement('p');
    krEl.className = 'sentence-list-kr';
    krEl.textContent = item.kr;

    const enEl = document.createElement('p');
    enEl.className = 'sentence-list-en';
    enEl.textContent = item.en;

    textWrap.appendChild(krEl);
    textWrap.appendChild(enEl);
    el.appendChild(textWrap);

    aiVariationPreviewListEl.appendChild(el);
  });
}

aiVariationPreviewBackBtn.addEventListener('click', () => {
  aiVariationPreviewScreen.classList.add('hidden');
  aiVariationPromptScreen.classList.remove('hidden');
});

aiVariationPreviewListEl.addEventListener('click', (e) => {
  const item = e.target.closest('.sentence-list-item');
  if (!item) return;
  const index = Number(item.dataset.index);
  if (aiVariationSelectedIndexes.has(index)) {
    aiVariationSelectedIndexes.delete(index);
  } else {
    aiVariationSelectedIndexes.add(index);
  }
  renderAiVariationPreview();
});

aiVariationSelectAllBtn.addEventListener('click', () => {
  if (aiVariationSelectedIndexes.size === aiVariationParsedItems.length) {
    aiVariationSelectedIndexes.clear();
  } else {
    aiVariationSelectedIndexes = new Set(aiVariationParsedItems.map((_, i) => i));
  }
  renderAiVariationPreview();
});

// --- 4단계: 선택 항목 추가 + 미니 학습 시작 ---
function startMiniSession(ids) {
  miniSessionActive = true;
  miniSessionIds = ids;
  currentIndex = 0;
  revealed = false;
  miniSessionBanner.classList.remove('hidden');
  miniSessionBannerText.textContent = `미니 학습 중 · ${ids.length}개`;
  renderCard();
}

function endMiniSession() {
  miniSessionActive = false;
  miniSessionIds = [];
  currentIndex = 0;
  revealed = false;
  miniSessionBanner.classList.add('hidden');
  renderCard();
}

miniSessionExitBtn.addEventListener('click', endMiniSession);

aiVariationAddBtn.addEventListener('click', () => {
  if (aiVariationSelectedIndexes.size === 0) return;

  const toAdd = aiVariationParsedItems.filter((_, i) => aiVariationSelectedIndexes.has(i));
  const beforeIds = new Set(sentences.map((s) => String(s.id)));
  toAdd.forEach((item) => addSentence(item.kr, item.en));
  const addedIds = sentences.map((s) => String(s.id)).filter((id) => !beforeIds.has(id));

  aiVariationPreviewScreen.classList.add('hidden');
  cardScreen.classList.remove('hidden');
  startMiniSession(addedIds);
});

// ==========================================================================
// 설정 화면 (글자크기 / 화면모드 / 데이터 관리)
// ==========================================================================
const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024; // 브라우저 localStorage 통상 한도(5MB) 기준 안내용 참고치

// 데이터 관리 섹션 상단 저장공간 안내: 설정 화면에 진입할 때마다 다시 계산
function renderStorageUsage() {
  const usedBytes = new Blob([JSON.stringify(sentences)]).size;
  const usedKB = (usedBytes / 1024).toFixed(1);
  const percent = Math.min(100, (usedBytes / STORAGE_QUOTA_BYTES) * 100);

  storageUsageCountEl.textContent = `문장 ${sentences.length}개 저장 중`;
  storageUsageBarFillEl.style.width = `${percent}%`;
  storageUsageDetailEl.textContent = `약 ${usedKB}KB / 5MB 사용`;
}

settingsOpenBtn.addEventListener('click', () => {
  cardScreen.classList.add('hidden');
  settingsScreen.classList.remove('hidden');
  renderStorageUsage();
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

// 백업 내보내기: 현재 문장을 TSV로 만들어 파일 저장
// (복원은 별도 기능 없이 기존 "파일가져오기"로 이 파일을 그대로 불러오면 됨)
// 저장 위치/파일명을 직접 고를 수 있도록 File System Access API(showSaveFilePicker)를 우선 사용하고,
// 지원하지 않는 브라우저(iOS 사파리 등)나 사용자가 대화상자를 취소한 경우엔 기존 자동 다운로드로 대체(2026-08-27)
// 설정 화면의 백업 버튼과 카드 화면 백업 리마인더 배너 버튼이 이 함수를 공유(2026-08-28).
// 반환값(true/false)으로 실제 백업이 이뤄졌는지 알려줘 리마인더 체크포인트 갱신 여부를 판단
async function exportBackup() {
  const tsvText = sentences.map((s) => `${s.kr}\t${s.en}`).join('\n');
  const today = new Date();
  const dateStr = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('');
  const fileName = `tuktak_backup_${dateStr}.tsv`;

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'TSV 파일', accept: { 'text/tab-separated-values': ['.tsv'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(tsvText);
      await writable.close();
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false; // 사용자가 저장 대화상자를 취소함
      // 그 외 에러는 아래 자동 다운로드 방식으로 폴백
    }
  }

  const blob = new Blob([tsvText], { type: 'text/tab-separated-values' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
  return true;
}

exportBackupBtn.addEventListener('click', async () => {
  const success = await exportBackup();
  if (success) {
    saveBackupCheckpoint();
    renderBackupReminder();
  }
});

backupReminderBtn.addEventListener('click', async () => {
  const success = await exportBackup();
  if (success) {
    saveBackupCheckpoint();
    renderBackupReminder();
  }
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
