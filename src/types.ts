export type UserRole = 'student' | 'teacher' | 'pastor';

export const TEACHERS_LIST = ['손충의', '이윤정', '한다현', '이재구'] as const;
export type TeacherName = typeof TEACHERS_LIST[number];

export interface UserSession {
  role: UserRole;
  id: string;
  name: string;
  group?: string;
  avatarEmoji?: string;
}

export interface JournalComment {
  id: string;
  authorName: string;
  authorRole: 'teacher' | 'pastor';
  group?: string;
  content: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  studentId: string;
  studentName: string;
  group: string;
  avatarEmoji?: string;
  date: string; // "YYYY-MM-DD"
  verseBook: string;
  verseText: string;
  reflection: string; // 학생의 소감 (5문장 내외)
  sentenceCount: number;
  submittedAt: string; // ISO string
  comments?: JournalComment[];
  teacherFeedback?: string; // 교사의 격려/피드백 (하위 호환)
  teacherFeedbackAt?: string;
}

export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';

export interface StudentProfile {
  id: string;
  name: string;
  group: string; // e.g. "중고등부 1반", "청년부", "유년부"
  password?: string; // 학생 개별 비밀번호
  hasCustomPassword?: boolean; // 첫 입력 비밀번호 확정 여부
  level: number;
  exp: number;
  streak: number;
  bestStreak: number;
  totalDaysRead: number;
  lastReadDate: string; // "YYYY-MM-DD"
  lastQuizDate?: string; // "YYYY-MM-DD" (하위호환용)
  completedHistory: Record<string, { read: boolean; quiz?: boolean; verseBook: string; journalText?: string; sentenceCount?: number }>;
  journals?: Record<string, JournalEntry>; // date -> JournalEntry
  avatarEmoji?: string;
  createdAt: string;
}

export interface TitleItem {
  id: string;
  days: number;
  name: string;
  icon: string;
  desc: string;
  themeColor: string;
  badgeBg: string;
  badgeText: string;
  borderActive: string;
  cardBgActive: string;
}

export interface StreakTitleInfo {
  title: string;
  color: string;
  item: TitleItem;
}

export interface DailyVerse {
  id: string;
  dateKey?: string; // Optional specific date "YYYY-MM-DD"
  book: string;
  bookEsv?: string;
  theme: string;
  text: string;
  textEsv?: string;
  quizPrompt?: string;
  blankWords?: string[];
  hint?: string;
  reflection: string;
}

export interface RankingUser {
  id: string;
  name: string;
  group: string;
  streak: number;
  level: number;
  exp: number;
  titleName: string;
  titleIcon: string;
  lastActive: string;
  isCurrentUser?: boolean;
}

export interface AdminStudent {
  id: string;
  name: string;
  group: string;
  password?: string; // 학생 개인 비밀번호 (교역자 확인용)
  hasCustomPassword?: boolean;
  streak: number;
  bestStreak: number;
  level: number;
  exp: number;
  totalDaysRead: number;
  lastReadDate: string;
  lastQuizDate?: string;
  titleName: string;
  titleIcon: string;
  avatarEmoji?: string;
  lastActive: string;
  createdAt?: string;
  completedHistory?: Record<string, { read: boolean; quiz?: boolean; verseBook: string; journalText?: string; sentenceCount?: number }>;
  journals?: Record<string, JournalEntry>;
  todayJournal?: JournalEntry;
  note?: string;
  isCurrentUser?: boolean;
}

export interface AdminSummary {
  totalStudents: number;
  readTodayCount: number;
  journalTodayCount: number;
  quizTodayCount?: number;
  averageStreak: number;
  groups: string[];
}

