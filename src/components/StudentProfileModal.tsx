import React, { useState } from 'react';
import { StudentProfile, TEACHERS_LIST } from '../types';
import { 
  User, 
  Sparkles, 
  X, 
  Check, 
  Award, 
  Calendar, 
  Flame, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ShieldCheck,
  School 
} from 'lucide-react';
import { getStreakTitle } from '../data/titles';

interface Props {
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<StudentProfile>) => void;
}

export default function StudentProfileModal({ profile, isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState(profile.name || '');
  const [selectedTeacher, setSelectedTeacher] = useState<string>(() => {
    if (profile.group && (TEACHERS_LIST as readonly string[]).includes(profile.group)) {
      return profile.group;
    }
    return TEACHERS_LIST[0];
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 비밀번호 변경 상태
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccessMsg, setPwSuccessMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  if (!isOpen) return null;

  const titleInfo = getStreakTitle(profile.streak);
  const titleAvatar = titleInfo.item.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      group: selectedTeacher,
      avatarEmoji: titleAvatar,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccessMsg('');

    if (!newPw.trim()) {
      setPwError('새 비밀번호를 입력해 주세요.');
      return;
    }

    if (newPw.trim().length < 2) {
      setPwError('비밀번호는 최소 2자 이상 입력해 주세요.');
      return;
    }

    if (newPw.trim() !== confirmNewPw.trim()) {
      setPwError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/student/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile.id,
          currentPassword: currentPw.trim(),
          newPassword: newPw.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPwError(data.error || '비밀번호 변경에 실패했습니다.');
        return;
      }

      setPwSuccessMsg('비밀번호가 성공적으로 변경되었습니다!');
      onSave({ password: newPw.trim() });
      setCurrentPw('');
      setNewPw('');
      setConfirmNewPw('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPwSuccessMsg('');
      }, 1500);
    } catch {
      setPwError('서버와 통신할 수 없습니다.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/30 shadow-inner">
              {titleAvatar}
            </div>
            <div>
              <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                Lv. {profile.level} 성도
              </span>
              <h3 className="text-lg font-bold mt-1 text-white">
                {name || '학생 이름 입력'}
              </h3>
              <p className="text-xs text-indigo-100">{titleInfo.item.name} • {selectedTeacher} 선생님 반</p>
            </div>
          </div>
        </div>

        {/* 내 영적 통계 요약 */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700/60 text-center shrink-0">
          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>현재 연속</span>
            </div>
            <div className="text-sm font-extrabold text-orange-600 dark:text-orange-400 mt-0.5">{profile.streak}일</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <Award className="w-3 h-3 text-amber-500" />
              <span>최고 기록</span>
            </div>
            <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{profile.bestStreak || profile.streak}일</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-3 h-3 text-indigo-500" />
              <span>총 읽은 날</span>
            </div>
            <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{profile.totalDaysRead || 0}일</div>
          </div>
        </div>

        {/* 바디 스크롤 영역 */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* 칭호 자동 연동 아바타 안내 카드 (수동 선택 불가) */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700/80 shadow-2xs flex items-center justify-center text-2xl shrink-0">
              {titleAvatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-md">
                  칭호 연동 아바타
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {titleInfo.item.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                아바타는 매일 말씀 통독 연속일수(<strong>{profile.streak}일 달성</strong>) 칭호에 맞춰 자동 부여됩니다.
              </p>
            </div>
          </div>

          {/* 기본 프로필 이름 & 담당 선생님 폼 */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>이름 (실명 또는 닉네임)</span>
              </label>
              <input
                id="student-name-input"
                type="text"
                required
                maxLength={15}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김민준, 박하은"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-850"
              />
            </div>

            <div>
              <label htmlFor="student-teacher-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>담당 선생님</span>
              </label>
              <select
                id="student-teacher-select"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {TEACHERS_LIST.map((tName) => (
                  <option key={tName} value={tName}>{tName} 선생님</option>
                ))}
              </select>
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              disabled={!name.trim()}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : name.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.99]'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>프로필 정보 저장 완료!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>프로필 정보 저장하기</span>
                </>
              )}
            </button>
          </form>

          {/* 학생 전용 비밀번호 설정 및 변경 섹션 */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setPwError('');
                setPwSuccessMsg('');
              }}
              className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-750 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>내 비밀번호 설정 및 변경</span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                {isChangingPassword ? '닫기 ▲' : '설정하기 ▼'}
              </span>
            </button>

            {isChangingPassword && (
              <form onSubmit={handlePasswordChangeSubmit} className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  나만의 비밀번호를 설정하여 안전하게 저널링을 기록하세요.
                </div>

                {/* 현재 비밀번호 (마스킹) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    현재 비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="기존 비밀번호 입력"
                      className="w-full pl-3 pr-9 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold tracking-widest text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showCurrentPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 새 비밀번호 (마스킹) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    새 비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="새 비밀번호 입력"
                      className="w-full pl-3 pr-9 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold tracking-widest text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showNewPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 새 비밀번호 확인 (마스킹) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPw}
                    onChange={(e) => setConfirmNewPw(e.target.value)}
                    placeholder="새 비밀번호 다시 입력"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold tracking-widest text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {pwError && (
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-[11px] text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pwError}</span>
                  </div>
                )}

                {pwSuccessMsg && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-bold">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{pwSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwLoading || !newPw.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <KeyRound className="w-3 h-3 text-amber-300" />
                  <span>{pwLoading ? '변경 중...' : '비밀번호 변경 완료'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
