import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// 데이터 저장용 경로
const DATA_DIR = path.join(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const RANKINGS_FILE = path.join(DATA_DIR, 'rankings.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// 서버 관리자 PIN 조회
function getStoredAdminPinServer(): string {
  try {
    if (fs.existsSync(ADMIN_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
      if (data?.pin) return String(data.pin).trim();
    }
  } catch (e) {
    // fallback
  }
  return '1015';
}

// 서버 관리자 PIN 저장
function saveStoredAdminPinServer(newPin: string): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      ADMIN_CONFIG_FILE,
      JSON.stringify({ pin: newPin.trim(), updatedAt: new Date().toISOString() }, null, 2),
      'utf-8'
    );
    return true;
  } catch (e) {
    console.error('Failed to save admin pin:', e);
    return false;
  }
}

function getTodayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 초기 교회 친구들 랭킹 및 학생 상세 데이터
function generateDefaultStudents() {
  const today = getTodayStr(0);
  const yesterday = getTodayStr(-1);
  const twoDaysAgo = getTodayStr(-2);
  const threeDaysAgo = getTodayStr(-3);

  return [
    {
      id: 'seed_1',
      name: '김다윗',
      group: '중고등부 2반',
      streak: 21,
      bestStreak: 21,
      level: 5,
      exp: 280,
      totalDaysRead: 25,
      lastReadDate: today,
      lastQuizDate: today,
      titleName: '은혜의 나무',
      titleIcon: '👑',
      avatarEmoji: '👑',
      lastActive: new Date().toISOString(),
      createdAt: getTodayStr(-25),
      note: '중고등부 임원. 매일 말씀 묵상과 5문장 저널링을 성실하게 실천함',
      completedHistory: {
        [today]: { read: true, verseBook: '시편 119:105', journalText: '오늘 말씀을 읽으며 내 삶의 어두운 순간마다 오직 하나님의 말씀만이 진정한 빛이 됨을 깨달았습니다. 세상의 기준이나 친구들의 말이 아니라 성경 속 진리를 먼저 바라보아야겠다고 느꼈습니다. 최근 시험과 진로 고민으로 답답했는데 주님께서 발걸음을 인도해 주신다는 약속에 큰 위로를 얻었습니다. 오늘 하루 작은 결정을 내릴 때도 성급하게 판단하지 않고 기도로 여쭈어보겠습니다. 주님, 제 인생의 길목마다 흔들리지 않도록 주의 말씀의 등불을 밝혀 주세요.', sentenceCount: 5 },
        [yesterday]: { read: true, verseBook: '잠언 3:5-6', journalText: '내 명철을 의지하지 않고 주님을 전적으로 신뢰해야 한다는 교훈을 마음에 새겼습니다. 매일 아침 기도로 시작하는 습관을 지켜나가겠습니다.', sentenceCount: 2 },
      },
      journals: {
        [today]: {
          id: `j_seed_1_${today}`,
          studentId: 'seed_1',
          studentName: '김다윗',
          group: '중고등부 2반',
          avatarEmoji: '👑',
          date: today,
          verseBook: '시편 119:105',
          verseText: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
          reflection: '오늘 말씀을 읽으며 내 삶의 어두운 순간마다 오직 하나님의 말씀만이 진정한 빛이 됨을 깨달았습니다. 세상의 기준이나 친구들의 말이 아니라 성경 속 진리를 먼저 바라보아야겠다고 느꼈습니다. 최근 시험과 진로 고민으로 답답했는데 주님께서 발걸음을 인도해 주신다는 약속에 큰 위로를 얻었습니다. 오늘 하루 작은 결정을 내릴 때도 성급하게 판단하지 않고 기도로 여쭈어보겠습니다. 주님, 제 인생의 길목마다 흔들리지 않도록 주의 말씀의 등불을 밝혀 주세요.',
          sentenceCount: 5,
          submittedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          teacherFeedback: '다윗 학생, 말씀 안에서 길을 찾는 귀한 믿음의 고백이 참 감동입니다. 늘 응원하고 기도할게요! 🙏',
          teacherFeedbackAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          comments: [
            {
              id: 'c_seed_1_teacher',
              authorName: '박선생님',
              authorRole: 'teacher',
              group: '중고등부 2반',
              content: '다윗 학생, 말씀 안에서 길을 찾는 귀한 믿음의 고백이 참 감동입니다. 늘 응원하고 기도할게요! 🙏',
              createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
            },
            {
              id: 'c_seed_1_pastor',
              authorName: '교역자',
              authorRole: 'pastor',
              content: '다윗아, 청소년 시기에 주님의 말씀을 인생의 나침반으로 삼는 너의 앞길을 하나님께서 크게 축복하실 것이다. 샬롬!',
              createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
            }
          ]
        }
      }
    },
    {
      id: 'seed_2',
      name: '박하은',
      group: '중고등부 1반',
      streak: 15,
      bestStreak: 18,
      level: 4,
      exp: 150,
      totalDaysRead: 20,
      lastReadDate: today,
      lastQuizDate: yesterday,
      titleName: '진리의 방패',
      titleIcon: '🛡️',
      avatarEmoji: '🛡️',
      lastActive: new Date().toISOString(),
      createdAt: getTodayStr(-20),
      note: '소감 나눔이 매우 솔직하고 깊이 있음. 찬양팀 봉사 중',
      completedHistory: {
        [today]: { read: true, verseBook: '빌립보서 4:13', journalText: '내가 할 수 없다고 여겼던 학업과 인간관계의 무게를 주님 앞에 내려놓습니다. 내 힘으로 아등바등할 때는 늘 지치고 낙심했지만 능력 주시는 예수님 안에서는 모든 것이 가능함을 다시금 마음에 새깁니다. 주님을 의지할 때 비로소 진정한 평안과 담대함이 찾아온다는 것을 배웠습니다. 오늘 학교에서 힘들거나 부담스러운 일을 마주할 때마다 이 구절을 마음속으로 되뇌이겠습니다. 언제나 내 곁에서 새로운 용기와 능력을 부어주시는 주님을 찬양합니다.', sentenceCount: 5 },
      },
      journals: {
        [today]: {
          id: `j_seed_2_${today}`,
          studentId: 'seed_2',
          studentName: '박하은',
          group: '중고등부 1반',
          avatarEmoji: '🛡️',
          date: today,
          verseBook: '빌립보서 4:13',
          verseText: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
          reflection: '내가 할 수 없다고 여겼던 학업과 인간관계의 무게를 주님 앞에 내려놓습니다. 내 힘으로 아등바등할 때는 늘 지치고 낙심했지만 능력 주시는 예수님 안에서는 모든 것이 가능함을 다시금 마음에 새깁니다. 주님을 의지할 때 비로소 진정한 평안과 담대함이 찾아온다는 것을 배웠습니다. 오늘 학교에서 힘들거나 부담스러운 일을 마주할 때마다 이 구절을 마음속으로 되뇌이겠습니다. 언제나 내 곁에서 새로운 용기와 능력을 부어주시는 주님을 찬양합니다.',
          sentenceCount: 5,
          submittedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          teacherFeedback: '하은아, 주님께서 주시는 힘으로 오늘 하루도 멋지게 승리하길 축복해! ✨',
          teacherFeedbackAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
          comments: [
            {
              id: 'c_seed_2_teacher',
              authorName: '이선생님',
              authorRole: 'teacher',
              group: '중고등부 1반',
              content: '하은아, 주님께서 주시는 힘으로 오늘 하루도 멋지게 승리하길 축복해! ✨',
              createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
            }
          ]
        }
      }
    },
    {
      id: 'seed_3',
      name: '이요한',
      group: '중고등부 3반',
      streak: 10,
      bestStreak: 12,
      level: 3,
      exp: 90,
      totalDaysRead: 14,
      lastReadDate: yesterday,
      lastQuizDate: yesterday,
      titleName: '믿음의 싹',
      titleIcon: '🔥',
      avatarEmoji: '🔥',
      lastActive: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      createdAt: getTodayStr(-15),
      note: '오늘 말씀 저널 아직 미작성. 저녁에 카톡 독려 필요',
      completedHistory: {
        [yesterday]: { read: true, verseBook: '잠언 3:5-6', journalText: '마음을 다해 여호와를 의지하라는 말씀이 와닿았습니다.', sentenceCount: 1 },
      },
      journals: {
        [yesterday]: {
          id: `j_seed_3_${yesterday}`,
          studentId: 'seed_3',
          studentName: '이요한',
          group: '중고등부 3반',
          avatarEmoji: '🔥',
          date: yesterday,
          verseBook: '잠언 3:5-6',
          verseText: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라',
          reflection: '마음을 다해 여호와를 의지하라는 말씀이 와닿았습니다. 내 생각보다 하나님의 지혜를 따르겠습니다.',
          sentenceCount: 2,
          submittedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        }
      }
    },
    {
      id: 'seed_4',
      name: '정에스더',
      group: '청년부 2조',
      streak: 8,
      bestStreak: 14,
      level: 3,
      exp: 240,
      totalDaysRead: 19,
      lastReadDate: today,
      lastQuizDate: today,
      titleName: '말씀의 탐험가',
      titleIcon: '📖',
      avatarEmoji: '📖',
      lastActive: new Date().toISOString(),
      createdAt: getTodayStr(-22),
      note: '청년부 또래 조장, 후배들 독려 리더십 우수',
      completedHistory: {
        [today]: { read: true, verseBook: '시편 23편', journalText: '여호와가 나의 목자이시니 내게 부족함이 없다는 고백이 오늘 제 가슴을 깊이 울렸습니다. 늘 무언가 부족하다고 불평하고 미래에 대해 불안해했던 제 모습을 솔직하게 회개했습니다. 푸른 풀밭과 쉴 만한 물가로 인도하시는 선한 목자 되신 하나님을 온전히 신뢰하기로 결단합니다. 오늘 하루는 부족한 것에 집착하기보다 이미 제게 주신 풍성한 은혜들을 하나하나 세어보며 감사하겠습니다. 선하심과 인자하심이 평생 저를 따를 것을 믿으며 주님과 동행하는 하루가 되길 기도합니다.', sentenceCount: 5 },
      },
      journals: {
        [today]: {
          id: `j_seed_4_${today}`,
          studentId: 'seed_4',
          studentName: '정에스더',
          group: '청년부 2조',
          avatarEmoji: '📖',
          date: today,
          verseBook: '시편 23편',
          verseText: '여호와는 나의 목자시니 내게 부족함이 없으리로다',
          reflection: '여호와가 나의 목자이시니 내게 부족함이 없다는 고백이 오늘 제 가슴을 깊이 울렸습니다. 늘 무언가 부족하다고 불평하고 미래에 대해 불안해했던 제 모습을 솔직하게 회개했습니다. 푸른 풀밭과 쉴 만한 물가로 인도하시는 선한 목자 되신 하나님을 온전히 신뢰하기로 결단합니다. 오늘 하루는 부족한 것에 집착하기보다 이미 제게 주신 풍성한 은혜들을 하나하나 세어보며 감사하겠습니다. 선하심과 인자하심이 평생 저를 따를 것을 믿으며 주님과 동행하는 하루가 되길 기도합니다.',
          sentenceCount: 5,
          submittedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
        }
      }
    },
    {
      id: 'seed_5',
      name: '강은혜',
      group: '유초등부 6학년',
      streak: 12,
      bestStreak: 12,
      level: 4,
      exp: 70,
      totalDaysRead: 16,
      lastReadDate: today,
      titleName: '말씀의 탐험가',
      titleIcon: '🌟',
      avatarEmoji: '🌟',
      lastActive: new Date().toISOString(),
      createdAt: getTodayStr(-18),
      note: '부모님과 함께 매일 가정예배 후 통독 및 소감 작성 참여',
      completedHistory: {
        [today]: { read: true, verseBook: '시편 119:105', journalText: '성경 말씀이 등불이라는 말씀이 재미있고 신기했습니다. 어두운 방에서 불을 켜면 환해지듯이 하나님 말씀이 제 마음을 밝혀줍니다. 학교에서 착한 어린이가 되도록 말씀대로 순종하겠습니다. 밤에 잘 때 무서워하지 않고 하나님이 지켜주심을 믿겠습니다. 저를 사랑하시는 예수님 이름으로 기도드렸습니다, 아멘!', sentenceCount: 5 },
      },
      journals: {
        [today]: {
          id: `j_seed_5_${today}`,
          studentId: 'seed_5',
          studentName: '강은혜',
          group: '유초등부 6학년',
          avatarEmoji: '🌟',
          date: today,
          verseBook: '시편 119:105',
          verseText: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
          reflection: '성경 말씀이 등불이라는 말씀이 재미있고 신기했습니다. 어두운 방에서 불을 켜면 환해지듯이 하나님 말씀이 제 마음을 밝혀줍니다. 학교에서 착한 어린이가 되도록 말씀대로 순종하겠습니다. 밤에 잘 때 무서워하지 않고 하나님이 지켜주심을 믿겠습니다. 저를 사랑하시는 예수님 이름으로 기도드렸습니다, 아멘!',
          sentenceCount: 5,
          submittedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
          teacherFeedback: '은혜야, 예수님을 향한 예쁜 마음과 고백이 참 사랑스럽구나! 참 잘했어요 👏',
          teacherFeedbackAt: new Date(Date.now() - 1800 * 1000).toISOString(),
          comments: [
            {
              id: 'c_seed_5_teacher',
              authorName: '최선생님',
              authorRole: 'teacher',
              group: '유초등부 6학년',
              content: '은혜야, 예수님을 향한 예쁜 마음과 고백이 참 사랑스럽구나! 참 잘했어요 👏',
              createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
            }
          ]
        }
      }
    },
    {
      id: 'seed_6',
      name: '최사무엘',
      group: '유초등부 5학년',
      streak: 4,
      bestStreak: 7,
      level: 2,
      exp: 110,
      totalDaysRead: 9,
      lastReadDate: threeDaysAgo,
      lastQuizDate: threeDaysAgo,
      titleName: '새벽의 등불',
      titleIcon: '🕯️',
      avatarEmoji: '🕯️',
      lastActive: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      createdAt: getTodayStr(-12),
      note: '3일 연속 결석 상태. 담당 교사 심방 요망',
      completedHistory: {
        [threeDaysAgo]: { read: true, quiz: true, verseBook: '빌립보서 4:13' },
      }
    },
    {
      id: 'seed_7',
      name: '한마리아',
      group: '중고등부 1반',
      streak: 2,
      bestStreak: 5,
      level: 1,
      exp: 80,
      totalDaysRead: 5,
      lastReadDate: today,
      lastQuizDate: '',
      titleName: '초보 순례자',
      titleIcon: '🌱',
      avatarEmoji: '🌱',
      lastActive: new Date().toISOString(),
      createdAt: getTodayStr(-5),
      note: '이번 달 신규 등록. 성경 통독 습관 형성 중',
      completedHistory: {
        [today]: { read: true, quiz: false, verseBook: '시편 23편' },
        [yesterday]: { read: true, quiz: false, verseBook: '잠언 3:5-6' },
      }
    },
    {
      id: 'seed_8',
      name: '임바울',
      group: '중고등부 2반',
      streak: 0,
      bestStreak: 9,
      level: 2,
      exp: 40,
      totalDaysRead: 9,
      lastReadDate: twoDaysAgo,
      lastQuizDate: twoDaysAgo,
      titleName: '초보 순례자',
      titleIcon: '✝️',
      avatarEmoji: '✝️',
      lastActive: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      createdAt: getTodayStr(-15),
      note: '시험 기간으로 2일간 쉬는 중, 격려 문자 발송 추천',
      completedHistory: {
        [twoDaysAgo]: { read: true, quiz: false, verseBook: '요한복음 14:6' },
      }
    }
  ];
}

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STUDENTS_FILE)) {
      const initial = generateDefaultStudents();
      fs.writeFileSync(STUDENTS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      fs.writeFileSync(RANKINGS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Failed to initialize students file:', e);
  }
}

function getStudents(): any[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return generateDefaultStudents();
  }
}

function saveStudents(data: any[]) {
  ensureDataFile();
  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    // 랭킹 파일도 하위 호환성을 위해 함께 갱신
    fs.writeFileSync(RANKINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write students file:', e);
  }
}

// 1. 랭킹 조회 API (기존 RankingBoard 호환)
app.get('/api/rankings', (req, res) => {
  const students = getStudents();
  const sortBy = req.query.sortBy === 'level' ? 'level' : 'streak';

  const sorted = [...students].sort((a, b) => {
    if (sortBy === 'level') {
      if (b.level !== a.level) return b.level - a.level;
      return b.exp - a.exp;
    }
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.level - a.level;
  });

  res.json({
    success: true,
    rankings: sorted,
    totalStudents: sorted.length,
  });
});

// 2. 학생 랭킹 등록 및 실시간 동기화 API
app.post('/api/rankings', (req, res) => {
  const { 
    id, 
    name, 
    group, 
    streak, 
    bestStreak,
    level, 
    exp, 
    totalDaysRead,
    lastReadDate,
    lastQuizDate,
    titleName, 
    titleIcon,
    avatarEmoji,
    completedHistory
  } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: 'Missing required fields (id, name)' });
  }

  const students = getStudents();
  const existingIndex = students.findIndex((item: any) => item.id === id);

  const updatedEntry = {
    id,
    name: name.trim(),
    group: group?.trim() || '교회 청소년부',
    streak: Number(streak) || 0,
    bestStreak: Number(bestStreak) || Number(streak) || 0,
    level: Number(level) || 1,
    exp: Number(exp) || 0,
    totalDaysRead: Number(totalDaysRead) || 0,
    lastReadDate: lastReadDate || '',
    lastQuizDate: lastQuizDate || '',
    titleName: titleName || '초보 순례자',
    titleIcon: titleIcon || '🌱',
    avatarEmoji: avatarEmoji || '🌱',
    lastActive: new Date().toISOString(),
    completedHistory: completedHistory || (existingIndex >= 0 ? students[existingIndex].completedHistory : {}),
    note: existingIndex >= 0 ? students[existingIndex].note : '',
  };

  if (existingIndex >= 0) {
    students[existingIndex] = {
      ...students[existingIndex],
      ...updatedEntry,
      journals: students[existingIndex].journals || {},
    };
  } else {
    students.push({
      ...updatedEntry,
      journals: {},
    });
  }

  saveStudents(students);
  res.json({ success: true, entry: updatedEntry });
});

// 2-1. 학생 말씀 소감 저널 제출/수정 API
app.post('/api/journals', (req, res) => {
  const {
    studentId,
    studentName,
    group,
    date,
    verseBook,
    verseText,
    reflection,
    sentenceCount,
    avatarEmoji
  } = req.body;

  if (!studentId || !reflection) {
    return res.status(400).json({ error: 'Missing required fields (studentId, reflection)' });
  }

  const today = date || getTodayStr(0);
  const students = getStudents();
  let student = students.find((s: any) => s.id === studentId);

  if (!student) {
    student = {
      id: studentId,
      name: studentName?.trim() || '무명 순례자',
      group: group?.trim() || '중고등부 1반',
      streak: 1,
      bestStreak: 1,
      level: 1,
      exp: 50,
      totalDaysRead: 1,
      lastReadDate: today,
      titleName: '초보 순례자',
      titleIcon: '🌱',
      avatarEmoji: avatarEmoji || '🌱',
      lastActive: new Date().toISOString(),
      createdAt: today,
      completedHistory: {},
      journals: {},
    };
    students.push(student);
  }

  if (!student.journals) student.journals = {};

  const existingJournal = student.journals[today];
  const journalEntry = {
    id: existingJournal?.id || `j_${studentId}_${today}`,
    studentId: student.id,
    studentName: student.name,
    group: student.group,
    avatarEmoji: student.avatarEmoji || avatarEmoji || '🌱',
    date: today,
    verseBook: verseBook || '오늘의 말씀',
    verseText: verseText || '',
    reflection: reflection.trim(),
    sentenceCount: Number(sentenceCount) || 1,
    submittedAt: existingJournal?.submittedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teacherFeedback: existingJournal?.teacherFeedback || '',
    teacherFeedbackAt: existingJournal?.teacherFeedbackAt || '',
  };

  student.journals[today] = journalEntry;
  student.todayJournal = journalEntry;
  student.lastReadDate = today;
  student.lastActive = new Date().toISOString();

  if (!student.completedHistory) student.completedHistory = {};
  student.completedHistory[today] = {
    read: true,
    verseBook: verseBook || '오늘의 말씀',
    journalText: reflection.trim(),
    sentenceCount: Number(sentenceCount) || 1,
  };

  saveStudents(students);
  res.json({ success: true, journal: journalEntry, student });
});

// 2-2. [관리자 모드] 전체 학생 말씀 저널 목록 조회 API
app.get('/api/admin/journals', (req, res) => {
  const { date, group } = req.query;
  const students = getStudents();
  const allJournals: any[] = [];

  students.forEach((s: any) => {
    if (s.journals) {
      Object.values(s.journals).forEach((j: any) => {
        if (date && date !== 'all' && j.date !== date) return;
        if (group && group !== 'all' && s.group !== group) return;
        allJournals.push({
          ...j,
          studentName: s.name,
          studentGroup: s.group,
          avatarEmoji: s.avatarEmoji || '🌱',
        });
      });
    }
  });

  // 최신 제출일 순 정렬
  allJournals.sort((a, b) => new Date(b.submittedAt || b.date).getTime() - new Date(a.submittedAt || a.date).getTime());
  res.json({ success: true, journals: allJournals, total: allJournals.length });
});

// 2-3. [댓글/피드백 작성 API] 선생님 및 교역자 댓글 지원
app.post('/api/journals/comment', (req, res) => {
  const { studentId, date, authorName, authorRole, group, content } = req.body;
  if (!studentId || !date || !content || !content.trim()) {
    return res.status(400).json({ error: 'Missing studentId, date, or content' });
  }

  const students = getStudents();
  const student = students.find((s: any) => s.id === studentId);
  if (!student || !student.journals || !student.journals[date]) {
    return res.status(404).json({ error: 'Journal not found' });
  }

  const journal = student.journals[date];
  if (!Array.isArray(journal.comments)) {
    journal.comments = [];
    if (journal.teacherFeedback && journal.teacherFeedback.trim()) {
      journal.comments.push({
        id: 'c_migrated_' + (journal.teacherFeedbackAt || Date.now()),
        authorName: '담당 선생님',
        authorRole: 'teacher',
        content: journal.teacherFeedback,
        createdAt: journal.teacherFeedbackAt || new Date().toISOString(),
      });
    }
  }

  const newComment = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    authorName: authorName?.trim() || (authorRole === 'pastor' ? '교역자' : '담당 선생님'),
    authorRole: authorRole === 'pastor' ? 'pastor' : 'teacher',
    group: group?.trim() || student.group,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  journal.comments.push(newComment);
  // 하위 호환성을 위해 최신 댓글 내용 반영
  journal.teacherFeedback = content.trim();
  journal.teacherFeedbackAt = newComment.createdAt;

  saveStudents(students);
  res.json({ success: true, comment: newComment, comments: journal.comments, journal });
});

// 2-4. [관리자 모드] 학생 저널에 교사 격려/피드백 작성 API (하위 호환)
app.post('/api/admin/journals/feedback', (req, res) => {
  const { studentId, date, feedback, authorName, authorRole } = req.body;
  if (!studentId || !date) {
    return res.status(400).json({ error: 'Missing studentId or date' });
  }

  const students = getStudents();
  const student = students.find((s: any) => s.id === studentId);
  if (!student || !student.journals || !student.journals[date]) {
    return res.status(404).json({ error: 'Journal not found' });
  }

  const journal = student.journals[date];
  journal.teacherFeedback = feedback || '';
  journal.teacherFeedbackAt = new Date().toISOString();

  if (!Array.isArray(journal.comments)) {
    journal.comments = [];
  }
  if (feedback && feedback.trim()) {
    journal.comments.push({
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      authorName: authorName?.trim() || (authorRole === 'pastor' ? '교역자' : '담당 선생님'),
      authorRole: authorRole === 'pastor' ? 'pastor' : 'teacher',
      content: feedback.trim(),
      createdAt: journal.teacherFeedbackAt,
    });
  }

  saveStudents(students);
  res.json({ success: true, journal: student.journals[date] });
});

// 2-5. [통합 로그인 API] 학생(자신만의 비밀번호)/선생님/교역자 로그인
app.post('/api/auth/login', (req, res) => {
  const { role, name, password, group } = req.body;

  if (!role || !password) {
    return res.status(400).json({ error: '로그인 정보(아이디/이름 및 비밀번호)를 입력해 주세요.' });
  }

  const trimmedPassword = String(password).trim();
  const trimmedName = String(name || '').trim();

  // 1. 학생 로그인: 학생 개별 비밀번호 적용
  if (role === 'student') {
    if (!trimmedName) {
      return res.status(400).json({ error: '학생 이름을 입력해 주세요.' });
    }

    const students = getStudents();
    let student = students.find((s: any) => s.name.toLowerCase() === trimmedName.toLowerCase());

    if (student) {
      // 이미 비밀번호가 확정된 학생인 경우 비밀번호 검증
      if (student.hasCustomPassword && student.password) {
        const matches = student.password === trimmedPassword || trimmedPassword === '1004' || trimmedPassword === '1015';
        if (!matches) {
          return res.status(401).json({ 
            error: '비밀번호가 올바르지 않습니다. (비밀번호를 잊으셨다면 교역자님께 확인해 달라고 말씀해 주세요!)' 
          });
        }
      } else {
        // 처음 로그인하거나 기본 상태인 학생: 처음 입력한 숫자가 본인의 비밀번호로 확정 등록
        student.password = trimmedPassword;
        student.hasCustomPassword = true;
      }
      if (group && group.trim()) {
        student.group = group.replace(/선생님$/, '').trim();
      }
      saveStudents(students);
    } else {
      // 신규 학생: 첫 로그인 시 입력한 숫자가 비밀번호로 바로 등록
      const today = getTodayStr(0);
      const assignedTeacher = group?.replace(/선생님$/, '').trim() || '손충의';
      student = {
        id: 'student_' + Math.random().toString(36).substring(2, 9),
        name: trimmedName,
        password: trimmedPassword,
        hasCustomPassword: true,
        group: assignedTeacher,
        streak: 0,
        bestStreak: 0,
        level: 1,
        exp: 0,
        totalDaysRead: 0,
        lastReadDate: '',
        lastQuizDate: '',
        titleName: '초보 순례자',
        titleIcon: '🌱',
        avatarEmoji: '🌱',
        lastActive: new Date().toISOString(),
        createdAt: today,
        completedHistory: {},
        journals: {},
      };
      students.push(student);
      saveStudents(students);
    }

    return res.json({
      success: true,
      session: {
        role: 'student',
        id: student.id,
        name: student.name,
        group: student.group,
        avatarEmoji: student.avatarEmoji || '🌱',
      },
      profile: student,
    });
  }

  // 관리자/선생님/교역자 비밀번호 검증 (기본 1004 / 1015 및 서버 저장 커스텀 비밀번호)
  const serverAdminPin = getStoredAdminPinServer();
  const validAdminPassword = 
    trimmedPassword === '1004' || 
    trimmedPassword === '1015' || 
    (serverAdminPin && trimmedPassword === serverAdminPin);

  if (!validAdminPassword) {
    return res.status(401).json({ error: '비밀번호가 올바르지 않습니다. (기본 비밀번호: 1004 또는 1015)' });
  }

  // 2. 선생님 로그인
  if (role === 'teacher') {
    const rawTeacher = (trimmedName || group || '손충의').replace(/선생님$/, '').trim();
    return res.json({
      success: true,
      session: {
        role: 'teacher',
        id: 'teacher_' + rawTeacher,
        name: `${rawTeacher} 선생님`,
        group: rawTeacher,
      },
    });
  }

  // 3. 교역자 로그인
  if (role === 'pastor') {
    const pastorName = trimmedName || '교역자';
    return res.json({
      success: true,
      session: {
        role: 'pastor',
        id: 'pastor_main',
        name: pastorName,
        group: '전체',
      },
    });
  }

  res.status(400).json({ error: '올바르지 않은 사용자 역할입니다.' });
});

// 2-6. [학생 비밀번호 변경 API]
app.post('/api/auth/student/change-password', (req, res) => {
  const { studentId, currentPassword, newPassword } = req.body;
  if (!studentId || !newPassword || !String(newPassword).trim()) {
    return res.status(400).json({ error: '새 비밀번호를 입력해 주세요.' });
  }

  const students = getStudents();
  const student = students.find((s: any) => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: '학생 정보를 찾을 수 없습니다.' });
  }

  const curTrim = String(currentPassword || '').trim();
  const newTrim = String(newPassword).trim();

  // 기존 비밀번호가 설정되어 있는 경우 현재 비밀번호 검증 (1004/1015 관리자 복구도 허용)
  if (student.password) {
    const matches = student.password === curTrim || curTrim === '1004' || curTrim === '1015';
    if (!matches) {
      return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
    }
  }

  student.password = newTrim;
  saveStudents(students);

  res.json({
    success: true,
    message: '비밀번호가 성공적으로 변경되었습니다.',
    student: {
      id: student.id,
      name: student.name,
      group: student.group,
    },
  });
});

// 2-7. [교역자/관리자 전용] 학생 비밀번호 조회 및 재설정 API (학생이 비번을 분실했을 때)
app.post('/api/admin/students/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || !String(newPassword).trim()) {
    return res.status(400).json({ error: '새 비밀번호를 입력해 주세요.' });
  }

  const students = getStudents();
  const student = students.find((s: any) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: '학생 정보를 찾을 수 없습니다.' });
  }

  student.password = String(newPassword).trim();
  student.hasCustomPassword = true;
  saveStudents(students);

  res.json({
    success: true,
    message: `${student.name} 학생의 비밀번호가 성공적으로 변경되었습니다.`,
    student: {
      id: student.id,
      name: student.name,
      password: student.password,
    }
  });
});

// 2-6. [등록된 학생 목록 조회 API] 로그인 선택창 및 자동완성용
app.get('/api/auth/registered-students', (req, res) => {
  const students = getStudents();
  const list = students.map((s: any) => ({
    id: s.id,
    name: s.name,
    group: s.group,
    avatarEmoji: s.avatarEmoji || '🌱',
    level: s.level,
    streak: s.streak,
  }));
  res.json({ success: true, students: list });
});

// 3. [관리자 모드] 모든 학생 상세 데이터 & 통계 요약 조회 API
app.get('/api/admin/students', (req, res) => {
  const students = getStudents();
  const today = getTodayStr(0);

  const totalStudents = students.length;
  const readTodayCount = students.filter(s => s.lastReadDate === today).length;
  const journalTodayCount = students.filter(s => s.journals && s.journals[today] && s.journals[today].reflection).length;
  const quizTodayCount = journalTodayCount; // 하위 호환
  const totalStreakSum = students.reduce((sum, s) => sum + (Number(s.streak) || 0), 0);
  const averageStreak = totalStudents > 0 ? +(totalStreakSum / totalStudents).toFixed(1) : 0;

  // 고유 부서/반 목록 추출
  const groupSet = new Set<string>();
  students.forEach(s => {
    if (s.group) groupSet.add(s.group);
  });
  const groups = Array.from(groupSet);

  // 각 학생의 오늘 저널 정보 매핑
  const studentsWithToday = students.map(s => ({
    ...s,
    todayJournal: s.journals?.[today] || null,
  }));

  res.json({
    success: true,
    today,
    students: studentsWithToday,
    summary: {
      totalStudents,
      readTodayCount,
      journalTodayCount,
      quizTodayCount,
      averageStreak,
      groups,
    }
  });
});

// 4. [관리자 모드] 신규 학생 추가 또는 기존 정보 수정 API
app.post('/api/admin/students', (req, res) => {
  const { id, name, group, streak, level, exp, note, avatarEmoji } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Student name is required' });
  }

  const students = getStudents();
  const targetId = id || 'student_' + Math.random().toString(36).substring(2, 9);
  const existingIndex = students.findIndex(s => s.id === targetId);

  if (existingIndex >= 0) {
    const prev = students[existingIndex];
    students[existingIndex] = {
      ...prev,
      name: name.trim(),
      group: group?.trim() || prev.group,
      streak: streak !== undefined ? Number(streak) : prev.streak,
      bestStreak: Math.max(prev.bestStreak || 0, streak !== undefined ? Number(streak) : prev.streak),
      level: level !== undefined ? Number(level) : prev.level,
      exp: exp !== undefined ? Number(exp) : prev.exp,
      note: note !== undefined ? note : prev.note,
      avatarEmoji: avatarEmoji || prev.avatarEmoji,
      lastActive: new Date().toISOString(),
    };
    saveStudents(students);
    return res.json({ success: true, student: students[existingIndex] });
  } else {
    const newStudent = {
      id: targetId,
      name: name.trim(),
      group: group?.trim() || '손충의',
      streak: Number(streak) || 0,
      bestStreak: Number(streak) || 0,
      level: Number(level) || 1,
      exp: Number(exp) || 0,
      totalDaysRead: Number(streak) || 0,
      lastReadDate: '',
      lastQuizDate: '',
      titleName: '초보 순례자',
      titleIcon: '🌱',
      avatarEmoji: avatarEmoji || '🌱',
      lastActive: new Date().toISOString(),
      createdAt: getTodayStr(0),
      note: note || '',
      completedHistory: {},
    };
    students.push(newStudent);
    saveStudents(students);
    return res.json({ success: true, student: newStudent });
  }
});

// 5. [관리자 모드] 학생 삭제 API
app.delete('/api/admin/students/:id', (req, res) => {
  const { id } = req.params;
  const students = getStudents();
  const filtered = students.filter(s => s.id !== id);
  if (filtered.length === students.length) {
    return res.status(404).json({ error: 'Student not found' });
  }
  saveStudents(filtered);
  res.json({ success: true, message: 'Student removed successfully' });
});

// 6. [관리자 모드] 학생 교사 메모 저장 API
app.post('/api/admin/students/:id/note', (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const students = getStudents();
  const student = students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  student.note = note || '';
  saveStudents(students);
  res.json({ success: true, student });
});

// 7. [관리자 모드] 데이터 기본값 초기화
app.post('/api/admin/reset', (req, res) => {
  const defaults = generateDefaultStudents();
  saveStudents(defaults);
  res.json({ success: true, message: 'Reset to initial sample students completed' });
});

// 8. [관리자 모드] 비밀번호 검증 API
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  const trimmed = String(pin || '').trim();
  const serverAdminPin = getStoredAdminPinServer();
  const isValid = 
    trimmed === '1004' || 
    trimmed === '1015' || 
    (serverAdminPin && trimmed === serverAdminPin);

  res.json({ success: true, valid: Boolean(isValid) });
});

// 9. [관리자 모드] 비밀번호 변경 API
app.post('/api/admin/change-pin', (req, res) => {
  const { currentPin, newPin } = req.body;
  const trimmedCurrent = String(currentPin || '').trim();
  const trimmedNew = String(newPin || '').trim();
  const serverAdminPin = getStoredAdminPinServer();

  const isCurrentValid = 
    trimmedCurrent === '1004' || 
    trimmedCurrent === '1015' || 
    (serverAdminPin && trimmedCurrent === serverAdminPin);

  if (!isCurrentValid) {
    return res.status(400).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
  }

  if (!trimmedNew || trimmedNew.length < 4) {
    return res.status(400).json({ error: '새 비밀번호는 4자리 이상 입력해 주세요.' });
  }

  const saved = saveStoredAdminPinServer(trimmedNew);
  if (saved) {
    res.json({ success: true, message: '관리자 비밀번호가 성공적으로 변경되었습니다.' });
  } else {
    res.status(500).json({ error: '비밀번호 저장 중 오류가 발생했습니다.' });
  }
});

// Health check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bible Level Up Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
