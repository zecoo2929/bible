import { StudentProfile, RankingUser, UserSession, FontSizeOption } from '../types';
import { getStreakTitle } from '../data/titles';
import { getTodayDateString } from '../data/verses';

const STORAGE_KEY = 'BIBLE_LEVELUP_STUDENT_PROFILE_V2';
const SESSION_STORAGE_KEY = 'HOLY_BIBLE_USER_SESSION_V2';
const FONT_SIZE_STORAGE_KEY = 'HOLY_BIBLE_GLOBAL_FONT_SIZE';

// 사용자 세션 불러오기
export function loadUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

// 사용자 세션 저장하기
export function saveUserSession(session: UserSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (err) {
    console.error('Failed to save session', err);
  }
}

// 글씨 크기 불러오기 ('sm' | 'base' | 'lg' | 'xl')
export function loadFontSize(): FontSizeOption {
  if (typeof window === 'undefined') return 'base';
  try {
    const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSizeOption;
    if (saved === 'sm' || saved === 'base' || saved === 'lg' || saved === 'xl') {
      return saved;
    }
    return 'base';
  } catch {
    return 'base';
  }
}

// 글씨 크기 저장하기
export function saveFontSize(size: FontSizeOption): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
  } catch (err) {
    console.error('Failed to save font size', err);
  }
}

// 기본 프로필 생성 (학생이 처음 접속했을 때)
export function createDefaultProfile(name = '김다윗', group = '손충의', id = 'seed_1'): StudentProfile {
  const today = getTodayDateString();
  return {
    id,
    name,
    group,
    level: 1,
    exp: 0,
    streak: 0,
    bestStreak: 0,
    totalDaysRead: 0,
    lastReadDate: '',
    lastQuizDate: '',
    completedHistory: {},
    avatarEmoji: '🌱',
    createdAt: today,
  };
}

// 로컬스토리지에서 프로필 불러오기 (영구저장)
export function loadStudentProfile(): StudentProfile {
  if (typeof window === 'undefined') return createDefaultProfile();
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultProfile();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as StudentProfile;
    const streak = parsed.streak || 0;
    const titleEmoji = getStreakTitle(streak).item.icon;
    const validTeachers = ['손충의', '이윤정', '한다현', '이재구'];
    const finalGroup = validTeachers.includes(parsed.group) ? parsed.group : '손충의';
    // 필드 무결성 보장 및 칭호 연동 아바타 동기화
    return {
      ...createDefaultProfile(),
      ...parsed,
      group: finalGroup,
      avatarEmoji: titleEmoji,
      completedHistory: parsed.completedHistory || {},
    };
  } catch (err) {
    console.error('Failed to load profile from storage', err);
    return createDefaultProfile();
  }
}

// 로컬스토리지에 프로필 저장 및 서버 랭킹 동기화
export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    // 비동기 서버 랭킹 동기화 (네트워크 에러 시에도 로컬은 정상 동작)
    syncProfileToRankingServer(profile).catch(() => {
      // Offline fallback
    });
  } catch (err) {
    console.error('Failed to save profile to storage', err);
  }
}

// 어제 날짜 계산 (YYYY-MM-DD)
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getTodayDateString(d);
}

// 문장 수 계산 헬퍼 (마침표, 느낌표, 물음표 또는 줄바꿈 기준)
export function countSentences(text: string): number {
  if (!text || !text.trim()) return 0;
  const rawParts = text.split(/[.!?\n]+/);
  const valid = rawParts.map(p => p.trim()).filter(p => p.length >= 2);
  return valid.length;
}

// 말씀 소감 저널링 등록 및 성경 읽기 완료 처리 (스트릭 계산 & 경험치 50 지급)
export async function recordJournalCompletion(
  profile: StudentProfile,
  verseBook: string,
  verseText: string,
  reflection: string,
  sentenceCount: number,
  targetDate?: string
): Promise<{ updatedProfile: StudentProfile; leveledUp: boolean; newLevel: number }> {
  const today = targetDate || getTodayDateString();
  const yesterday = getYesterdayDateString();
  
  const isAlreadyReadToday = profile.lastReadDate === today;

  let newStreak = profile.streak;
  if (!isAlreadyReadToday) {
    if (profile.lastReadDate === yesterday) {
      newStreak += 1;
    } else if (!profile.lastReadDate) {
      newStreak = 1;
    } else {
      newStreak = 1;
    }
  }

  const bestStreak = Math.max(profile.bestStreak || 0, newStreak);
  const totalDaysRead = isAlreadyReadToday ? profile.totalDaysRead : (profile.totalDaysRead || 0) + 1;

  // 경험치 지급: 최초 완료 시 50 EXP (이미 읽었더라도 수정 시 소폭 추가/보존)
  const expGain = isAlreadyReadToday ? 0 : 50;
  let newExp = profile.exp + expGain;
  let newLevel = profile.level;
  let leveledUp = false;

  while (newExp >= newLevel * 100) {
    newExp -= newLevel * 100;
    newLevel += 1;
    leveledUp = true;
  }

  const history = { ...profile.completedHistory };
  history[today] = {
    read: true,
    verseBook,
    journalText: reflection.trim(),
    sentenceCount,
  };

  const titleInfo = getStreakTitle(newStreak);
  const syncedAvatar = titleInfo.item.icon;

  const journals = { ...(profile.journals || {}) };
  const existingEntry = journals[today];
  journals[today] = {
    id: existingEntry?.id || `j_${profile.id}_${today}`,
    studentId: profile.id,
    studentName: profile.name,
    group: profile.group,
    avatarEmoji: syncedAvatar,
    date: today,
    verseBook,
    verseText,
    reflection: reflection.trim(),
    sentenceCount,
    submittedAt: existingEntry?.submittedAt || new Date().toISOString(),
    teacherFeedback: existingEntry?.teacherFeedback,
    teacherFeedbackAt: existingEntry?.teacherFeedbackAt,
  };

  const updatedProfile: StudentProfile = {
    ...profile,
    avatarEmoji: syncedAvatar,
    streak: newStreak,
    bestStreak,
    totalDaysRead,
    exp: newExp,
    level: newLevel,
    lastReadDate: today,
    completedHistory: history,
    journals,
  };

  saveStudentProfile(updatedProfile);

  // 서버 API로 저널 즉시 동기화
  try {
    await fetch('/api/journals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: profile.id,
        studentName: profile.name,
        group: profile.group,
        date: today,
        verseBook,
        verseText,
        reflection,
        sentenceCount,
        avatarEmoji: syncedAvatar,
      }),
    });
  } catch (err) {
    console.warn('Offline or failed to sync journal to server', err);
  }

  return { updatedProfile, leveledUp, newLevel };
}

// 오늘 읽었는지 여부 확인
export function checkIsReadToday(profile: StudentProfile): boolean {
  const today = getTodayDateString();
  return profile.lastReadDate === today;
}

// 오늘 소감 저널 작성했는지 여부 확인
export function checkIsJournalDoneToday(profile: StudentProfile): boolean {
  const today = getTodayDateString();
  return Boolean(profile.journals?.[today]?.reflection && profile.journals[today].reflection.trim().length > 0);
}

// 성경 읽기 완료 처리 (스트릭 계산 & 경험치 지급)
export function recordReadingCompletion(profile: StudentProfile, verseBook: string): { updatedProfile: StudentProfile; leveledUp: boolean; newLevel: number } {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  
  if (profile.lastReadDate === today) {
    // 오늘 이미 읽음
    return { updatedProfile: profile, leveledUp: false, newLevel: profile.level };
  }

  let newStreak = profile.streak;
  if (profile.lastReadDate === yesterday) {
    // 어제 읽었으면 연속 스트릭 증가
    newStreak += 1;
  } else if (!profile.lastReadDate) {
    // 처음 읽는 날
    newStreak = 1;
  } else {
    // 하루 이상 놓쳤을 경우 새롭게 1일부터 시작 (기존 최고 기록은 bestStreak에 보존)
    newStreak = 1;
  }

  const bestStreak = Math.max(profile.bestStreak || 0, newStreak);
  const totalDaysRead = (profile.totalDaysRead || 0) + 1;

  // 경험치 50 추가
  const expGain = 50;
  let newExp = profile.exp + expGain;
  let newLevel = profile.level;
  let leveledUp = false;

  while (newExp >= newLevel * 100) {
    newExp -= newLevel * 100;
    newLevel += 1;
    leveledUp = true;
  }

  const history = { ...profile.completedHistory };
  history[today] = {
    read: true,
    quiz: history[today]?.quiz || false,
    verseBook,
  };

  const updatedProfile: StudentProfile = {
    ...profile,
    streak: newStreak,
    bestStreak,
    totalDaysRead,
    exp: newExp,
    level: newLevel,
    lastReadDate: today,
    completedHistory: history,
  };

  saveStudentProfile(updatedProfile);
  return { updatedProfile, leveledUp, newLevel };
}

// 암송 퀴즈 완료 처리 (경험치 30 추가)
export function recordQuizCompletion(profile: StudentProfile, verseBook: string): { updatedProfile: StudentProfile; leveledUp: boolean; newLevel: number } {
  const today = getTodayDateString();
  
  if (profile.lastQuizDate === today) {
    return { updatedProfile: profile, leveledUp: false, newLevel: profile.level };
  }

  const expGain = 30;
  let newExp = profile.exp + expGain;
  let newLevel = profile.level;
  let leveledUp = false;

  while (newExp >= newLevel * 100) {
    newExp -= newLevel * 100;
    newLevel += 1;
    leveledUp = true;
  }

  const history = { ...profile.completedHistory };
  history[today] = {
    read: history[today]?.read || false,
    quiz: true,
    verseBook,
  };

  const updatedProfile: StudentProfile = {
    ...profile,
    exp: newExp,
    level: newLevel,
    lastQuizDate: today,
    completedHistory: history,
  };

  saveStudentProfile(updatedProfile);
  return { updatedProfile, leveledUp, newLevel };
}

// 서버 랭킹 및 학생 데이터 API와 동기화
async function syncProfileToRankingServer(profile: StudentProfile): Promise<void> {
  const title = getStreakTitle(profile.streak);
  const body = {
    id: profile.id,
    name: profile.name || '무명 순례자',
    group: profile.group || '교회 청소년부',
    streak: profile.streak,
    bestStreak: profile.bestStreak || profile.streak,
    level: profile.level,
    exp: profile.exp,
    totalDaysRead: profile.totalDaysRead || 0,
    lastReadDate: profile.lastReadDate || '',
    lastQuizDate: profile.lastQuizDate || '',
    avatarEmoji: title.item.icon,
    completedHistory: profile.completedHistory || {},
    titleName: title.item.name,
    titleIcon: title.item.icon,
    lastActive: new Date().toISOString(),
  };

  try {
    await fetch('/api/rankings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Ignore network errors in local dev or offline mode
  }
}
