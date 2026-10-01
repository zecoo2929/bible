import React, { useState, useEffect } from 'react';
import { RankingUser, StudentProfile } from '../types';
import { Trophy, Flame, Star, Award, RotateCcw, User, Sparkles, ShieldCheck } from 'lucide-react';
import { getStreakTitle } from '../data/titles';

interface Props {
  currentProfile: StudentProfile;
  onOpenProfileEdit: () => void;
}

export default function RankingBoard({ currentProfile, onOpenProfileEdit }: Props) {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [sortBy, setSortBy] = useState<'streak' | 'level'>('streak');
  const [loading, setLoading] = useState(false);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rankings?sortBy=${sortBy}`);
      const data = await res.json();
      if (data.rankings) {
        const userTitle = getStreakTitle(currentProfile.streak);
        // 현재 유저의 실시간 상태도 리스트에 확실히 반영
        const list: RankingUser[] = data.rankings.map((u: RankingUser) => {
          if (u.id === currentProfile.id) {
            return {
              ...u,
              name: currentProfile.name,
              streak: currentProfile.streak,
              level: currentProfile.level,
              exp: currentProfile.exp,
              titleName: userTitle.item.name,
              titleIcon: userTitle.item.icon,
              isCurrentUser: true,
            };
          }
          return u;
        });

        const exists = list.some((u) => u.id === currentProfile.id);
        if (!exists && currentProfile.name) {
          list.push({
            id: currentProfile.id,
            name: currentProfile.name,
            group: currentProfile.group || '성도',
            streak: currentProfile.streak,
            level: currentProfile.level,
            exp: currentProfile.exp,
            titleName: userTitle.item.name,
            titleIcon: userTitle.item.icon,
            lastActive: new Date().toISOString(),
            isCurrentUser: true,
          });
        }
        
        // 정렬
        list.sort((a, b) => {
          if (sortBy === 'level') {
            if (b.level !== a.level) return b.level - a.level;
            return b.exp - a.exp;
          }
          if (b.streak !== a.streak) return b.streak - a.streak;
          return b.level - a.level;
        });

        setRankings(list);
      }
    } catch (err) {
      console.error('Failed to fetch rankings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [sortBy, currentProfile.streak, currentProfile.level, currentProfile.name]);

  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  // 내 순위 찾기
  const myRankIndex = rankings.findIndex(u => u.id === currentProfile.id);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;

  return (
    <div className="space-y-4">
      {/* 말씀 동행 헤더 카드 */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-700 text-white p-5 rounded-2xl shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>우리 공동체 말씀 동행</span>
            </div>
            <h2 className="text-xl font-black mt-2 text-white flex items-center gap-2">
              <span>함께 걷는 말씀의 길</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h2>
            <p className="text-xs text-amber-100/90 mt-0.5">
              경쟁이 아닌 서로를 축복하고 격려하며 함께 자라나는 은혜의 자리
            </p>
          </div>
          <button
            type="button"
            onClick={fetchRankings}
            disabled={loading}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition active:scale-95"
            title="새로고침"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 내 순위 요약 바 */}
        <div className="mt-4 bg-black/20 backdrop-blur-xs rounded-xl p-3 flex items-center justify-between border border-white/10 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-full bg-white text-indigo-700 font-extrabold flex items-center justify-center text-xs shadow-xs">
              {currentProfile.avatarEmoji || '🌱'}
            </span>
            <div>
              <span className="font-bold text-white">{currentProfile.name || '나'}</span>
              <span className="text-[11px] text-amber-200 ml-1.5">({currentProfile.group ? `${currentProfile.group} 선생님 반` : '담당 선생님'})</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-amber-300">
                {myRank ? `동행 ${myRank}번째` : '동행 확인 중'}
              </div>
              <div className="text-[10px] text-slate-200">
                {sortBy === 'streak' ? `${currentProfile.streak}일 연속 동행` : `Lv.${currentProfile.level}`}
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenProfileEdit}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              <span>수정</span>
            </button>
          </div>
        </div>
      </div>

      {/* 정렬 필터 탭 */}
      <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setSortBy('streak')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            sortBy === 'streak'
              ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span>연속 읽기 순 (스트릭)</span>
        </button>
        <button
          type="button"
          onClick={() => setSortBy('level')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            sortBy === 'level'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
          <span>신앙 레벨 순 (성장도)</span>
        </button>
      </div>

      {/* TOP 3 포디움 시각화 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-2">
          {/* 2위 (좌측) */}
          {top3[1] ? (
            <div className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 text-center shadow-xs flex flex-col items-center justify-end">
              <div className="text-xl mb-1">🥈</div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate w-full">{top3[1].name}</div>
              <div className="text-[10px] text-slate-400 truncate w-full">{top3[1].group}</div>
              <div className="mt-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[11px] font-extrabold w-full">
                {sortBy === 'streak' ? `${top3[1].streak}일 연속` : `Lv.${top3[1].level}`}
              </div>
            </div>
          ) : <div />}

          {/* 1위 (중앙, 강조) */}
          {top3[0] && (
            <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-800/90 p-3 rounded-2xl border-2 border-amber-300 dark:border-amber-500/80 text-center shadow-md flex flex-col items-center justify-end scale-105 relative z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                말씀의 본보기
              </div>
              <div className="text-2xl mb-1">🥇</div>
              <div className="font-black text-sm text-slate-900 dark:text-slate-100 truncate w-full">{top3[0].name}</div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate w-full">{top3[0].group}</div>
              <div className="mt-2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2.5 py-1 rounded-full text-xs font-black w-full shadow-2xs">
                {sortBy === 'streak' ? `🔥 ${top3[0].streak}일 연속` : `⭐ Lv.${top3[0].level}`}
              </div>
            </div>
          )}

          {/* 3위 (우측) */}
          {top3[2] ? (
            <div className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 text-center shadow-xs flex flex-col items-center justify-end">
              <div className="text-xl mb-1">🥉</div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate w-full">{top3[2].name}</div>
              <div className="text-[10px] text-slate-400 truncate w-full">{top3[2].group}</div>
              <div className="mt-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[11px] font-extrabold w-full">
                {sortBy === 'streak' ? `${top3[2].streak}일 연속` : `Lv.${top3[2].level}`}
              </div>
            </div>
          ) : <div />}
        </div>
      )}

      {/* 전체 랭킹 리스트 */}
      <div className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-4 space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/60 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>함께 걷는 지체</span>
          <span>{sortBy === 'streak' ? '연속 읽기 기록' : '신앙 레벨'}</span>
        </div>

        {rankings.map((user, idx) => {
          const isMe = user.id === currentProfile.id;
          const rankNum = idx + 1;

          return (
            <div
              key={user.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isMe
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 shadow-xs ring-1 ring-indigo-200 dark:ring-indigo-800/80'
                  : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* 등수 숫자 */}
                <div className={`w-6 text-center font-black text-sm ${
                  rankNum === 1 ? 'text-amber-500' :
                  rankNum === 2 ? 'text-slate-400' :
                  rankNum === 3 ? 'text-amber-700 dark:text-amber-500' : 'text-slate-400'
                }`}>
                  {rankNum}
                </div>

                {/* 프로필 정보 */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {user.name}
                    </span>
                    {isMe && (
                      <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                        나
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                      {user.group ? `${user.group} 선생님 반` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-medium">
                      <span>{user.titleIcon || '🌱'}</span>
                      <span>{user.titleName}</span>
                    </span>
                    <span>•</span>
                    <span>Lv.{user.level}</span>
                  </div>
                </div>
              </div>

              {/* 점수 / 일수 */}
              <div className="text-right">
                {sortBy === 'streak' ? (
                  <div className="flex items-center space-x-1 justify-end font-black text-orange-600 dark:text-orange-400 text-sm">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                    <span>{user.streak}일</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 justify-end font-black text-indigo-600 dark:text-indigo-400 text-sm">
                    <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                    <span>Lv.{user.level}</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  {sortBy === 'streak' ? `누적 Lv.${user.level}` : `EXP ${user.exp}`}
                </div>
              </div>
            </div>
          );
        })}

        {rankings.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs">
            아직 등록된 학생이 없습니다. 오늘 말씀을 묵상하고 첫 걸음을 내딛어 보세요!
          </div>
        )}
      </div>

      {/* 공동체 격려 안내 */}
      <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">함께하는 축복과 격려:</span> 매일 말씀을 묵상하고 저널을 작성하면 '말씀 동행'에 함께 기록됩니다. 서로를 위해 응원하며 100일 칭호인 <strong>[생명의 면류관]</strong>을 향해 기쁨으로 동행해요!
        </div>
      </div>
    </div>
  );
}
