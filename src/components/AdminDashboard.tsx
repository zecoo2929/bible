import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Award, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  RotateCcw, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  AlertCircle,
  LogOut,
  Send,
  FileSpreadsheet,
  PenTool,
  Quote,
  Heart,
  Eye,
  EyeOff,
  KeyRound,
  Type,
  User,
  School
} from 'lucide-react';
import { AdminStudent, AdminSummary, JournalEntry, UserSession, FontSizeOption, TEACHERS_LIST } from '../types';
import { STREAK_TITLES, getStreakTitle } from '../data/titles';
import { loadFontSize, saveFontSize } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserSession?: UserSession | null;
  onSwitchAccount?: () => void;
  onRefreshParent?: () => void;
}

const DEFAULT_PINS = ['1004', '1015'];
const AUTH_STORAGE_KEY = 'BIBLE_ADMIN_AUTH_TOKEN_V1';
const PIN_STORAGE_KEY = 'HOLY_SEED_ADMIN_PIN_KEY';

function getStoredAdminPin(): string {
  if (typeof window === 'undefined') return '1015';
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) || '1015';
  } catch {
    return '1015';
  }
}

function checkIsPinValidLocally(pin: string): boolean {
  const trimmed = pin.trim();
  if (!trimmed) return false;
  if (DEFAULT_PINS.includes(trimmed)) return true;
  const customPin = getStoredAdminPin();
  return trimmed === customPin;
}

export default function AdminDashboard({ 
  isOpen, 
  onClose, 
  currentUserId, 
  currentUserSession, 
  onSwitchAccount, 
  onRefreshParent 
}: Props) {
  // 인증 상태 (선생님이나 교역자로 로그인되어 있다면 즉시 인증 통과)
  const isTeacher = currentUserSession?.role === 'teacher';
  const isPastor = currentUserSession?.role === 'pastor';
  const teacherName = isTeacher ? (currentUserSession.group || currentUserSession.name.replace(/선생님$/, '').trim()) : '';
  const isTeacherOrPastor = isTeacher || isPastor;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (isTeacherOrPastor) return true;
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    if (isTeacherOrPastor) {
      setIsAuthenticated(true);
    }
  }, [isTeacherOrPastor]);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // 관리자 비밀번호 변경 상태
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [currentPinCheck, setCurrentPinCheck] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [changePinError, setChangePinError] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);

  // 대시보드 서브 탭: 'journals' (말씀 저널 전체 열람) | 'students' (학생 통독 & 출석 명단)
  const [adminTab, setAdminTab] = useState<'journals' | 'students'>('journals');

  // 데이터 상태
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [todayStr, setTodayStr] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 저널 데이터 상태 (선생님인 경우 본인 담당 반 기본 필터링)
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [journalDateFilter, setJournalDateFilter] = useState<string>('all');
  const [journalGroupFilter, setJournalGroupFilter] = useState<string>(() => {
    if (isTeacher && teacherName) {
      return teacherName;
    }
    return 'all';
  });
  const [journalSearchQuery, setJournalSearchQuery] = useState('');

  // 교사 피드백 입력 상태 (studentId_date -> text)
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [savingFeedbackKey, setSavingFeedbackKey] = useState<string | null>(null);

  // 학생 목록 필터 & 검색 상태
  const [selectedGroup, setSelectedGroup] = useState<string>(() => {
    if (isTeacher && teacherName) {
      return teacherName;
    }
    return 'all';
  });

  // 선생님이나 교역자 로그인/모달 오픈 시 담당 학생 필터 동기화
  useEffect(() => {
    if (isTeacher && teacherName) {
      setSelectedGroup(teacherName);
      setJournalGroupFilter(teacherName);
    } else if (isPastor) {
      setSelectedGroup('all');
      setJournalGroupFilter('all');
    }
  }, [currentUserSession, isOpen, isTeacher, isPastor, teacherName]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'read_done' | 'read_pending' | 'journal_done' | 'journal_pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'streak' | 'level' | 'name' | 'lastActive'>('streak');

  // 상세 모달 상태
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [studentNewPwInput, setStudentNewPwInput] = useState('');
  const [savingStudentPw, setSavingStudentPw] = useState(false);

  // 교사 메모 편집 상태
  const [editingNote, setEditingNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // 글씨 크기 조절 상태 ('sm' | 'base' | 'lg' | 'xl')
  const [fontSize, setFontSize] = useState<FontSizeOption>(() => loadFontSize());
  const handleSetFontSize = (size: FontSizeOption) => {
    setFontSize(size);
    saveFontSize(size);
  };

  // 토스트 피드백 메시지
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 학생 목록 및 통계 데이터 로드
  const fetchStudentsData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
        setSummary(data.summary || null);
        setTodayStr(data.today || new Date().toISOString().slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to load admin students data:', err);
      showToast('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 전체 학생 저널 목록 로드
  const fetchJournalsData = async () => {
    try {
      const res = await fetch('/api/admin/journals');
      const data = await res.json();
      if (data.success) {
        setJournals(data.journals || []);
      }
    } catch (err) {
      console.error('Failed to load journals:', err);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchStudentsData();
      fetchJournalsData();
    }
  }, [isOpen, isAuthenticated]);

  // 관리자 PIN 확인
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pinInput.trim();
    if (!entered) return;

    let isValid = checkIsPinValidLocally(entered);

    // 로컬 검증이 안 된 경우 서버의 저장된 비밀번호 API로도 확인
    if (!isValid) {
      try {
        const res = await fetch('/api/admin/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: entered }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            isValid = true;
          }
        }
      } catch {
        // 네트워크 오류 시 로컬 결과 유지
      }
    }

    if (isValid) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setPinError(false);
      setPinInput('');
      fetchStudentsData();
      fetchJournalsData();
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setPinInput('');
    setShowPin(false);
  };

  // 관리자 비밀번호 변경 제출
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCurrent = currentPinCheck.trim();
    const trimmedNew = newPinInput.trim();
    const trimmedConfirm = confirmNewPinInput.trim();

    let isCurrentValid = checkIsPinValidLocally(trimmedCurrent);

    if (!isCurrentValid) {
      try {
        const verifyRes = await fetch('/api/admin/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: trimmedCurrent }),
        });
        if (verifyRes.ok) {
          const data = await verifyRes.json();
          if (data.valid) isCurrentValid = true;
        }
      } catch {
        // fallback
      }
    }

    if (!isCurrentValid) {
      setChangePinError('현재 비밀번호가 올바르지 않습니다.');
      return;
    }
    if (!trimmedNew || trimmedNew.length < 4) {
      setChangePinError('새 비밀번호는 4자리 이상 입력해 주세요.');
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setChangePinError('새 비밀번호와 확인 입력이 일치하지 않습니다.');
      return;
    }

    try {
      localStorage.setItem(PIN_STORAGE_KEY, trimmedNew);

      // 서버에도 동기화 저장
      fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin: trimmedCurrent, newPin: trimmedNew }),
      }).catch(() => {});

      showToast('관리자 비밀번호가 성공적으로 변경되었습니다.');
      setIsChangePinModalOpen(false);
      setCurrentPinCheck('');
      setNewPinInput('');
      setConfirmNewPinInput('');
      setChangePinError('');
    } catch {
      setChangePinError('비밀번호 저장 중 오류가 발생했습니다.');
    }
  };

  // 관리자 비밀번호 기본값 초기화
  const handleResetPinToDefault = () => {
    if (window.confirm('관리자 비밀번호를 기본 설정으로 초기화하시겠습니까?')) {
      try {
        localStorage.removeItem(PIN_STORAGE_KEY);
        showToast('관리자 비밀번호가 기본값으로 초기화되었습니다.');
        setIsChangePinModalOpen(false);
        setCurrentPinCheck('');
        setNewPinInput('');
        setConfirmNewPinInput('');
        setChangePinError('');
      } catch {
        setChangePinError('초기화 중 오류가 발생했습니다.');
      }
    }
  };

  // 고유 그룹 목록
  const allGroups = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.group) set.add(s.group);
    });
    return Array.from(set);
  }, [students]);

  // 선생님 로그인 시 담당 학생 기준 데이터, 교역자 로그인 시 전체 기준 데이터
  const targetStudents = useMemo(() => {
    if (isTeacher && teacherName) {
      return students.filter(s => s.group === teacherName);
    }
    return students;
  }, [isTeacher, teacherName, students]);

  const targetJournals = useMemo(() => {
    if (isTeacher && teacherName) {
      return journals.filter(j => j.group === teacherName);
    }
    return journals;
  }, [isTeacher, teacherName, journals]);

  // 저널 고유 날짜 목록
  const allJournalDates = useMemo(() => {
    const set = new Set<string>();
    journals.forEach(j => {
      if (j.date) set.add(j.date);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [journals]);

  // 필터링된 저널 목록
  const filteredJournals = useMemo(() => {
    return journals.filter(j => {
      if (journalDateFilter !== 'all' && j.date !== journalDateFilter) return false;
      if (journalGroupFilter !== 'all' && j.group !== journalGroupFilter) return false;
      if (journalSearchQuery.trim()) {
        const q = journalSearchQuery.trim().toLowerCase();
        const matchName = j.studentName.toLowerCase().includes(q);
        const matchGroup = j.group.toLowerCase().includes(q);
        const matchVerse = j.verseBook.toLowerCase().includes(q);
        const matchReflection = j.reflection.toLowerCase().includes(q);
        if (!matchName && !matchGroup && !matchVerse && !matchReflection) return false;
      }
      return true;
    });
  }, [journals, journalDateFilter, journalGroupFilter, journalSearchQuery]);

  // 필터링 및 검색된 학생 목록
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // 반 필터
      if (selectedGroup !== 'all' && student.group !== selectedGroup) {
        return false;
      }
      // 상태 필터
      const isReadToday = student.lastReadDate === todayStr;
      const hasJournalToday = Boolean(student.todayJournal?.reflection || student.journals?.[todayStr]?.reflection);

      if (statusFilter === 'read_done' && !isReadToday) return false;
      if (statusFilter === 'read_pending' && isReadToday) return false;
      if (statusFilter === 'journal_done' && !hasJournalToday) return false;
      if (statusFilter === 'journal_pending' && hasJournalToday) return false;

      // 검색어 필터 (이름, 반)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesGroup = student.group.toLowerCase().includes(query);
        if (!matchesName && !matchesGroup) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'streak') return b.streak - a.streak;
      if (sortBy === 'level') return b.level - a.level || b.exp - a.exp;
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
      if (sortBy === 'lastActive') {
        return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
      }
      return 0;
    });
  }, [students, selectedGroup, statusFilter, searchQuery, sortBy, todayStr]);

  // 저널에 교사 또는 교역자 피드백/댓글 저장
  const handleSaveTeacherFeedback = async (studentId: string, date: string) => {
    const key = `${studentId}_${date}`;
    const text = feedbackInputs[key] ?? '';
    if (!text.trim()) {
      showToast('격려 피드백 내용을 입력해주세요.');
      return;
    }

    setSavingFeedbackKey(key);
    try {
      const authorName = currentUserSession?.name || (currentUserSession?.role === 'pastor' ? '교역자' : '담당 선생님');
      const authorRole = currentUserSession?.role === 'pastor' ? 'pastor' : 'teacher';
      const authorGroup = currentUserSession?.group;

      const res = await fetch('/api/journals/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId, 
          date, 
          authorName,
          authorRole,
          group: authorGroup,
          content: text.trim() 
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('격려 피드백이 등록되었습니다! 학생 저널에 전달됩니다.');
        setEditingFeedbackId(null);
        setFeedbackInputs(prev => ({ ...prev, [key]: '' }));
        fetchJournalsData();
        fetchStudentsData();
      }
    } catch (err) {
      console.error('Failed to save feedback:', err);
      showToast('피드백 저장에 실패했습니다.');
    } finally {
      setSavingFeedbackKey(null);
    }
  };

  // 단일 저널 소감 텍스트 복사
  const handleCopySingleJournal = (j: JournalEntry) => {
    const text = `[📖 말씀 묵상 소감 저널 나눔]\n성도: ${j.studentName} (${j.group})\n본문: ${j.verseBook}\n"${j.verseText}"\n\n✍️ 묵상 소감 (${j.sentenceCount}문장):\n${j.reflection}${j.teacherFeedback ? `\n\n💌 교사 격려: "${j.teacherFeedback}"` : ''}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${j.studentName} 성도의 말씀 소감이 복사되었습니다!`);
    });
  };

  // 오늘 작성된 전체 저널 모음 단톡방 공지 텍스트 복사
  const handleCopyAllTodayJournals = () => {
    const todays = journals.filter(j => j.date === todayStr);
    if (!todays.length) {
      showToast('오늘 작성된 말씀 저널이 아직 없습니다.');
      return;
    }

    let msg = `[⛪ 오늘 성경 말씀묵상 저널 나눔 요약 (${todayStr})]\n\n`;
    todays.forEach((j, idx) => {
      msg += `📌 [${idx + 1}] ${j.studentName} (${j.group}, ${j.sentenceCount}문장)\n본문: ${j.verseBook}\n소감: "${j.reflection}"\n\n`;
    });
    msg += `오늘도 하나님의 말씀 안에서 은혜로운 하루 보내세요! 🙏`;

    navigator.clipboard.writeText(msg).then(() => {
      showToast('오늘의 전체 저널 요약이 클립보드에 복사되었습니다!');
    });
  };

  // 카톡 독려 메시지 복사
  const handleCopyEncouragementMessage = (student: AdminStudent, e: React.MouseEvent) => {
    e.stopPropagation();
    const streakDays = student.streak;
    const msg = streakDays > 0
      ? `[교회 말씀 통독 & 저널] 📖 ${student.name}님, 오늘 말씀 읽고 은혜로운 소감을 남겨보세요! ${streakDays}일 연속 통독 이어가길 응원합니다 ✨`
      : `[교회 말씀 통독 & 저널] 📖 ${student.name}님, 오늘 새로운 마음으로 말씀 읽고 소감을 나누어 보아요! 언제나 축복합니다 🙏`;

    navigator.clipboard.writeText(msg).then(() => {
      showToast(`${student.name} 학생 카톡 독려 메시지가 복사되었습니다!`);
    });
  };

  // 단톡방 전체 출석 & 저널 공지 텍스트 복사
  const handleCopyWholeClassNotice = () => {
    if (!students.length) return;
    const readCount = students.filter(s => s.lastReadDate === todayStr).length;
    const journalCount = students.filter(s => s.todayJournal || s.journals?.[todayStr]).length;
    const total = students.length;
    const readRate = Math.round((readCount / total) * 100);

    const completedNames = students
      .filter(s => s.lastReadDate === todayStr)
      .map(s => {
        const j = s.todayJournal || s.journals?.[todayStr];
        return j ? `${s.name}(${s.streak}일, 저널완료✍️)` : `${s.name}(${s.streak}일🔥)`;
      })
      .join(', ');

    const pendingNames = students
      .filter(s => s.lastReadDate !== todayStr)
      .map(s => s.name)
      .join(', ');

    const notice = `[📢 교회 말씀 통독 & 말씀묵상 저널링 현황 (${todayStr})]
- 오늘 말씀 완독: ${readCount}/${total}명 (${readRate}%)
- 오늘 소감 저널 작성: ${journalCount}명
- 참여 완료 성도: ${completedNames || '아직 없음'}
- 미참여 (독려): ${pendingNames || '전원 완독 달성!🎉'}

오늘도 성경 말씀을 마음에 품고 묵상하며 승리하는 하루 되세요! ✝️`;

    navigator.clipboard.writeText(notice).then(() => {
      showToast('단톡방 공지 텍스트가 클립보드에 복사되었습니다!');
    });
  };

  // CSV 파일 다운로드 (저널 포함)
  const handleDownloadCSV = () => {
    if (!students.length) return;
    const headers = ['아이디', '이름', '담당선생님', '연속일수', '최고연속', '레벨', '경험치', '총읽은일수', '오늘완독여부', '오늘저널작성여부', '저널문장수', '오늘소감내용', '교사메모'];
    const rows = students.map(s => {
      const todayJ = s.todayJournal || s.journals?.[todayStr];
      return [
        s.id,
        `"${s.name}"`,
        `"${s.group}"`,
        s.streak,
        s.bestStreak || s.streak,
        s.level,
        s.exp,
        s.totalDaysRead || 0,
        s.lastReadDate === todayStr ? '완료' : '미완료',
        todayJ ? '작성완료' : '미작성',
        todayJ?.sentenceCount || 0,
        `"${(todayJ?.reflection || '').replace(/"/g, '""')}"`,
        `"${(s.note || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `성경통독_저널_학생명단_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('저널 포함 학생 명단 CSV 파일이 다운로드되었습니다.');
  };

  // 학생 삭제 처리
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`'${studentName}' 학생의 기록을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`'${studentName}' 학생이 삭제되었습니다.`);
        setIsDetailModalOpen(false);
        fetchStudentsData();
        fetchJournalsData();
        onRefreshParent?.();
      }
    } catch (err) {
      console.error('Failed to delete student:', err);
      showToast('삭제에 실패했습니다.');
    }
  };

  // 학생 비밀번호 재설정 (아이들이 비번을 잊었을 때 교역자가 변경)
  const handleResetStudentPassword = async (studentId: string, studentName: string) => {
    if (!studentNewPwInput.trim()) {
      showToast('새 비밀번호를 입력해 주세요.');
      return;
    }
    setSavingStudentPw(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: studentNewPwInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${studentName} 학생의 비밀번호가 '${studentNewPwInput.trim()}'(으)로 재설정되었습니다.`);
        setSelectedStudent(prev => prev ? { ...prev, password: studentNewPwInput.trim(), hasCustomPassword: true } : null);
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, password: studentNewPwInput.trim(), hasCustomPassword: true } : s));
        setStudentNewPwInput('');
      } else {
        showToast(data.error || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to reset student password:', err);
      showToast('비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setSavingStudentPw(false);
    }
  };

  // 스트릭 직접 보정 (+1, -1, 직접 설정)
  const handleAdjustStreak = async (student: AdminStudent, newStreak: number) => {
    const validated = Math.max(0, newStreak);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          name: student.name,
          streak: validated,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${student.name} 연속 일수가 ${validated}일로 변경되었습니다.`);
        setSelectedStudent(prev => prev ? { ...prev, streak: validated, bestStreak: Math.max(prev.bestStreak || 0, validated) } : null);
        fetchStudentsData();
        onRefreshParent?.();
      }
    } catch (err) {
      console.error('Failed to adjust streak:', err);
      showToast('연속 일수 변경에 실패했습니다.');
    }
  };

  // 교사 메모 저장
  const handleSaveNote = async () => {
    if (!selectedStudent) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: editingNote }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('교사 메모가 저장되었습니다.');
        setSelectedStudent(prev => prev ? { ...prev, note: editingNote } : null);
        fetchStudentsData();
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      showToast('메모 저장에 실패했습니다.');
    } finally {
      setSavingNote(false);
    }
  };

  // 초기 샘플 데이터로 리셋
  const handleResetToDefaults = async () => {
    if (!window.confirm('전체 학생 및 저널 데이터를 초기 샘플 데이터로 복원하시겠습니까?')) return;
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('기본 데이터로 복원되었습니다.');
        fetchStudentsData();
        fetchJournalsData();
        onRefreshParent?.();
      }
    } catch {
      showToast('복원에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-4xl min-h-[660px] max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 sm:px-5 py-3.5 sm:py-4 flex justify-between items-center shrink-0 border-b border-white/10 gap-3 overflow-x-auto">
          <div className="flex items-center space-x-3 shrink-0 whitespace-nowrap">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <h2 className="text-base sm:text-lg font-black text-white whitespace-nowrap">관리자 모드</h2>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-md font-semibold border border-indigo-400/20 whitespace-nowrap">
                말씀 저널 & 통독 모니터링
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
            {currentUserSession && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-xl text-xs border border-white/10 whitespace-nowrap shrink-0">
                <span className="font-extrabold text-amber-300 whitespace-nowrap">
                  {currentUserSession.role === 'pastor'
                    ? (currentUserSession.name && currentUserSession.name !== '교역자'
                        ? `✝️ ${currentUserSession.name} 교역자`
                        : '✝️ 교역자')
                    : `🧑‍🏫 ${
                        currentUserSession.name.includes('선생님')
                          ? currentUserSession.name
                          : `${currentUserSession.name || currentUserSession.group} 선생님`
                      }`}
                </span>
              </div>
            )}
            {isAuthenticated && (
              <>
                {onSwitchAccount && (
                  <button
                    type="button"
                    onClick={onSwitchAccount}
                    className="text-xs text-amber-200 hover:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1.5 rounded-xl border border-amber-400/30 transition flex items-center gap-1 shrink-0 whitespace-nowrap"
                    title="다른 계정으로 로그인 / 전환"
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">계정 전환</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setChangePinError('');
                    setCurrentPinCheck('');
                    setNewPinInput('');
                    setConfirmNewPinInput('');
                    setIsChangePinModalOpen(true);
                  }}
                  className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition flex items-center gap-1 shrink-0 whitespace-nowrap"
                  title="관리자 비밀번호 변경"
                >
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">비밀번호 변경</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition flex items-center gap-1 shrink-0 whitespace-nowrap"
                  title="관리자 로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">로그아웃</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition shrink-0"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 토스트 알림 */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg border border-slate-700 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. 관리자 인증 화면 */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-850 dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-sm w-full text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">교사 / 관리자 비밀번호 입력</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  학생들의 말씀 소감 저널 열람 및 관리를 위해 관리자 비밀번호를 입력해 주세요.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>교사 및 사역자 보안 인증</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  본 화면은 교역자 및 담당 선생님 전용 공간입니다. 관리자 비밀번호(기본: <span className="font-bold text-indigo-600 dark:text-indigo-400">1004</span> 또는 <span className="font-bold text-indigo-600 dark:text-indigo-400">1015</span>)를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-3 pt-1">
                <div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={20}
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="비밀번호 입력 (기본: 1004 또는 1015)"
                      className={`w-full pl-4 pr-11 py-3 text-center text-sm sm:text-base font-bold tracking-widest bg-slate-50 dark:bg-slate-900 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition ${
                        pinError ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                      title={showPin ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pinError && (
                    <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center justify-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>비밀번호가 올바르지 않습니다. 다시 확인해 주세요.</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>관리자 모드 열기</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* 2. 관리자 메인 대시보드 화면 */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* 상단 통계 KPI 카드 영역 */}
            <div className="bg-white px-5 py-3.5 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 전체 학생 / 담당 학생 */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap truncate block">
                      {isTeacher ? `${teacherName} 선생님 담당 학생` : '전체 학생'}
                    </span>
                    <div className="text-xl font-black text-slate-900 mt-0.5 whitespace-nowrap">
                      {targetStudents.length}명
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 ml-2">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                {/* 오늘 성경 말씀 완독 */}
                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-emerald-700 whitespace-nowrap block">오늘 말씀 완독</span>
                    <div className="text-xl font-black text-emerald-800 mt-0.5 whitespace-nowrap">
                      {targetStudents.filter(s => s.lastReadDate === todayStr).length}명
                      <span className="text-[11px] font-bold text-emerald-600 ml-1.5 whitespace-nowrap">
                        ({targetStudents.length > 0 ? Math.round((targetStudents.filter(s => s.lastReadDate === todayStr).length / targetStudents.length) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 ml-2">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                {/* 오늘 5문장 저널 작성 (신규 핵심 KPI) */}
                <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-purple-700 whitespace-nowrap block">오늘 저널(소감) 작성</span>
                    <div className="text-xl font-black text-purple-800 mt-0.5 whitespace-nowrap">
                      {targetJournals.filter(j => j.date === todayStr).length}명
                      <span className="text-[11px] font-bold text-purple-600 ml-1.5 whitespace-nowrap">
                        ({targetStudents.length > 0 ? Math.round((targetJournals.filter(j => j.date === todayStr).length / targetStudents.length) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 ml-2">
                    <PenTool className="w-4 h-4" />
                  </div>
                </div>

                {/* 평균 연속 일수 */}
                <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-amber-700 whitespace-nowrap block">평균 연속 통독</span>
                    <div className="text-xl font-black text-amber-800 mt-0.5 whitespace-nowrap">
                      {targetStudents.length > 0 
                        ? +(targetStudents.reduce((sum, s) => sum + (Number(s.streak) || 0), 0) / targetStudents.length).toFixed(1)
                        : (summary?.averageStreak ?? 0)}일
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 ml-2">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 교사용 원클릭 도구 모음 */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyAllTodayJournals}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl font-bold transition active:scale-95 shadow-2xs whitespace-nowrap shrink-0"
                    title="오늘 작성된 전체 5문장 저널 모음 복사"
                  >
                    <Quote className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span className="whitespace-nowrap">오늘 소감 전체 요약 복사</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyWholeClassNotice}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold transition active:scale-95 shadow-2xs whitespace-nowrap shrink-0"
                    title="단톡방에 올릴 출석 및 저널 현황 복사"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="whitespace-nowrap">단톡방 출석 공지 복사</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCSV}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition active:scale-95 shadow-2xs whitespace-nowrap shrink-0"
                    title="저널 포함 학생 명단 엑셀(CSV) 다운로드"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="whitespace-nowrap">저널/명단 CSV 다운로드</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => {
                      fetchStudentsData();
                      fetchJournalsData();
                    }}
                    disabled={loading}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium transition whitespace-nowrap shrink-0"
                    title="새로고침"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
                    <span className="whitespace-nowrap">새로고침</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="text-[11px] text-slate-400 hover:text-rose-600 px-2 py-1 whitespace-nowrap shrink-0"
                    title="샘플 학생 데이터로 초기화"
                  >
                    데이터 리셋
                  </button>
                </div>
              </div>
            </div>

            {/* 상단 탭 전환: [말씀 저널(소감) 전체 열람] vs [학생 통독 & 출석 명단] */}
            <div className="flex border-b border-slate-200 bg-white px-5 pt-2 shrink-0 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAdminTab('journals')}
                className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  adminTab === 'journals'
                    ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <PenTool className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="whitespace-nowrap">말씀 저널(소감) 전체 열람</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-black whitespace-nowrap">
                  {journals.length}편
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('students')}
                className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  adminTab === 'students'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="whitespace-nowrap">학생 통독 & 출석 명단</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-black whitespace-nowrap">
                  {students.length}명
                </span>
              </button>
            </div>

            {/* TAB 1: 말씀 저널(소감) 전체 열람 뷰 */}
            {adminTab === 'journals' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* 저널 필터 및 검색 바 */}
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 shrink-0 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* 검색창 */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={journalSearchQuery}
                        onChange={(e) => setJournalSearchQuery(e.target.value)}
                        placeholder="성도 이름, 담당 선생님, 말씀 구절, 소감 내용 검색..."
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
                      />
                      {journalSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setJournalSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 날짜 선택 필터 */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={journalDateFilter}
                        onChange={(e) => setJournalDateFilter(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
                      >
                        <option value="all">모든 날짜 ({journals.length}개)</option>
                        {todayStr && (
                          <option value={todayStr}>오늘 ({todayStr})</option>
                        )}
                        {allJournalDates.filter(d => d !== todayStr).map(d => (
                          <option key={d} value={d}>
                            {d} ({journals.filter(j => j.date === d).length}개)
                          </option>
                        ))}
                      </select>

                      {/* 담당 선생님 선택 필터 */}
                      <select
                        value={journalGroupFilter}
                        onChange={(e) => setJournalGroupFilter(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
                      >
                        {isTeacher ? (
                          <>
                            <option value={teacherName}>🧑‍🏫 {teacherName} 선생님 담당 저널</option>
                            <option value="all">전체 저널 보기 ({journals.length}개)</option>
                          </>
                        ) : (
                          <>
                            <option value="all">전체 담당 선생님 저널 ({journals.length}개)</option>
                            {TEACHERS_LIST.map(tName => (
                              <option key={tName} value={tName}>
                                {tName} 선생님 담당 반 ({journals.filter(j => j.group === tName).length}개)
                              </option>
                            ))}
                          </>
                        )}
                      </select>

                      {/* 글씨 크기 조절 */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
                        <Type className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-[10px] font-bold text-slate-400 mr-0.5">글씨</span>
                        {(['sm', 'base', 'lg', 'xl'] as FontSizeOption[]).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleSetFontSize(sz)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                              fontSize === sz
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title={`글씨 크기 ${sz}`}
                          >
                            {sz === 'sm' ? '작게' : sz === 'base' ? '보통' : sz === 'lg' ? '크게' : '아주크게'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 저널 목록 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {filteredJournals.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-slate-400 text-sm">해당 조건에 작성된 말씀 저널이 없습니다.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setJournalDateFilter('all');
                          setJournalGroupFilter('all');
                          setJournalSearchQuery('');
                        }}
                        className="text-xs font-bold text-purple-600 underline"
                      >
                        필터 초기화
                      </button>
                    </div>
                  ) : (
                    filteredJournals.map((journal) => {
                      const key = `${journal.studentId}_${journal.date}`;
                      const isEditingFeedback = editingFeedbackId === key;
                      const currentInput = feedbackInputs[key] ?? journal.teacherFeedback ?? '';

                      return (
                        <div
                          key={journal.id || key}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition space-y-3"
                        >
                          {/* 상단 헤더: 학생 정보 & 날짜 & 문장 수 */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
                                {journal.avatarEmoji || '🌱'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-slate-900">
                                    {journal.studentName}
                                  </span>
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                                    {journal.group}
                                  </span>
                                  {journal.date === todayStr && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                      오늘 작성
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                  <span className="flex items-center gap-1 font-semibold text-indigo-700">
                                    <Calendar className="w-3 h-3" />
                                    {journal.date}
                                  </span>
                                  <span>•</span>
                                  <span className="font-bold text-slate-700">{journal.verseBook}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-purple-50 text-purple-800 border-purple-200">
                                ✍️ {journal.sentenceCount}문장 작성
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopySingleJournal(journal)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition"
                                title="이 소감 내용 복사"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 성경 본문 인용 */}
                          {journal.verseText && (
                            <div className={`${
                              fontSize === 'xl' ? 'text-sm sm:text-base leading-relaxed' :
                              fontSize === 'lg' ? 'text-xs sm:text-sm leading-relaxed' :
                              'text-xs leading-relaxed'
                            } text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition-all`}>
                              "{journal.verseText}"
                            </div>
                          )}

                          {/* 학생의 5문장 소감 본문 */}
                          <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100/80 relative">
                            <Quote className="w-5 h-5 text-purple-300 absolute top-2.5 left-2.5 opacity-40" />
                            <p className={`${
                              fontSize === 'xl' ? 'text-base sm:text-lg leading-loose font-semibold' :
                              fontSize === 'lg' ? 'text-sm sm:text-base leading-loose font-medium' :
                              fontSize === 'base' ? 'text-xs sm:text-sm leading-relaxed font-medium' :
                              'text-xs leading-relaxed'
                            } text-slate-800 whitespace-pre-wrap pl-4 transition-all`}>
                              {journal.reflection}
                            </p>
                          </div>

                          {/* 교사 & 교역자 격려 피드백 및 댓글 섹션 */}
                          <div className="pt-1 space-y-2">
                            {/* 등록된 댓글 목록 */}
                            {Array.isArray(journal.comments) && journal.comments.length > 0 ? (
                              <div className="space-y-1.5">
                                {journal.comments.map((c) => {
                                  const isPastor = c.authorRole === 'pastor';
                                  return (
                                    <div
                                      key={c.id}
                                      className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                                        isPastor
                                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                                          : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 font-bold">
                                          <span>{isPastor ? '✝️' : '🧑‍🏫'}</span>
                                          <span>{c.authorName}</span>
                                          <span className="text-[10px] opacity-75 font-normal">
                                            {isPastor ? '(교역자)' : `(${c.group || '담당 교사'})`}
                                          </span>
                                        </div>
                                        <span className="text-[10px] opacity-60">
                                          {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                      </div>
                                      <p className={`${
                                        fontSize === 'xl' ? 'text-base leading-relaxed' :
                                        fontSize === 'lg' ? 'text-sm leading-relaxed' :
                                        'text-xs leading-normal'
                                      } pl-5 whitespace-pre-wrap transition-all`}>
                                        "{c.content}"
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : journal.teacherFeedback ? (
                              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed space-y-1 text-amber-900">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                  <span>선생님의 격려 피드백</span>
                                </div>
                                <p className={`${
                                  fontSize === 'xl' ? 'text-base leading-relaxed' :
                                  fontSize === 'lg' ? 'text-sm leading-relaxed' :
                                  'text-xs leading-normal'
                                } text-amber-800 pl-5`}>
                                  "{journal.teacherFeedback}"
                                </p>
                              </div>
                            ) : null}

                            {/* 피드백 / 댓글 작성 입력 폼 */}
                            <div className="bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                <span className="flex items-center gap-1.5">
                                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                  <span>
                                    {currentUserSession?.role === 'pastor'
                                      ? `[교역자 모드] ${journal.studentName} 성도에게 축복 댓글 달기`
                                      : `${journal.studentName} 성도에게 격려 & 축복의 한마디 남기기`}
                                  </span>
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={currentInput}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFeedbackInputs(prev => ({ ...prev, [key]: val }));
                                  }}
                                  placeholder={
                                    currentUserSession?.role === 'pastor'
                                      ? "예: 교역자가 늘 기도하고 축복합니다. 주님 안에서 승리하길! ✝️"
                                      : "예: 은혜로운 묵상 고마워요! 오늘도 말씀 안에서 승리하길 축복해요 🙏"
                                  }
                                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveTeacherFeedback(journal.studentId, journal.date);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveTeacherFeedback(journal.studentId, journal.date)}
                                  disabled={savingFeedbackKey === key}
                                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 shrink-0"
                                >
                                  {savingFeedbackKey === key ? '등록 중...' : '댓글 등록'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 하단 요약 바 */}
                <div className="bg-white px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
                  <div>
                    표시된 저널: <span className="font-bold text-slate-800">{filteredJournals.length}</span>편 / 전체 <span className="font-bold text-slate-800">{journals.length}</span>편
                  </div>
                  <div className="text-[11px] text-slate-400">
                    관리자가 등록한 피드백은 학생의 '나의 저널' 탭에 실시간으로 전달됩니다.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 학생 통독 & 출석 명단 뷰 */}
            {adminTab === 'students' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* 필터 및 검색 바 */}
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 shrink-0 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* 검색창 */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="학생 이름 또는 담당 선생님 검색..."
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 담당 선생님 선택 드롭다운 */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      >
                        {isTeacher ? (
                          <>
                            <option value={teacherName}>
                              🧑‍🏫 {teacherName} 선생님 담당 학생 ({students.filter(s => s.group === teacherName).length}명)
                            </option>
                            <option value="all">전체 학생 보기 ({students.length}명)</option>
                          </>
                        ) : (
                          <>
                            <option value="all">전체 학생 (모든 담당 선생님) ({students.length}명)</option>
                            {TEACHERS_LIST.map(tName => (
                              <option key={tName} value={tName}>
                                {tName} 선생님 담당 학생 ({students.filter(s => s.group === tName).length}명)
                              </option>
                            ))}
                          </>
                        )}
                      </select>

                      {/* 정렬 드롭다운 */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      >
                        <option value="streak">연속 일수순</option>
                        <option value="level">신앙 레벨순</option>
                        <option value="name">학생 이름순</option>
                        <option value="lastActive">최근 활동순</option>
                      </select>
                    </div>
                  </div>

                  {/* 상태 퀵 필터 버튼 탭 */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 text-[11px] font-medium shrink-0 flex items-center gap-1 mr-1">
                      <Filter className="w-3 h-3" />
                      필터:
                    </span>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                        statusFilter === 'all'
                          ? 'bg-slate-800 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                      }`}
                    >
                      전체 ({students.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('read_done')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                        statusFilter === 'read_done'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>오늘 완독 ({students.filter(s => s.lastReadDate === todayStr).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('read_pending')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                        statusFilter === 'read_pending'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>오늘 미완독 ({students.filter(s => s.lastReadDate !== todayStr).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('journal_done')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                        statusFilter === 'journal_done'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                      }`}
                    >
                      <PenTool className="w-3 h-3" />
                      <span>저널 완료 ({students.filter(s => s.todayJournal || s.journals?.[todayStr]).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('journal_pending')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                        statusFilter === 'journal_pending'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                      }`}
                    >
                      <span>저널 미작성 ({students.filter(s => !s.todayJournal && !s.journals?.[todayStr]).length})</span>
                    </button>
                  </div>
                </div>

                {/* 학생 목록 테이블 / 카드 뷰 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredStudents.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-slate-400 text-sm">해당 조건에 일치하는 학생이 없습니다.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGroup('all');
                          setStatusFilter('all');
                          setSearchQuery('');
                        }}
                        className="text-xs font-bold text-indigo-600 underline"
                      >
                        필터 초기화
                      </button>
                    </div>
                  ) : (
                    filteredStudents.map((student) => {
                      const isReadToday = student.lastReadDate === todayStr;
                      const todayJ = student.todayJournal || student.journals?.[todayStr];
                      const titleInfo = getStreakTitle(student.streak);

                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            setSelectedStudent(student);
                            setEditingNote(student.note || '');
                            setIsDetailModalOpen(true);
                          }}
                          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                        >
                          {/* 학생 정보 */}
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                              {student.avatarEmoji || '🌱'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 truncate">
                                  {student.name}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold shrink-0">
                                  {student.group ? `${student.group} 선생님 반` : '담당 미지정'}
                                </span>
                                {student.id === currentUserId && (
                                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-bold">
                                    내 계정
                                  </span>
                                )}
                                {/* 교역자/선생님 학생 비밀번호 확인 배지 */}
                                <span 
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0 shadow-2xs"
                                  title="학생 로그인 비밀번호 (학생이 분실 시 교역자 확인용)"
                                >
                                  <KeyRound className="w-3 h-3 text-amber-600" />
                                  <span>비번: {student.password || '1004'}</span>
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  Lv.{student.level}
                                </span>
                                <span>{student.titleName || titleInfo.item.name}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-400 text-[11px]">
                                  총 {student.totalDaysRead || 0}일 통독
                                </span>
                                {student.note && (
                                  <span className="text-[11px] text-slate-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded max-w-[140px] truncate">
                                    💬 {student.note}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 상태 배지 & 액션 */}
                          <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                            {/* 연속 일수 */}
                            <div className="flex items-center space-x-1 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
                              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                              <span className="text-xs font-black text-orange-700">
                                {student.streak}일 연속
                              </span>
                            </div>

                            {/* 오늘 말씀 통독 여부 배지 */}
                            {isReadToday ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                완독
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 bg-slate-100 text-slate-500 rounded-xl border border-slate-200">
                                <Clock className="w-3 h-3 text-slate-400" />
                                미완독
                              </span>
                            )}

                            {/* 오늘 저널 작성 여부 배지 */}
                            {todayJ ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-xl border border-purple-200">
                                <PenTool className="w-3 h-3 text-purple-700" />
                                저널 ({todayJ.sentenceCount}문장)
                              </span>
                            ) : (
                              <span className="hidden sm:inline-flex items-center text-[11px] text-slate-400 px-2 py-1 bg-slate-50 rounded-xl">
                                저널 미작성
                              </span>
                            )}

                            {/* 카톡 독려 메시지 복사 버튼 */}
                            <button
                              type="button"
                              onClick={(e) => handleCopyEncouragementMessage(student, e)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition active:scale-95"
                              title="카톡 격려 메시지 복사"
                            >
                              <Send className="w-3.5 h-3.5 text-amber-600" />
                            </button>

                            <div className="text-slate-400 group-hover:text-indigo-600 pl-1">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 하단 요약 바 */}
                <div className="bg-white px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
                  <div>
                    현재 표시: <span className="font-bold text-slate-800">{filteredStudents.length}</span>명 / 총 <span className="font-bold text-slate-800">{students.length}</span>명
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">학생 카드를 누르면 상세 히스토리 및 교사 메모를 볼 수 있습니다.</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* 3. 학생 상세 정보 및 교사 관리 모달 */}
      {isDetailModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-5 flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/30 shadow-inner">
                  {selectedStudent.avatarEmoji || '🌱'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
                    <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                      {selectedStudent.group ? `${selectedStudent.group} 선생님 반` : '담당 미지정'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Lv.{selectedStudent.level} 성도 ({selectedStudent.titleName})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 콘텐츠 */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* 통계 요약 카드 3종 */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">현재 연속</div>
                  <div className="text-lg font-black text-orange-600 mt-0.5">
                    {selectedStudent.streak}일🔥
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">최고 연속 기록</div>
                  <div className="text-lg font-black text-amber-600 mt-0.5">
                    {selectedStudent.bestStreak || selectedStudent.streak}일🏆
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">총 통독한 날</div>
                  <div className="text-lg font-black text-indigo-600 mt-0.5">
                    {selectedStudent.totalDaysRead || 0}일📖
                  </div>
                </div>
              </div>

              {/* 학생 비밀번호 관리 카드 (교역자 확인 및 분실 시 재설정) */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>학생 로그인 비밀번호 (교역자 안내용)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedStudent.password || '1004');
                      showToast(`${selectedStudent.name} 학생의 비밀번호(${selectedStudent.password || '1004'})가 복사되었습니다!`);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <span>비번 복사</span>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">현재 저장된 비밀번호</span>
                    <span className="text-base font-black text-amber-700 tracking-widest">
                      {selectedStudent.password || '1004'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-amber-50 px-2 py-1 rounded-md font-semibold">
                    {selectedStudent.hasCustomPassword ? '학생 개별 설정 번호' : '초기 번호 (첫 로그인 시 변경)'}
                  </span>
                </div>

                <p className="text-[11px] text-amber-800 leading-snug">
                  📢 학생이 비밀번호를 잊어버렸을 경우 이 번호(<strong>{selectedStudent.password || '1004'}</strong>)를 알려주시거나, 아래에서 즉시 새로운 비밀번호로 재설정해 주실 수 있습니다.
                </p>

                {/* 교역자/선생님 직접 비밀번호 재설정 폼 */}
                <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2">
                  <input
                    type="text"
                    value={studentNewPwInput}
                    onChange={(e) => setStudentNewPwInput(e.target.value)}
                    placeholder="새 비밀번호 입력 (재설정용)"
                    className="flex-1 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleResetStudentPassword(selectedStudent.id, selectedStudent.name)}
                    disabled={savingStudentPw}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition whitespace-nowrap disabled:opacity-50"
                  >
                    {savingStudentPw ? '변경 중...' : '비번 재설정'}
                  </button>
                </div>
              </div>

              {/* 오늘 참여 여부 확인 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">오늘 ({todayStr}) 참여 현황</span>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      selectedStudent.lastReadDate === todayStr ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}>
                      말씀 통독: {selectedStudent.lastReadDate === todayStr ? '완료 ✅' : '미완료 ⏳'}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      (selectedStudent.todayJournal || selectedStudent.journals?.[todayStr]) ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-500'
                    }`}>
                      5문장 저널: {(selectedStudent.todayJournal || selectedStudent.journals?.[todayStr]) ? '작성 완료 ✍️' : '미작성 ⏳'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopyEncouragementMessage(selectedStudent, e)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl shadow-2xs transition text-xs flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>격려문자 복사</span>
                </button>
              </div>

              {/* 학생이 작성한 말씀 소감 (저널) 히스토리 목록 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5 text-purple-600" />
                    <span>작성한 말씀 소감 저널 목록</span>
                  </span>
                  <span className="text-purple-600 font-bold">
                    {Object.keys(selectedStudent.journals || {}).length}편
                  </span>
                </div>

                {Object.keys(selectedStudent.journals || {}).length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">아직 작성된 저널이 없습니다.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(Object.values(selectedStudent.journals || {}) as JournalEntry[])
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((j: JournalEntry) => (
                        <div key={j.id || j.date} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-indigo-700">{j.date} ({j.verseBook})</span>
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                              {j.sentenceCount}문장
                            </span>
                          </div>
                          <p className="text-slate-700 text-xs leading-relaxed italic pl-1">
                            "{j.reflection}"
                          </p>
                          {j.teacherFeedback && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1">
                              💌 선생님 피드백: {j.teacherFeedback}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* 교사 전용 연속 일수(Streak) 직접 보정 도구 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>연속 일수(Streak) 교사 직접 보정</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">개인 사정 출석 인정 등</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustStreak(selectedStudent, selectedStudent.streak - 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold"
                  >
                    -1일
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStreak(selectedStudent, selectedStudent.streak + 1)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold"
                  >
                    +1일 인정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const input = window.prompt(`${selectedStudent.name} 학생의 연속 일수를 입력하세요:`, String(selectedStudent.streak));
                      if (input !== null && !isNaN(Number(input))) {
                        handleAdjustStreak(selectedStudent, Number(input));
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    직접 설정
                  </button>
                </div>
              </div>

              {/* 칭호 도감 획득 상태 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>영적 칭호 획득 현황</span>
                  </span>
                  <span className="text-indigo-600 font-bold">
                    {STREAK_TITLES.filter(t => selectedStudent.streak >= t.days).length} / 9개 획득
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {STREAK_TITLES.map((title) => {
                    const isUnlocked = selectedStudent.streak >= title.days;
                    return (
                      <span
                        key={title.id}
                        className={`text-[11px] px-2 py-1 rounded-lg flex items-center gap-1 font-medium ${
                          isUnlocked 
                            ? 'bg-amber-50 border border-amber-200 text-amber-900 font-bold' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60'
                        }`}
                        title={`${title.name} (${title.days}일 연속 달성 칭호)`}
                      >
                        <span>{title.icon}</span>
                        <span>{title.name}</span>
                        <span className="text-[9px] text-slate-400">({title.days}일)</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 교사 메모 및 기도제목 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>교사 전용 심방 메모 & 기도 제목</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">관리자만 열람 가능</span>
                </label>
                <textarea
                  rows={3}
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  placeholder="학생의 성경 통독 상담 내용, 기도 제목, 독려 내역을 메모하세요..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    {savingNote ? '저장 중...' : '메모 저장'}
                  </button>
                </div>
              </div>

              {/* 위험 작업: 학생 계정 삭제 */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">계정 삭제 시 통독 및 저널 기록이 모두 삭제됩니다.</span>
                <button
                  type="button"
                  onClick={() => handleDeleteStudent(selectedStudent.id, selectedStudent.name)}
                  className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>학생 삭제</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 관리자 비밀번호 변경 모달 */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-850 dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-tight">관리자 비밀번호 변경</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">교사 전용 새 비밀번호를 설정합니다</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePinModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">현재 비밀번호</label>
                <input
                  type="password"
                  value={currentPinCheck}
                  onChange={(e) => {
                    setCurrentPinCheck(e.target.value);
                    setChangePinError('');
                  }}
                  placeholder="현재 비밀번호"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">새 비밀번호 (4자리 이상)</label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={newPinInput}
                    onChange={(e) => {
                      setNewPinInput(e.target.value);
                      setChangePinError('');
                    }}
                    placeholder="새 비밀번호 입력"
                    className="w-full px-3 pr-9 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    title={showNewPin ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmNewPinInput}
                  onChange={(e) => {
                    setConfirmNewPinInput(e.target.value);
                    setChangePinError('');
                  }}
                  placeholder="새 비밀번호 다시 입력"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              {changePinError && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{changePinError}</span>
                </p>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95"
                >
                  비밀번호 저장하기
                </button>
                <button
                  type="button"
                  onClick={handleResetPinToDefault}
                  className="w-full py-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[11px] font-medium transition text-center block"
                >
                  기본 비밀번호로 초기화
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
