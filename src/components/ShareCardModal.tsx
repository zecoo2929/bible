import React, { useState, useRef } from 'react';
import { StudentProfile, DailyVerse } from '../types';
import { getStreakTitle } from '../data/titles';
import { formatKoreanDate } from '../data/verses';
import { X, Share2, Copy, Download, Check, Sparkles, Award, Flame, BookOpen } from 'lucide-react';

interface Props {
  profile: StudentProfile;
  verse: DailyVerse;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareCardModal({ profile, verse, isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const titleInfo = getStreakTitle(profile.streak);
  const todayFormatted = formatKoreanDate(new Date());
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-retasge4b66o5kr2ymz45v-391018310508.asia-northeast1.run.app';

  // 카카오톡 및 텍스트 공유용 포맷
  const shareText = `📖 [바이블 레벨업 말씀 완주 인증]
✨ 성도: ${profile.name || '성도'}
🔥 연속 읽기: ${profile.streak}일차 달성!
🎖️ 칭호: ${titleInfo.item.icon} ${titleInfo.item.name}
⭐ 신앙 레벨: Lv.${profile.level} (EXP ${profile.exp})

📜 오늘의 말씀:
"${verse.text}"
- ${verse.book}${verse.textEsv ? `\n\n[ESV English]\n"${verse.textEsv}"\n- ${verse.bookEsv || verse.book}` : ''}

👉 성경 읽고 함께 레벨업하기:
${appUrl}`;

  // 카카오톡 / 네이티브 공유 핸들러
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `바이블 레벨업 - ${profile.name} 학생의 말씀 완주 인증`,
          text: shareText,
          url: appUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }
    handleCopyText();
  };

  // 텍스트 클립보드 복사
  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('클립보드 복사에 실패했습니다. 텍스트를 직접 복사해 주세요.');
    }
  };

  // Canvas를 통한 인증 카드 이미지 다운로드 기능
  const handleDownloadCard = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 캔버스 크기 (고해상도 카드)
      const width = 640;
      const height = 820;
      canvas.width = width;
      canvas.height = height;

      // 1. 배경 그라데이션
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#1e1b4b'); // deep indigo
      bgGrad.addColorStop(0.5, '#312e81');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. 골드 테두리 장식
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // 3. 상단 헤더 타이틀
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('✝️ 바이블 레벨업', width / 2, 75);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('말씀 완주 & 칭호 인증서', width / 2, 115);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(todayFormatted, width / 2, 145);

      // 4. 학생 정보 카드 영역
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(50, 175, width - 100, 140, 16);
      ctx.fill();

      // 학생 이름 & 레벨
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`${profile.name || '성도'} 성도`, width / 2, 225);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`신앙 레벨 Lv.${profile.level}  •  ${titleInfo.item.name}`, width / 2, 260);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`🔥 ${profile.streak}일 연속 성경 완주 중!`, width / 2, 290);

      // 5. 칭호 배지 영역
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.roundRect(80, 340, width - 160, 60, 30);
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`🎖️ 칭호: ${titleInfo.item.name} (${titleInfo.item.days}일 달성)`, width / 2, 378);

      // 6. 오늘의 말씀 영역
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(50, 430, width - 100, 270, 16);
      ctx.fill();

      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`[ 오늘의 말씀 • ${verse.book} ]`, width / 2, 470);

      // 말씀 텍스트 자동 줄바꿈
      ctx.fillStyle = '#1e293b';
      ctx.font = 'normal 18px sans-serif';
      const text = `"${verse.text}"`;
      const maxWidth = width - 150;
      const words = text.split(' ');
      let line = '';
      let y = 520;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, width / 2, y);
          line = words[n] + ' ';
          y += 34;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, y);

      // 묵상 한 줄
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText(`"주의 말씀은 내 발에 등이요 내 길에 빛이니이다"`, width / 2, 660);

      // 7. 하단 워터마크
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText('바이블 레벨업과 함께 매일 영적으로 성장합니다', width / 2, 765);

      // 다운로드 트리거
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `바이블레벨업_인증서_${profile.name || '성도'}_${profile.streak}일차.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
      alert('카드 다운로드에 실패했습니다. 공유하기 버튼을 이용해 주세요.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 my-auto animate-in zoom-in-95">
        
        {/* 모달 상단 닫기 바 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/60">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>말씀 완주 & 칭호 인증 카드</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 카드 실물 미리보기 영역 */}
        <div className="p-4 bg-slate-100/70 dark:bg-slate-900/50">
          <div 
            ref={cardRef}
            className="rounded-2xl bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 shadow-lg border-2 border-amber-400/80 relative overflow-hidden text-center"
          >
            {/* 상단 인증서 배지 */}
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>말씀 완주 인증서</span>
            </div>

            <h3 className="text-lg font-black tracking-tight text-white">
              {profile.name || '성도'} 성도
            </h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Lv.{profile.level} • {titleInfo.item.name}
            </p>

            {/* 연속 읽기 하이라이트 배너 */}
            <div className="my-3 bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/15 flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400 animate-pulse" />
              <div className="text-left">
                <div className="text-xs font-bold text-orange-300">
                  {profile.streak}일 연속 성경 읽기 달성!
                </div>
                <div className="text-[11px] text-white/90">
                  현재 칭호: <span className="font-bold text-amber-300">{titleInfo.item.name}</span>
                </div>
              </div>
            </div>

            {/* 오늘의 말씀 박스 */}
            <div className="bg-white/95 text-slate-800 p-3 rounded-xl shadow-xs text-left my-2 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 mb-1">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>오늘의 말씀</span>
                </span>
                <span>{verse.book}</span>
              </div>
              <p className="text-[11px] font-normal text-slate-700 leading-relaxed">
                "{verse.text}"
              </p>
              {verse.textEsv && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-sans mb-0.5 flex items-center gap-1 font-semibold">
                    <span className="bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded text-[9px]">ESV</span>
                    <span>{verse.bookEsv || verse.book}</span>
                  </div>
                  <p className="text-[11px] font-normal text-slate-600 leading-snug">
                    "{verse.textEsv}"
                  </p>
                </div>
              )}
            </div>

            {/* 날짜 */}
            <div className="text-[10px] text-indigo-300/80 mt-2">
              {todayFormatted}
            </div>
          </div>
        </div>

        {/* 공유 & 다운로드 버튼 섹션 */}
        <div className="p-4 space-y-2 bg-white dark:bg-slate-850 dark:bg-slate-800">
          
          {/* 카카오톡 / SNS 공유 버튼 */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md shadow-amber-200/50 dark:shadow-none transition active:scale-[0.99]"
          >
            <Share2 className="w-4 h-4" />
            <span>카카오톡 / SNS에 인증서 공유</span>
          </button>

          {/* 인증 문구 복사 & 카드 이미지 다운로드 2열 버튼 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>복사되었습니다!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>인증 문구 복사</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={downloading}
              className="py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? '생성 중...' : '인증서 이미지 저장'}</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
            카카오톡 단체방에 공유해 친구들과 서로 응원해 보세요!
          </p>
        </div>

      </div>
    </div>
  );
}
