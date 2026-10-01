import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Award, 
  BookOpen, 
  CheckCircle, 
  Star, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  Lock, 
  Trophy,
  Share2,
  User,
  Calendar,
  Check,
  ChevronLeft,
  ShieldCheck,
  PenTool,
  Quote,
  Heart,
  MessageSquare,
  BookMarked,
  HelpCircle,
  Sun,
  Moon,
  Type,
  School,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';

import { StudentProfile, DailyVerse, JournalEntry, UserSession, FontSizeOption } from './types';
import { STREAK_TITLES, getStreakTitle } from './data/titles';
import { 
  DAILY_VERSES, 
  getDailyVerse, 
  formatKoreanDate, 
  getTodayDateString 
} from './data/verses';
import { 
  loadStudentProfile, 
  saveStudentProfile, 
  checkIsReadToday, 
  checkIsJournalDoneToday,
  recordJournalCompletion, 
  recordReadingCompletion,
  countSentences,
  createDefaultProfile,
  loadUserSession,
  saveUserSession,
  loadFontSize,
  saveFontSize
} from './utils/storage';

import StudentProfileModal from './components/StudentProfileModal';
import ShareCardModal from './components/ShareCardModal';
import RankingBoard from './components/RankingBoard';
import AdminDashboard from './components/AdminDashboard';
import MyJournalsView from './components/MyJournalsView';
import LoginModal from './components/LoginModal';

const FONT_SIZE_LABELS: Record<FontSizeOption, string> = {
  sm: '작게',
  base: '보통',
  lg: '크게',
  xl: '아주 크게',
};

export default function BibleGameApp() {
  // 0. 사용자 로그인 세션 상태 (학생, 선생님, 교역자)
  const [currentSession, setCurrentSession] = useState<UserSession | null>(() => loadUserSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 1. 학생 프로필 영구저장 상태
  const [profile, setProfile] = useState<StudentProfile>(() => loadStudentProfile());

  // 2. 탭 상태 (home: 오늘의 말씀 & 저널, my-journals: 나의 저널 모음, ranking: 말씀 동행, profile: 내 칭호 도감)
  const [activeTab, setActiveTab] = useState<'home' | 'my-journals' | 'ranking' | 'profile'>('home');

  // 3. 매일 바뀌는 말씀 (날짜 오프셋을 두어 다른 날 말씀도 둘러보고 저널 작성 가능)
  const [dateOffset, setDateOffset] = useState<number>(0);
  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + dateOffset);
  const currentVerse: DailyVerse = getDailyVerse(selectedDate);
  const isViewingToday = dateOffset === 0;
  const targetDateStr = getTodayDateString(selectedDate);

  // 오늘 날짜 기준 완료 여부
  const isReadToday = checkIsReadToday(profile);
  const isJournalDoneToday = checkIsJournalDoneToday(profile);

  // 현재 선택된 날짜에 저장된 저널 정보
  const existingJournalForDate: JournalEntry | undefined = profile.journals?.[targetDateStr];

  // 4. 말씀 소감 저널 입력 상태
  const [journalInput, setJournalInput] = useState<string>('');
  const [isEditingJournal, setIsEditingJournal] = useState<boolean>(false);
  const [journalSaveFeedback, setJournalSaveFeedback] = useState<string | null>(null);

  // 날짜 변경 시 해당 날짜의 저널 내용으로 입력창 동기화
  useEffect(() => {
    const existing = profile.journals?.[targetDateStr];
    if (existing) {
      setJournalInput(existing.reflection);
      setIsEditingJournal(false);
    } else {
      setJournalInput('');
      setIsEditingJournal(true);
    }
  }, [targetDateStr, profile]);

  // 실시간 문장 수 계산 (5문장 체크)
  const sentenceCount = countSentences(journalInput);

  // 모달 상태
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);
  const [streakMilestoneModal, setStreakMilestoneModal] = useState<string | null>(null);

  // 5. 다크 모드 상태 관리
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('HOLY_BIBLE_THEME');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('HOLY_BIBLE_THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('HOLY_BIBLE_THEME', 'light');
    }
  }, [isDarkMode]);

  // 6. 글씨 크기 조절 관리 ('sm' | 'base' | 'lg' | 'xl')
  const [fontSize, setFontSize] = useState<FontSizeOption>(() => loadFontSize());
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  const handleSetFontSize = (size: FontSizeOption) => {
    setFontSize(size);
    saveFontSize(size);
  };

  const handleCycleFontSize = () => {
    const order: FontSizeOption[] = ['sm', 'base', 'lg', 'xl'];
    const nextIdx = (order.indexOf(fontSize) + 1) % order.length;
    handleSetFontSize(order[nextIdx]);
  };

  // 로그인 완료 처리
  const handleLoginSuccess = (session: UserSession, newProfile?: StudentProfile) => {
    setCurrentSession(session);
    saveUserSession(session);

    if (session.role === 'student') {
      if (newProfile) {
        setProfile(newProfile);
        saveStudentProfile(newProfile);
      } else {
        const updated = {
          ...profile,
          id: session.id,
          name: session.name,
          group: session.group || profile.group,
        };
        setProfile(updated);
        saveStudentProfile(updated);
      }
      setJournalSaveFeedback(`${session.name} 학생으로 로그인되었습니다!`);
    } else if (session.role === 'teacher') {
      setIsAdminDashboardOpen(true);
      setJournalSaveFeedback(`${session.name} (${session.group}) 선생님으로 로그인되었습니다.`);
    } else if (session.role === 'pastor') {
      setIsAdminDashboardOpen(true);
      setJournalSaveFeedback(`${session.name}으로 로그인되었습니다. 모든 학생 저널을 열람하실 수 있습니다.`);
    }
    setTimeout(() => setJournalSaveFeedback(null), 3000);
  };

  // 프로필 변경 시 로컬스토리지 자동 저장
  const updateProfile = (updatedFields: Partial<StudentProfile>) => {
    const updated = { ...profile, ...updatedFields };
    setProfile(updated);
    saveStudentProfile(updated);
  };

  // 말씀 소감 저널 제출 및 성경 읽기 완료 처리 (+50 EXP & 연속일수 증가 & 관리자 동기화)
  const handleSubmitJournal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!journalInput.trim()) {
      alert('말씀을 읽고 느낀 소감을 입력해 주세요.');
      return;
    }

    const previousStreak = profile.streak;
    const count = countSentences(journalInput);

    const { updatedProfile, leveledUp, newLevel } = await recordJournalCompletion(
      profile,
      currentVerse.book,
      currentVerse.text,
      journalInput.trim(),
      count,
      targetDateStr
    );

    setProfile(updatedProfile);
    setIsEditingJournal(false);

    // 새로운 칭호 획득 체크
    const newTitle = STREAK_TITLES.find(t => t.days === updatedProfile.streak);
    if (newTitle && updatedProfile.streak > previousStreak) {
      setStreakMilestoneModal(`${newTitle.icon} 새 칭호 [${newTitle.name}] 획득! (${newTitle.days}일 연속)`);
    }

    if (leveledUp) {
      setLevelUpModal(newLevel);
    }

    setJournalSaveFeedback('말씀 소감 저널이 저장되었습니다! 관리자 선생님께 전달됩니다.');
    setTimeout(() => setJournalSaveFeedback(null), 3000);
  };

  // 현재 스트릭 기반 칭호 정보
  const currentTitleInfo = getStreakTitle(profile.streak);
  const nextTargetTitle = STREAK_TITLES.find(t => t.days > profile.streak);
  const unlockedCount = STREAK_TITLES.filter(t => profile.streak >= t.days).length;

  // 빠른 테스트용 스트릭 변경
  const handleSetTestStreak = async (days: number) => {
    const titleInfo = getStreakTitle(days);
    const updated = {
      ...profile,
      streak: days,
      avatarEmoji: titleInfo.item.icon,
      bestStreak: Math.max(profile.bestStreak || 0, days),
    };
    setProfile(updated);
    saveStudentProfile(updated);
  };

  // 데이터 초기화
  const handleResetData = () => {
    if (window.confirm('정말 모든 기록(연속 읽기, 저널, 레벨)을 초기화하시겠습니까?')) {
      const fresh = createDefaultProfile();
      setProfile(fresh);
      saveStudentProfile(fresh);
      setJournalInput('');
      setIsEditingJournal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-0 sm:p-4 transition-colors duration-200">
      <div className="flex flex-col h-screen sm:h-[840px] w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 sm:shadow-2xl sm:rounded-3xl overflow-hidden font-sans relative border-x sm:border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        
        {/* 상단 헤더 */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-3 sm:px-4 py-2.5 flex justify-between items-center shadow-xs shrink-0 z-10 transition-colors duration-200">
          <div className="flex items-center space-x-2 min-w-0">
            <button 
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-base hover:scale-105 transition shrink-0"
              title="내 프로필 수정"
            >
              {currentTitleInfo.item.icon}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-tight truncate">
                  {currentSession ? currentSession.name : (profile.name || '성경 탐험가')}
                </h1>
                {currentSession && currentSession.role !== 'student' ? (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    currentSession.role === 'pastor' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' 
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                  }`}>
                    {currentSession.role === 'pastor' ? '✝️ 교역자' : `🧑‍🏫 ${currentSession.name}`}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-medium truncate max-w-[120px]">
                    {profile.group ? `${profile.group} 선생님 반` : '담당 미지정'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Lv.{profile.level} • {currentTitleInfo.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* 로그인 / 계정 전환 버튼 */}
            <button
              type="button"
              id="btn-login-account"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-bold transition shadow-2xs active:scale-95"
              title="로그인 및 계정 전환"
            >
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden xs:inline">{currentSession ? '계정 전환' : '로그인'}</span>
            </button>

            {/* 글씨 크기 조절 순환 토글 버튼 */}
            <button
              type="button"
              id="btn-toggle-font-size"
              onClick={handleCycleFontSize}
              className="p-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 shrink-0 flex items-center gap-0.5 text-xs font-bold"
              title={`글씨 크기 조절 (현재: ${FONT_SIZE_LABELS[fontSize]} - 클릭 시 순환)`}
              aria-label="글씨 크기 조절"
            >
              <Type className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] hidden xs:inline">{FONT_SIZE_LABELS[fontSize]}</span>
            </button>

            {/* 다크모드 토글 버튼 */}
            <button
              type="button"
              id="btn-toggle-darkmode"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 shrink-0"
              title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* 교사/관리자 모드 버튼 */}
            <button
              type="button"
              id="btn-open-admin-header"
              onClick={() => setIsAdminDashboardOpen(true)}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70 rounded-xl text-xs font-bold transition shadow-2xs active:scale-95"
              title="교사 및 관리자 모드: 학생 저널 및 통독 현황 확인"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden xs:inline">관리자</span>
            </button>

            {/* 연속 일수 배지 */}
            <div className="flex items-center space-x-1 bg-orange-50 dark:bg-orange-950/60 px-2 py-1 rounded-xl border border-orange-100 dark:border-orange-900/60 shadow-2xs shrink-0">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-xs font-black text-orange-600 dark:text-orange-400">{profile.streak}일</span>
            </div>
          </div>
        </header>

        {/* 토스트 피드백 알림 */}
        {journalSaveFeedback && (
          <div className="absolute top-14 left-4 right-4 z-40 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold p-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center justify-center gap-1.5 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{journalSaveFeedback}</span>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-3.5 pb-20 space-y-3.5">
          
          {/* 1. 홈 탭: 오늘의 말씀 & 5문장 저널링 */}
          {activeTab === 'home' && (
            <div className="space-y-3">
              
              {/* 날짜 네비게이터 & 오늘 표시 */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-850 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => setDateOffset(prev => prev - 1)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  title="이전 말씀"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{formatKoreanDate(selectedDate)}</span>
                  {!isViewingToday && (
                    <button
                      type="button"
                      onClick={() => setDateOffset(0)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 font-normal"
                    >
                      오늘로 복귀
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDateOffset(prev => prev + 1)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  title="다음 말씀"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 상단 프로필 & 레벨 진행 바 */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-4 py-3.5 rounded-2xl shadow-xs">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-white/20 text-[11px] px-2.5 py-0.5 rounded-full font-bold shrink-0">
                      Lv.{profile.level}
                    </span>
                    <span className="text-sm font-black truncate">{profile.name || '성도'} 님</span>
                    <span className="text-[11px] font-bold bg-white text-indigo-900 px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                      {currentTitleInfo.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-100 font-semibold shrink-0">
                    EXP {profile.exp}/{profile.level * 100} ({Math.min(100, Math.round((profile.exp / (profile.level * 100)) * 100))}%)
                  </div>
                </div>
                {/* 프로그레스 바 */}
                <div className="mt-2 w-full bg-black/25 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-300 h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${Math.min(100, (profile.exp / (profile.level * 100)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* 오늘의 말씀 본문 카드 (글씨 크기 4단계 직접 조절 지원) */}
              <div className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md border border-indigo-100/60 dark:border-indigo-800/50">
                      오늘의 말씀
                    </span>
                    <span className="text-[11px] font-medium text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-2 py-0.5 rounded-md border border-purple-100/60 dark:border-purple-800/50">
                      {currentVerse.theme}
                    </span>
                  </div>
                  
                  {/* 글자 크기 4단계 조절 버튼 바 */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {(['sm', 'base', 'lg', 'xl'] as FontSizeOption[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSetFontSize(sz)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                            fontSize === sz
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                          title={`글자 크기 ${FONT_SIZE_LABELS[sz]}`}
                        >
                          {FONT_SIZE_LABELS[sz]}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 ml-1">{currentVerse.book}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  {/* 한국어 말씀 본문 */}
                  <p className={`${
                    fontSize === 'xl'
                      ? 'text-xl sm:text-2xl leading-loose font-semibold'
                      : fontSize === 'lg'
                        ? 'text-lg sm:text-xl leading-loose font-medium'
                        : fontSize === 'base'
                          ? 'text-base sm:text-[17px] leading-relaxed sm:leading-loose font-medium'
                          : 'text-sm sm:text-base leading-relaxed font-normal'
                  } text-slate-800 dark:text-slate-100 tracking-wide transition-all`}>
                    "{currentVerse.text}"
                  </p>

                  {/* ESV 영어 성경 구절 */}
                  {currentVerse.textEsv && (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
                          📖 ESV
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-sans">
                          {currentVerse.bookEsv || currentVerse.book}
                        </span>
                      </div>
                      <p className={`${
                        fontSize === 'xl'
                          ? 'text-lg leading-loose'
                          : fontSize === 'lg'
                            ? 'text-base leading-relaxed'
                            : fontSize === 'base'
                              ? 'text-sm sm:text-[15px] leading-relaxed'
                              : 'text-xs leading-normal'
                      } font-normal text-slate-600 dark:text-slate-300 transition-all`}>
                        "{currentVerse.textEsv}"
                      </p>
                    </div>
                  )}

                  <p className={`${
                    fontSize === 'xl'
                      ? 'text-base leading-relaxed'
                      : fontSize === 'lg'
                        ? 'text-sm leading-relaxed'
                        : fontSize === 'base'
                          ? 'text-xs sm:text-[13px] leading-relaxed'
                          : 'text-[11px] leading-normal'
                  } text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800 leading-relaxed transition-all`}>
                    💡 <strong className="text-slate-800 dark:text-slate-200">묵상 길잡이:</strong> {currentVerse.reflection}
                  </p>
                </div>
              </div>

              {/* 성경을 읽고 소감을 남기는 말씀묵상 저널링 섹션 */}
              <div className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                      <PenTool className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      말씀묵상 저널링
                    </span>
                  </div>

                  {/* 저널 영역 글자 크기 동기화 표시 */}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    글씨 크기: {FONT_SIZE_LABELS[fontSize]}
                  </span>
                </div>

                {/* 작성 폼 또는 작성 완료 뷰 */}
                {existingJournalForDate && !isEditingJournal ? (
                  /* 이미 작성된 저널 표시 뷰 */
                  <div className="space-y-3">
                    <div className="bg-indigo-50/40 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 relative">
                      <Quote className="w-4 h-4 text-indigo-300 dark:text-indigo-600 absolute top-2.5 left-2.5 opacity-40" />
                      <p className={`${
                        fontSize === 'xl'
                          ? 'text-lg leading-loose'
                          : fontSize === 'lg'
                            ? 'text-base leading-loose font-medium'
                            : fontSize === 'base'
                              ? 'text-sm leading-relaxed sm:leading-loose'
                              : 'text-xs leading-relaxed'
                      } text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap pl-4`}>
                        {existingJournalForDate.reflection}
                      </p>
                      <div className="mt-2 pt-2 border-t border-indigo-100/60 dark:border-indigo-900/50 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
                        <span>선생님과 교역자가 열람 및 축복 중 ✅</span>
                        <span className="font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md text-[11px]">
                          ✍️ 총 {existingJournalForDate.sentenceCount}문장 작성됨
                        </span>
                      </div>
                    </div>

                    {/* 교사 및 교역자 댓글/피드백 표시 */}
                    {Array.isArray(existingJournalForDate.comments) && existingJournalForDate.comments.length > 0 ? (
                      <div className="space-y-1.5">
                        {existingJournalForDate.comments.map((c) => {
                          const isPastor = c.authorRole === 'pastor';
                          return (
                            <div
                              key={c.id}
                              className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                                isPastor
                                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span>{isPastor ? '✝️' : '🧑‍🏫'}</span>
                                  <span>{c.authorName}</span>
                                  <span className="text-[10px] opacity-75 font-normal">
                                    {isPastor ? '(교역자 축복)' : `(${c.group || '선생님 격려'})`}
                                  </span>
                                </div>
                                <span className="text-[10px] opacity-60">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <p className={`${
                                fontSize === 'xl'
                                  ? 'text-base leading-relaxed'
                                  : fontSize === 'lg'
                                    ? 'text-sm leading-relaxed'
                                    : 'text-xs leading-normal'
                              } pl-5 whitespace-pre-wrap`}>
                                "{c.content}"
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : existingJournalForDate.teacherFeedback ? (
                      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>선생님의 격려 피드백</span>
                        </div>
                        <p className={`${
                          fontSize === 'xl'
                            ? 'text-base leading-relaxed'
                            : fontSize === 'lg'
                              ? 'text-sm leading-relaxed'
                              : 'text-xs leading-normal'
                        } text-amber-800 dark:text-amber-300 pl-5`}>
                          "{existingJournalForDate.teacherFeedback}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1 px-1">
                        <span>💌 선생님과 교역자가 소감을 확인하고 곧 따뜻한 응원 댓글을 남깁니다.</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingJournal(true)}
                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition"
                      >
                        소감 수정하기
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-xs shadow-2xs transition flex items-center justify-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>인증카드 공유</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 소감 작성 / 수정 폼 */
                  <form onSubmit={handleSubmitJournal} className="space-y-2.5">
                    <div className="relative">
                      <textarea
                        rows={5}
                        value={journalInput}
                        onChange={(e) => setJournalInput(e.target.value)}
                        placeholder="오늘 말씀을 읽고 느낀 점, 삶의 결단, 감사와 기도를 자유롭게 기록해 보세요...&#10;(작성된 소감은 선생님과 교역자가 다 함께 읽고 응원해 드립니다)"
                        className={`w-full p-3 pb-8 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 leading-relaxed ${
                          fontSize === 'xl'
                            ? 'text-base'
                            : fontSize === 'lg'
                              ? 'text-sm'
                              : 'text-xs'
                        }`}
                      />

                      {/* 말씀묵상 저널링 박스 오른쪽 하단에 몇 문장 썼는지 실시간 표시 */}
                      <div className="absolute right-2.5 bottom-2.5 pointer-events-none flex items-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-2xs backdrop-blur-xs transition-all ${
                          sentenceCount > 0 
                            ? 'bg-purple-100/95 dark:bg-purple-900/90 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700' 
                            : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}>
                          ✍️ {sentenceCount}문장 작성됨
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-100 dark:shadow-none transition active:scale-[0.99] flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {existingJournalForDate ? '소감 수정하여 저장하기' : '소감 저널 등록하고 통독 완료하기 (+50 EXP)'}
                      </span>
                    </button>
                  </form>
                )}
              </div>

              {/* 연속 읽기 칭호 로드맵 요약 */}
              <div className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>연속 달성 칭호 현황</span>
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center"
                  >
                    <span>도감 전체보기</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>

                {nextTargetTitle ? (
                  <div className="bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{nextTargetTitle.icon}</span>
                      <div>
                        <div className="font-bold text-indigo-950 dark:text-indigo-200 text-[11px]">다음 목표: {nextTargetTitle.name} ({nextTargetTitle.days}일)</div>
                        <div className="text-indigo-600 dark:text-indigo-400 text-[10px]">{nextTargetTitle.days - profile.streak}일 더 연속 읽으면 달성!</div>
                      </div>
                    </div>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg shadow-2xs border border-indigo-100 dark:border-indigo-800 text-[11px]">
                      {profile.streak}/{nextTargetTitle.days}일
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-amber-900 dark:text-amber-200 font-bold">
                    <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>축하합니다! 9개의 모든 영적 칭호를 마스터하셨습니다!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. 나의 저널 모음 탭 */}
          {activeTab === 'my-journals' && (
            <MyJournalsView
              profile={profile}
              fontSize={fontSize}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onGoToToday={() => {
                setDateOffset(0);
                setActiveTab('home');
              }}
            />
          )}

          {/* 3. 말씀 동행 탭 */}
          {activeTab === 'ranking' && (
            <RankingBoard 
              currentProfile={profile}
              onOpenProfileEdit={() => setIsProfileModalOpen(true)}
            />
          )}

          {/* 4. 프로필 및 칭호 도감 탭 */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
                
                {/* 헤더 & 통계 */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 text-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span>나의 칭호 도감</span>
                    </h3>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => setIsProfileModalOpen(true)}
                        className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>프로필 수정</span>
                      </button>
                      <button 
                        id="btn-reset-data"
                        type="button"
                        onClick={handleResetData}
                        title="기록 초기화"
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>초기화</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    매일 성경을 읽고 9개의 영적 칭호를 모두 획득해 보세요.
                  </p>
                </div>

                {/* 교사 및 관리자 모드 바로가기 안내 카드 */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-100 dark:border-indigo-800/60 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-indigo-950 dark:text-indigo-200">교사 및 관리자 모드</div>
                      <div className="text-[11px] text-indigo-700 dark:text-indigo-300">모든 학생들의 5문장 저널 및 통독 현황 관리</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdminDashboardOpen(true)}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 shrink-0"
                  >
                    관리자 열기
                  </button>
                </div>

                {/* 수집 진행도 요약 카드 */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-3.5 rounded-xl shadow-xs border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-200">칭호 수집 현황</span>
                    </div>
                    <span className="text-xs font-bold text-amber-300">
                      {unlockedCount} / 9개 획득 ({Math.round((unlockedCount / 9) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(unlockedCount / 9) * 100}%` }}
                    ></div>
                  </div>

                  {/* 빠른 테스트용 스트릭 변경 버튼들 */}
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/10 text-[11px] text-slate-300 flex-wrap">
                    <span className="text-slate-400 text-[10px]">테스트 점프:</span>
                    <button 
                      type="button" 
                      onClick={() => handleSetTestStreak(7)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 hover:bg-white/20 text-slate-200"
                    >
                      7일
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSetTestStreak(15)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 hover:bg-white/20 text-slate-200"
                    >
                      15일
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSetTestStreak(30)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 hover:bg-white/20 text-slate-200"
                    >
                      30일
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSetTestStreak(100)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 hover:bg-white/20 text-slate-200"
                    >
                      100일 (면류관)
                    </button>
                  </div>
                </div>

                {/* 9개 칭호 리스트 */}
                <div className="space-y-2">
                  {STREAK_TITLES.map((item) => {
                    const isUnlocked = profile.streak >= item.days;
                    const isCurrent = currentTitleInfo.item.id === item.id;
                    const progressPercent = Math.min(100, Math.round((profile.streak / item.days) * 100));

                    return (
                      <div 
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isUnlocked 
                            ? `${item.borderActive} ${item.cardBgActive} dark:bg-indigo-950/30 dark:border-indigo-800/60 shadow-2xs` 
                            : 'border-slate-200/70 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 opacity-65'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs ${
                              isUnlocked ? 'bg-white dark:bg-slate-800' : 'bg-slate-200/60 dark:bg-slate-700 text-slate-400'
                            }`}>
                              {isUnlocked ? item.icon : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-bold text-xs ${isUnlocked ? item.badgeText : 'text-slate-700 dark:text-slate-300'}`}>
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  ({item.days}일)
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-600 text-white rounded-md">
                                    착용 중
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {isUnlocked ? (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeBg} ${item.badgeText}`}>
                                <Check className="w-3 h-3" />
                                획득
                              </span>
                            ) : (
                              <div className="text-right">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                                  {profile.streak}/{item.days}
                                </span>
                                <div className="w-14 bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-full rounded-full" 
                                    style={{ width: `${progressPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

        </main>

        {/* 레벨업 축하 모달 */}
        {levelUpModal !== null && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-6 animate-in fade-in">
            <div className="bg-white dark:bg-slate-850 dark:bg-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center space-y-4 border border-slate-100 dark:border-slate-700">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/60 text-amber-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                🎉
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">신앙 레벨 업!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  축하합니다! <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">Lv. {levelUpModal}</span> 성도가 되었습니다!
                </p>
              </div>
              <button
                id="btn-confirm-levelup"
                type="button"
                onClick={() => setLevelUpModal(null)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-100 dark:shadow-none transition active:scale-95 text-xs"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 칭호 달성 축하 모달 */}
        {streakMilestoneModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6 animate-in fade-in">
            <div className="bg-white dark:bg-slate-850 dark:bg-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center space-y-4 border border-slate-100 dark:border-slate-700">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/60 text-purple-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                👑
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">새 칭호 달성!</h3>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {streakMilestoneModal}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                말씀 동행 보드와 인증 카드에 새로운 칭호가 적용되었습니다!
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setStreakMilestoneModal(null);
                  setIsShareModalOpen(true);
                }}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1 text-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>카톡방에 칭호 자랑하기</span>
              </button>
              <button
                type="button"
                onClick={() => setStreakMilestoneModal(null)}
                className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 바 (4개 탭: 말씀&저널, 나의 저널, 말씀 동행, 칭호) */}
      <nav className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-3 py-2 flex justify-around items-center absolute bottom-0 left-0 right-0 max-w-md mx-auto shadow-lg z-20 transition-colors duration-200">
        {/* 1. 오늘의 말씀 & 저널 */}
        <button 
          id="tab-home"
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'home' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px]">말씀 & 저널</span>
        </button>

        {/* 2. 나의 저널 */}
        <button 
          id="tab-my-journals"
          type="button"
          onClick={() => setActiveTab('my-journals')}
          className={`relative flex flex-col items-center space-y-1 transition-colors ${activeTab === 'my-journals' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <div className="relative">
            <BookMarked className="w-5 h-5" />
            {Object.keys(profile.journals || {}).length > 0 && (
              <span className="absolute -top-1 -right-2 bg-purple-600 text-white text-[9px] px-1 rounded-full font-bold">
                {Object.keys(profile.journals || {}).length}
              </span>
            )}
          </div>
          <span className="text-[11px]">나의 저널</span>
        </button>

        {/* 3. 말씀 동행 (경쟁이 아닌 함께 걷는 은혜의 나눔) */}
        <button 
          id="tab-ranking"
          type="button"
          onClick={() => setActiveTab('ranking')}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'ranking' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[11px]">말씀 동행</span>
        </button>

        {/* 4. 칭호 도감 */}
        <button 
          id="tab-profile"
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[11px]">칭호 도감</span>
        </button>
      </nav>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSession={currentSession}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 학생 프로필 수정 모달 */}
      <StudentProfileModal
        profile={profile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={updateProfile}
      />

      {/* 말씀 완주 & 칭호 인증서 모달 */}
      <ShareCardModal
        profile={profile}
        verse={currentVerse}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* 교사 및 관리자 모드 대시보드 */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        currentUserId={profile.id}
        currentUserSession={currentSession}
        onSwitchAccount={() => {
          setIsAdminDashboardOpen(false);
          setIsLoginModalOpen(true);
        }}
        onRefreshParent={() => setProfile(loadStudentProfile())}
      />

      </div>
    </div>
  );
}
