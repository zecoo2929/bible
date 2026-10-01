import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Share2, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Quote, 
  ChevronRight, 
  Flame,
  PenTool,
  Award
} from 'lucide-react';
import { StudentProfile, JournalEntry, FontSizeOption } from '../types';

interface Props {
  profile: StudentProfile;
  onOpenShareModal: () => void;
  onGoToToday: () => void;
  fontSize?: FontSizeOption;
}

export default function MyJournalsView({ profile, onOpenShareModal, onGoToToday, fontSize = 'base' }: Props) {
  const journalsRecord = profile.journals || {};
  const journalEntries: JournalEntry[] = Object.values(journalsRecord).sort(
    (a, b) => new Date(b.submittedAt || b.date).getTime() - new Date(a.submittedAt || a.date).getTime()
  );

  const totalJournals = journalEntries.length;
  const totalSentences = journalEntries.reduce((sum, j) => sum + (j.sentenceCount || 0), 0);
  const feedbackCount = journalEntries.filter(j => j.teacherFeedback && j.teacherFeedback.trim()).length;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyJournal = (entry: JournalEntry) => {
    const text = `[📖 나의 말씀 소감 저널 - ${entry.date}]\n본문: ${entry.verseBook}\n"${entry.verseText}"\n\n✍️ 나의 묵상 소감 (${entry.sentenceCount}문장):\n${entry.reflection}\n\n- ${entry.studentName || '성도'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 상단 통계 요약 배너 */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-4 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg">
              ✍️
            </div>
            <div>
              <h2 className="text-base font-black">나의 말씀 소감 저널</h2>
              <p className="text-[11px] text-indigo-100">성경을 읽고 기록한 믿음의 발자취입니다</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white text-indigo-900 px-2.5 py-1 rounded-full shadow-xs">
            {profile.name} 님
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
          <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl">
            <span className="text-[10px] text-indigo-100">작성한 저널</span>
            <div className="text-base font-black mt-0.5">{totalJournals}편</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl">
            <span className="text-[10px] text-indigo-100">기록한 문장 수</span>
            <div className="text-base font-black mt-0.5">{totalSentences}문장</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl">
            <span className="text-[10px] text-indigo-100">받은 교사 피드백</span>
            <div className="text-base font-black mt-0.5 text-amber-300">{feedbackCount}개</div>
          </div>
        </div>
      </div>

      {/* 저널 목록 */}
      {journalEntries.length === 0 ? (
        <div className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 p-8 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            📖
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">아직 작성한 말씀 소감이 없습니다</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              오늘의 말씀을 읽고 은혜로운 소감을 기록해 보세요.<br />
              기록된 저널은 선생님과 관리자가 함께 읽고 축복해 드립니다!
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToToday}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-none transition active:scale-95 inline-flex items-center gap-1.5"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>오늘의 말씀 소감 작성하러 가기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              작성된 저널 목록 ({totalJournals}개)
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">최신순 정렬</span>
          </div>

          {journalEntries.map((entry) => (
            <div 
              key={entry.id || entry.date}
              className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3 hover:border-indigo-200 dark:hover:border-indigo-700/60 transition"
            >
              {/* 카드 상단 날짜 및 본문 */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3 h-3" />
                    {entry.date}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {entry.verseBook}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                  {entry.sentenceCount}문장 작성
                </span>
              </div>

              {/* 말씀 구절 인용 */}
              {entry.verseText && (
                <div className={`${
                  fontSize === 'xl' ? 'text-xs sm:text-sm leading-relaxed' :
                  fontSize === 'lg' ? 'text-[11px] sm:text-xs leading-relaxed' :
                  'text-[11px] leading-relaxed'
                } font-normal text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed transition-all`}>
                  "{entry.verseText}"
                </div>
              )}

              {/* 학생 소감 저널 본문 */}
              <div className="bg-indigo-50/30 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100/70 dark:border-indigo-900/50 relative">
                <Quote className="w-4 h-4 text-indigo-300 dark:text-indigo-600 absolute top-2.5 left-2.5 opacity-40" />
                <p className={`${
                  fontSize === 'xl' ? 'text-base sm:text-lg leading-loose font-semibold' :
                  fontSize === 'lg' ? 'text-sm sm:text-base leading-loose font-medium' :
                  fontSize === 'base' ? 'text-xs sm:text-sm leading-relaxed font-medium' :
                  'text-xs leading-relaxed'
                } text-slate-800 dark:text-slate-200 whitespace-pre-wrap pl-4 transition-all`}>
                  {entry.reflection}
                </p>
              </div>

              {/* 교사 & 교역자 피드백/댓글 표시 영역 */}
              {Array.isArray(entry.comments) && entry.comments.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {entry.comments.map((c) => {
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
                              {isPastor ? '(교역자)' : `(${c.group || '선생님'})`}
                            </span>
                          </div>
                          <span className="text-[10px] opacity-60">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs pl-5 leading-normal whitespace-pre-wrap">
                          "{c.content}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : entry.teacherFeedback ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>선생님의 응원 & 축복 피드백</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed pl-5 text-[11px]">
                    "{entry.teacherFeedback}"
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1 px-1">
                  <span>💌 선생님과 교역자가 소감을 확인하고 곧 따뜻한 응원 댓글을 남깁니다.</span>
                </div>
              )}

              {/* 카드 액션 버튼들 */}
              <div className="flex justify-end items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                <button
                  type="button"
                  onClick={() => handleCopyJournal(entry)}
                  className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-750 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-[11px] font-semibold transition"
                >
                  {copiedId === entry.id ? '✓ 복사완료' : '소감 복사'}
                </button>
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="px-2.5 py-1 text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border border-amber-200 dark:border-amber-800/60"
                >
                  <Share2 className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>인증카드</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
