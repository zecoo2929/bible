import { DailyVerse } from '../types';

// 학생 및 청소년에게 힘과 지혜를 주는 매일 성경 말씀 모음 (개역개정 & ESV 영어성경)
export const DAILY_VERSES: DailyVerse[] = [
  {
    id: 'v1',
    book: '시편 119:105',
    bookEsv: 'Psalm 119:105',
    theme: '인도와 소망',
    text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
    textEsv: 'Your word is a lamp to my feet and a light to my path.',
    quizPrompt: '주의 말씀은 내 발에 (      )이요 내 길에 (      )이니이다',
    blankWords: ['등', '빛'],
    hint: '어두운 밤길을 밝혀주는 두 가지 물건',
    reflection: '오늘 하루, 나의 생각보다 하나님의 말씀을 내 걸음의 나침반으로 삼아보세요.'
  },
  {
    id: 'v2',
    book: '빌립보서 4:13',
    bookEsv: 'Philippians 4:13',
    theme: '능력과 용기',
    text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
    textEsv: 'I can do all things through him who strengthens me.',
    quizPrompt: '내게 (      ) 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
    blankWords: ['능력'],
    hint: '어려운 일도 감당할 수 있게 하나님이 부어주시는 힘',
    reflection: '스스로의 한계에 부딪힐 때마다 능력 주시는 예수님을 의지해 보세요.'
  },
  {
    id: 'v3',
    book: '여호수아 1:9',
    bookEsv: 'Joshua 1:9',
    theme: '담대함과 평안',
    text: '강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라',
    textEsv: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.',
    quizPrompt: '강하고 (      )하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 (      ) 하느니라',
    blankWords: ['담대', '함께'],
    hint: '겁내지 않는 마음, 그리고 하나님이 우리 곁에 계신다는 약속',
    reflection: '새로운 도전이나 시험 앞에서도 하나님이 동행하심을 믿고 나아갑시다.'
  },
  {
    id: 'v4',
    book: '이사야 41:10',
    bookEsv: 'Isaiah 41:10',
    theme: '위로와 동행',
    text: '두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라',
    textEsv: 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.',
    quizPrompt: '두려워하지 말라 내가 너와 (      ) 함이라 놀라지 말라 나는 네 (      )이 됨이라',
    blankWords: ['함께', '하나님'],
    hint: '가장 든든한 짝궁, 온 우주를 창조하신 분',
    reflection: '외롭거나 불안할 때 나를 붙들어 주시는 굳센 하나님의 오른손을 묵상해 보세요.'
  },
  {
    id: 'v5',
    book: '잠언 3:5-6',
    bookEsv: 'Proverbs 3:5-6',
    theme: '신뢰와 지혜',
    text: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라',
    textEsv: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    quizPrompt: '너는 마음을 다하여 여호와를 (      )하고 네 명철을 의지하지 말라 너는 범사에 그를 (      )하라',
    blankWords: ['신뢰', '인정'],
    hint: '굳게 믿는 것, 그리고 모든 순간 하나님을 존중하는 것',
    reflection: '내 고집을 내려놓고 작은 일상부터 기도로 하나님께 여쭈어 보세요.'
  },
  {
    id: 'v6',
    book: '로마서 8:28',
    bookEsv: 'Romans 8:28',
    theme: '섭리와 감사',
    text: '우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라',
    textEsv: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    quizPrompt: '하나님을 사랑하는 자들에게는 모든 것이 (      )하여 (      )을 이루느니라',
    blankWords: ['합력', '선'],
    hint: '서로 힘을 합침, 그리고 하나님 보시기에 가장 좋은 열매',
    reflection: '힘든 순간이나 실패조차도 하나님 손에 맡기면 가장 아름다운 선으로 변화됩니다.'
  },
  {
    id: 'v7',
    book: '갈라디아서 5:22-23',
    bookEsv: 'Galatians 5:22-23',
    theme: '성령의 열매',
    text: '오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과 온유와 절제니',
    textEsv: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.',
    quizPrompt: '오직 성령의 열매는 (      )과 희락과 (      )과 오래 참음과 자비와 양선과 충성과 온유와 절제니',
    blankWords: ['사랑', '화평'],
    hint: '첫째 되는 가장 큰 계명, 그리고 평화로운 마음',
    reflection: '오늘 나의 말과 행동 속에 성령의 아름다운 열매가 맺히도록 기도해 보세요.'
  },
  {
    id: 'v8',
    book: '마태복음 6:33',
    bookEsv: 'Matthew 6:33',
    theme: '우선순위',
    text: '그런즉 너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라',
    textEsv: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
    quizPrompt: '그런즉 너희는 먼저 그의 (      )와 그의 (      )를 구하라 그리하면 이 모든 것을 너희에게 더하시리라',
    blankWords: ['나라', '의'],
    hint: '하나님의 다스림, 올바른 뜻',
    reflection: '세상의 걱정보다 먼저 하나님을 기쁘시게 하는 것을 오늘 첫 자리에 두세요.'
  },
  {
    id: 'v9',
    book: '시편 23:1',
    bookEsv: 'Psalm 23:1',
    theme: '목자 되신 주',
    text: '여호와는 나의 목자시니 내게 부족함이 없으리로다',
    textEsv: 'The LORD is my shepherd; I shall not want.',
    quizPrompt: '여호와는 나의 (      )시니 내게 (      )이 없으리로다',
    blankWords: ['목자', '부족함'],
    hint: '양을 돌보는 분, 아쉬움이나 모자람이 없음',
    reflection: '선한 목자 되신 주님이 나를 푸른 풀밭과 쉴 만한 물가로 인도하십니다.'
  },
  {
    id: 'v10',
    book: '요한복음 14:6',
    bookEsv: 'John 14:6',
    theme: '구원의 길',
    text: '예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라',
    textEsv: 'Jesus said to him, "I am the way, and the truth, and the life. No one comes to the Father except through me."',
    quizPrompt: '내가 곧 (      )요 (      )요 (      )이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라',
    blankWords: ['길', '진리', '생명'],
    hint: '우리가 걸어갈 방향, 참된 사실, 영원한 삶',
    reflection: '방황할 때마다 유일한 길이 되시는 예수님을 바라보세요.'
  },
  {
    id: 'v11',
    book: '데살로니가전서 5:16-18',
    bookEsv: '1 Thessalonians 5:16-18',
    theme: '그리스도인의 삶',
    text: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라',
    textEsv: 'Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.',
    quizPrompt: '항상 (      )하라 쉬지 말고 (      )하라 범사에 (      )하라',
    blankWords: ['기뻐', '기도', '감사'],
    hint: '즐거워함, 하나님과의 대화, 고마워하는 마음',
    reflection: '어떤 상황에서도 미소를 잃지 않고 작은 일에도 감사의 고백을 올려보세요.'
  },
  {
    id: 'v12',
    book: '시편 1:1-2',
    bookEsv: 'Psalm 1:1-2',
    theme: '복 있는 사람',
    text: '복 있는 사람은 오직 여호와의 율법을 즐거워하여 그의 율법을 주야로 묵상하는도다',
    textEsv: 'Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; but his delight is in the law of the LORD, and on his law he meditates day and night.',
    quizPrompt: '복 있는 사람은 오직 여호와의 율법을 즐거워하여 그의 율법을 주야로 (      )하는도다',
    blankWords: ['묵상'],
    hint: '마음속으로 말씀을 깊이 생각하고 되새김',
    reflection: '시냇가에 심은 나무처럼 말씀에 뿌리내린 사람은 가뭄에도 마르지 않습니다.'
  },
  {
    id: 'v13',
    book: '에베소서 6:10-11',
    bookEsv: 'Ephesians 6:10-11',
    theme: '영적 무장',
    text: '끝으로 너희가 주 안에서와 그 힘의 능력으로 강건하여지고 마귀의 간계를 능히 대적하기 위하여 하나님의 전신갑주를 입으라',
    textEsv: 'Finally, be strong in the Lord and in the strength of his might. Put on the whole armor of God, that you may be able to stand against the schemes of the devil.',
    quizPrompt: '마귀의 간계를 능히 대적하기 위하여 하나님의 (            )를 입으라',
    blankWords: ['전신갑주'],
    hint: '온몸을 보호하는 완전한 갑옷',
    reflection: '진리의 허리띠와 믿음의 방패로 오늘 하루 세상의 유혹을 이겨냅시다.'
  },
  {
    id: 'v14',
    book: '잠언 16:3',
    bookEsv: 'Proverbs 16:3',
    theme: '맡김의 삶',
    text: '너의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라',
    textEsv: 'Commit your work to the LORD, and your plans will be established.',
    quizPrompt: '너의 행사를 여호와께 (      )라 그리하면 네가 경영하는 것이 이루어지리라',
    blankWords: ['맡기'],
    hint: '짐을 넘겨드림, 의탁함',
    reflection: '내가 계획한 학업과 미래를 온전히 하나님께 맡길 때 가장 안전합니다.'
  },
  {
    id: 'v15',
    book: '예레미야 29:11',
    bookEsv: 'Jeremiah 29:11',
    theme: '평안과 미래',
    text: '여호와의 말씀이니라 너희를 향한 나의 생각을 내가 아나니 평안이요 재앙이 아니니라 너희에게 미래와 희망을 주는 것이니라',
    textEsv: 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.',
    reflection: '하나님은 우리에게 재앙이 아닌 희망찬 미래를 예비하고 계십니다.'
  },
  {
    id: 'v16',
    book: '이사야 40:31',
    bookEsv: 'Isaiah 40:31',
    theme: '새 힘과 회복',
    text: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 달음박질하여도 곤비하지 아니하겠고 걸어가도 피곤하지 아니하리로다',
    textEsv: 'but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.',
    reflection: '지치고 낙심될 때 하나님을 바라보면 독수리 날개 같은 새 힘을 공급해 주십니다.'
  },
  {
    id: 'v17',
    book: '요한복음 3:16',
    bookEsv: 'John 3:16',
    theme: '하나님의 사랑',
    text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
    textEsv: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    reflection: '나를 향한 하나님의 끝없는 사랑과 십자가의 은혜를 깊이 묵상해 보세요.'
  },
  {
    id: 'v18',
    book: '로마서 12:2',
    bookEsv: 'Romans 12:2',
    theme: '변화와 분별',
    text: '너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라',
    textEsv: 'Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.',
    reflection: '세상의 유행과 가치관을 따르지 않고, 하나님의 선하신 뜻을 분별하는 하루가 되길 소망합니다.'
  },
  {
    id: 'v19',
    book: '시편 46:1',
    bookEsv: 'Psalm 46:1',
    theme: '피난처와 힘',
    text: '하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라',
    textEsv: 'God is our refuge and strength, a very present help in trouble.',
    reflection: '두려운 일이나 환난이 닥쳐올 때, 영원한 피난처 되시는 하나님 품으로 피하세요.'
  },
  {
    id: 'v20',
    book: '디모데후서 1:7',
    bookEsv: '2 Timothy 1:7',
    theme: '능력과 사랑',
    text: '하나님이 우리에게 주신 것은 두려워하는 마음이 아니요 오직 능력과 사랑과 절제하는 마음이니',
    textEsv: 'for God gave us a spirit not of fear but of power and love and self-control.',
    reflection: '불안과 염려는 물리치고, 하나님이 주신 능력과 사랑과 절제로 담대하게 살아갑시다.'
  },
  {
    id: 'v21',
    book: '히브리서 11:1',
    bookEsv: 'Hebrews 11:1',
    theme: '믿음의 본질',
    text: '믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니',
    textEsv: 'Now faith is the assurance of things hoped for, the conviction of things not seen.',
    reflection: '눈에 보이지 않아도 신실하신 하나님의 약속을 굳게 신뢰하는 것이 참된 믿음입니다.'
  }
];

// 오늘 날짜에 맞는 말씀 구하기 (연중 일자 또는 날짜 키 기반)
export function getDailyVerse(date: Date = new Date()): DailyVerse {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - startOfYear.getTime()) + ((startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs(dayOfYear) % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

// 오늘 날짜 문자열 YYYY-MM-DD
export function getTodayDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 한국어 날짜 형식
export function formatKoreanDate(date: Date = new Date()): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]}요일)`;
}
