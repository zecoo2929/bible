import { AdminStudent, JournalEntry } from '../types';

export function getTodayDateKey(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultAdminStudents(): AdminStudent[] {
  const today = getTodayDateKey(0);
  const yesterday = getTodayDateKey(-1);
  const twoDaysAgo = getTodayDateKey(-2);
  const threeDaysAgo = getTodayDateKey(-3);

  return [
    {
      id: 'seed_1',
      name: '김다윗',
      group: '손충의',
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
      createdAt: getTodayDateKey(-25),
      note: '손충의 선생님 반. 매일 말씀 묵상과 5문장 저널링을 성실하게 실천함',
      completedHistory: {
        [today]: { read: true, verseBook: '시편 119:105', journalText: '오늘 말씀을 읽으며 내 삶의 어두운 순간마다 오직 하나님의 말씀만이 진정한 빛이 됨을 깨달았습니다. 세상의 기준이나 친구들의 말이 아니라 성경 속 진리를 먼저 바라보아야겠다고 느꼈습니다. 최근 시험과 진로 고민으로 답답했는데 주님께서 발걸음을 인도해 주신다는 약속에 큰 위로를 얻었습니다. 오늘 하루 작은 결정을 내릴 때도 성급하게 판단하지 않고 기도로 여쭈어보겠습니다. 주님, 제 인생의 길목마다 흔들리지 않도록 주의 말씀의 등불을 밝혀 주세요.', sentenceCount: 5 },
        [yesterday]: { read: true, verseBook: '잠언 3:5-6', journalText: '내 명철을 의지하지 않고 주님을 전적으로 신뢰해야 한다는 교훈을 마음에 새겼습니다. 매일 아침 기도로 시작하는 습관을 지켜나가겠습니다.', sentenceCount: 2 },
      },
      journals: {
        [today]: {
          id: `j_seed_1_${today}`,
          studentId: 'seed_1',
          studentName: '김다윗',
          group: '손충의',
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
              authorName: '손충의 선생님',
              authorRole: 'teacher',
              group: '손충의',
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
      group: '이윤정',
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
      createdAt: getTodayDateKey(-20),
      note: '이윤정 선생님 반. 소감 나눔이 매우 솔직하고 깊이 있음. 찬양팀 봉사 중',
      completedHistory: {
        [today]: { read: true, verseBook: '빌립보서 4:13', journalText: '내가 할 수 없다고 여겼던 학업과 인간관계의 무게를 주님 앞에 내려놓습니다. 내 힘으로 아등바등할 때는 늘 지치고 낙심했지만 능력 주시는 예수님 안에서는 모든 것이 가능함을 다시금 마음에 새깁니다. 주님을 의지할 때 비로소 진정한 평안과 담대함이 찾아온다는 것을 배웠습니다. 오늘 학교에서 힘들거나 부담스러운 일을 마주할 때마다 이 구절을 마음속으로 되뇌이겠습니다. 언제나 내 곁에서 새로운 용기와 능력을 부어주시는 주님을 찬양합니다.', sentenceCount: 5 },
      },
      journals: {
        [today]: {
          id: `j_seed_2_${today}`,
          studentId: 'seed_2',
          studentName: '박하은',
          group: '이윤정',
          avatarEmoji: '🛡️',
          date: today,
          verseBook: '빌립보서 4:13',
          verseText: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
          reflection: '내가 할 수 없다고 여겼던 학업과 인간관계의 무게를 주님 앞에 내려놓습니다. 내 힘으로 아등바등할 때는 늘 지치고 낙심했지만 능력 주시는 예수님 안에서는 모든 것이 가능함을 다시금 마음에 새깁니다. 주님을 의지할 때 비로소 진정한 평안과 담대함이 찾아온다는 것을 배웠습니다. 오늘 학교에서 힘들거나 부담스러운 일을 마주할 때마다 이 구절을 마음속으로 되뇌이겠습니다. 언제나 내 곁에서 새로운 용기와 능력을 부어주시는 주님을 찬양합니다.',
          sentenceCount: 5,
          submittedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
          teacherFeedback: '하은아, 주님 안에서 능치 못함이 없단다! 항상 기도하며 응원할게 ✨',
          teacherFeedbackAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          comments: [
            {
              id: 'c_seed_2_teacher',
              authorName: '이윤정 선생님',
              authorRole: 'teacher',
              group: '이윤정',
              content: '하은아, 주님 안에서 능치 못함이 없단다! 항상 기도하며 응원할게 ✨',
              createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
            }
          ]
        }
      }
    },
    {
      id: 'seed_3',
      name: '이요한',
      group: '손충의',
      streak: 7,
      bestStreak: 14,
      level: 3,
      exp: 90,
      totalDaysRead: 14,
      lastReadDate: today,
      lastQuizDate: today,
      titleName: '성령의 검',
      titleIcon: '⚔️',
      avatarEmoji: '⚔️',
      lastActive: new Date().toISOString(),
      createdAt: getTodayDateKey(-14),
      note: '손충의 선생님 반. 7일 연속 돌파! 최근 통독 집중도 매우 향상',
      completedHistory: {
        [today]: { read: true, verseBook: '잠언 3:5-6', journalText: '스스로의 똑똑함을 믿기보다 마음을 다해 하나님을 인정하는 지혜를 구합니다. 시험 준비로 바쁠 때 기도시간을 빼먹지 않겠습니다. 친구들과 대화할 때도 주님의 지혜로 사랑의 말을 건네겠습니다. 나의 좁은 생각보다 주님의 넓으신 계획을 신뢰하며 나아가겠습니다. 언제나 내 걸음을 바른길로 지도하시는 하나님을 사랑합니다.', sentenceCount: 5 },
      },
      journals: {
        [today]: {
          id: `j_seed_3_${today}`,
          studentId: 'seed_3',
          studentName: '이요한',
          group: '손충의',
          avatarEmoji: '⚔️',
          date: today,
          verseBook: '잠언 3:5-6',
          verseText: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라',
          reflection: '스스로의 똑똑함을 믿기보다 마음을 다해 하나님을 인정하는 지혜를 구합니다. 시험 준비로 바쁠 때 기도시간을 빼먹지 않겠습니다. 친구들과 대화할 때도 주님의 지혜로 사랑의 말을 건네겠습니다. 나의 좁은 생각보다 주님의 넓으신 계획을 신뢰하며 나아가겠습니다. 언제나 내 걸음을 바른길로 지도하시는 하나님을 사랑합니다.',
          sentenceCount: 5,
          submittedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        }
      }
    },
    {
      id: 'seed_4',
      name: '정에스더',
      group: '한다현',
      streak: 30,
      bestStreak: 30,
      level: 6,
      exp: 340,
      totalDaysRead: 35,
      lastReadDate: today,
      lastQuizDate: yesterday,
      titleName: '빛의 인도자',
      titleIcon: '📖',
      avatarEmoji: '📖',
      lastActive: new Date().toISOString(),
      createdAt: getTodayDateKey(-35),
      note: '한다현 선생님 반. 30일 개근 달성! 칭호 빛의 인도자 수여 예정',
      completedHistory: {
        [today]: { read: true, verseBook: '시편 23편', journalText: '여호와가 나의 목자이시니 내게 부족함이 없다는 고백이 오늘 제 가슴을 깊이 울렸습니다. 늘 무언가 부족하다고 불평하고 미래에 대해 불안해했던 제 모습을 솔직하게 회개했습니다. 푸른 풀밭과 쉴 만한 물가로 인도하시는 선한 목자 되신 하나님을 온전히 신뢰하기로 결단합니다. 오늘 하루는 부족한 것에 집착하기보다 이미 제게 주신 풍성한 은혜들을 하나하나 세어보며 감사하겠습니다. 선하심과 인자하심이 평생 저를 따를 것을 믿으며 주님과 동행하는 하루가 되길 기도합니다.', sentenceCount: 5 },
      },
      journals: {
        [today]: {
          id: `j_seed_4_${today}`,
          studentId: 'seed_4',
          studentName: '정에스더',
          group: '한다현',
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
      group: '이재구',
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
      createdAt: getTodayDateKey(-18),
      note: '이재구 선생님 반. 매일 부모님과 함께 통독 및 소감 작성 참여',
      completedHistory: {
        [today]: { read: true, verseBook: '시편 119:105', journalText: '성경 말씀이 등불이라는 말씀이 재미있고 신기했습니다. 어두운 방에서 불을 켜면 환해지듯이 하나님 말씀이 제 마음을 밝혀줍니다. 학교에서 착한 어린이가 되도록 말씀대로 순종하겠습니다. 밤에 잘 때 무서워하지 않고 하나님이 지켜주심을 믿겠습니다. 저를 사랑하시는 예수님 이름으로 기도드렸습니다, 아멘!', sentenceCount: 5 },
      },
      journals: {
        [today]: {
          id: `j_seed_5_${today}`,
          studentId: 'seed_5',
          studentName: '강은혜',
          group: '이재구',
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
              authorName: '이재구 선생님',
              authorRole: 'teacher',
              group: '이재구',
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
      group: '이윤정',
      streak: 0,
      bestStreak: 10,
      level: 2,
      exp: 20,
      totalDaysRead: 11,
      lastReadDate: threeDaysAgo,
      titleName: '성령의 검',
      titleIcon: '⚔️',
      avatarEmoji: '⚔️',
      lastActive: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      createdAt: getTodayDateKey(-12),
      note: '이윤정 선생님 반. 3일 결석 상태. 담당 교사 심방 요망',
      completedHistory: {
        [threeDaysAgo]: { read: true, quiz: true, verseBook: '빌립보서 4:13' },
      }
    },
    {
      id: 'seed_7',
      name: '한마리아',
      group: '한다현',
      streak: 2,
      bestStreak: 5,
      level: 1,
      exp: 80,
      totalDaysRead: 5,
      lastReadDate: today,
      titleName: '초보 순례자',
      titleIcon: '🌱',
      avatarEmoji: '🌱',
      lastActive: new Date().toISOString(),
      createdAt: getTodayDateKey(-5),
      note: '한다현 선생님 반. 이번 달 신규 등록. 성경 통독 습관 형성 중',
      completedHistory: {
        [today]: { read: true, quiz: false, verseBook: '시편 23편' },
        [yesterday]: { read: true, quiz: false, verseBook: '잠언 3:5-6' },
      }
    },
    {
      id: 'seed_8',
      name: '임바울',
      group: '이재구',
      streak: 0,
      bestStreak: 9,
      level: 2,
      exp: 40,
      totalDaysRead: 9,
      lastReadDate: twoDaysAgo,
      titleName: '초보 순례자',
      titleIcon: '✝️',
      avatarEmoji: '✝️',
      lastActive: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      createdAt: getTodayDateKey(-15),
      note: '이재구 선생님 반. 시험 기간 후 복귀 독려',
      completedHistory: {
        [twoDaysAgo]: { read: true, quiz: false, verseBook: '요한복음 14:6' },
      }
    }
  ];
}

export function getDefaultAdminJournals(): JournalEntry[] {
  const students = getDefaultAdminStudents();
  const list: JournalEntry[] = [];
  students.forEach(s => {
    if (s.journals) {
      Object.values(s.journals).forEach(j => {
        list.push(j);
      });
    }
  });
  return list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
