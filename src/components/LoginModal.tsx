import React, { useState } from 'react';
import { 
  User, 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  School
} from 'lucide-react';
import { UserRole, UserSession, StudentProfile, TEACHERS_LIST } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession, profile?: StudentProfile) => void;
  currentSession: UserSession | null;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, currentSession }: Props) {
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('손충의');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (role === 'student' && !name.trim()) {
      setErrorMsg('학생 이름을 입력해 주세요.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const studentOrTeacherName = role === 'student' 
        ? name.trim() 
        : role === 'teacher' 
          ? selectedTeacher 
          : (name.trim() || '교역자');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name: studentOrTeacherName,
          password: password.trim(),
          group: selectedTeacher,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || '로그인에 실패했습니다. 비밀번호를 확인해 주세요.');
        return;
      }

      onLoginSuccess(data.session, data.profile);
      onClose();
    } catch {
      setErrorMsg('서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-850 dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              {role === 'student' ? '🎒' : role === 'teacher' ? '🧑‍🏫' : '✝️'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-white/20 text-[10px] text-amber-200 px-2 py-0.5 rounded-full font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Holy Seed 말씀 커뮤니티</span>
              </div>
              <h2 className="text-lg font-black mt-1 text-white">
                {role === 'student' ? '학생 로그인' : role === 'teacher' ? '선생님 로그인' : '교역자 로그인'}
              </h2>
            </div>
          </div>

          {/* 역할 전환 탭 3종 */}
          <div className="grid grid-cols-3 gap-1.5 mt-4 bg-black/25 backdrop-blur-xs p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setPassword('');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                role === 'student'
                  ? 'bg-white text-indigo-900 shadow-md font-extrabold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>학생</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setPassword('');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                role === 'teacher'
                  ? 'bg-white text-indigo-900 shadow-md font-extrabold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>선생님</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('pastor');
                setName('교역자');
                setPassword('');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                role === 'pastor'
                  ? 'bg-white text-indigo-900 shadow-md font-extrabold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>교역자</span>
            </button>
          </div>
        </div>

        {/* 바디 영역 */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. 학생 로그인 필드들 */}
            {role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    학생 이름 (아이디)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 김다윗, 박하은"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    담당 선생님
                  </label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {TEACHERS_LIST.map((tName) => (
                      <option key={tName} value={tName}>{tName} 선생님</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* 2. 선생님 로그인 필드들 */}
            {role === 'teacher' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  선생님 성함 선택
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {TEACHERS_LIST.map((tName) => (
                    <option key={tName} value={tName}>{tName} 선생님</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  선생님으로 로그인 시 {selectedTeacher} 선생님의 담당 학생들만 표시됩니다.
                </p>
              </div>
            )}

            {/* 3. 교역자 로그인 필드들 */}
            {role === 'pastor' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  교역자 성함
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 교역자"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  교역자는 모든 담당 선생님의 전체 학생 저널 및 통독 현황을 열람하실 수 있습니다.
                </p>
              </div>
            )}

            {/* 비밀번호 필드 (마스킹 처리 & 가려짐) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {role === 'student' ? '내 비밀번호 (숫자)' : '비밀번호'}
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {role === 'student' ? '처음 입력한 숫자가 비밀번호가 됩니다' : '관리자 보안 인증'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={role === 'student' ? '숫자 비밀번호 입력 (예: 1234)' : '비밀번호 입력 (기본: 1004 또는 1015)'}
                  autoComplete="current-password"
                  inputMode={role === 'student' ? 'numeric' : 'text'}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold tracking-widest text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {role === 'student' ? (
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium leading-tight">
                  💡 처음 입력한 숫자가 내 비밀번호로 자동 저장됩니다. (비밀번호를 잊으면 교역자님께 물어보세요!)
                </p>
              ) : (
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium leading-tight">
                  💡 선생님 및 관리자 기본 비밀번호는 <strong>1004</strong> 또는 <strong>1015</strong> 입니다.
                </p>
              )}
            </div>

            {/* 에러 메시지 */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {loading
                  ? '로그인 확인 중...'
                  : role === 'student'
                    ? `${name ? `[${name}] 학생으로 저널 시작하기` : '학생 로그인하기'}`
                    : role === 'teacher'
                      ? `${selectedTeacher} 선생님으로 로그인하기`
                      : '교역자로 로그인하기'}
              </span>
            </button>
          </form>
        </div>

        {/* 하단 푸터 */}
        <div className="bg-slate-50 dark:bg-slate-900 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500 shrink-0">
          <span>Holy Seed 중고등부 말씀 사역</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
}
