import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface ContributionSuccessProps {
  onDone: () => void;
  summary: { station: string; fuel: string; price: number } | null;
  isPioneer?: boolean;
  earnedPoints?: number;
}

export const ContributionSuccess: React.FC<ContributionSuccessProps> = ({ onDone, summary, isPioneer, earnedPoints: earnedPointsProp }) => {
  const { t } = useLanguage();
  const [isSpinning, setIsSpinning] = useState(!isPioneer);
  const [displayPoints, setDisplayPoints] = useState(0);

  const targetPoints = useMemo(() => {
    if (earnedPointsProp !== undefined && earnedPointsProp > 0) return earnedPointsProp;
    return isPioneer ? 200 : 50; // Fixed: 200 for pioneer, 50 for standard report
  }, [isPioneer, earnedPointsProp]);

  useEffect(() => {
    if (!isSpinning) {
      setDisplayPoints(targetPoints);
      return;
    }

    let startTime: number | null = null;
    const duration = 2000; // 2 seconds animation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth slowdown (easeOutQuart)
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);

      setDisplayPoints(Math.floor(easeOutQuart * targetPoints));

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setDisplayPoints(targetPoints);
      }
    };

    const rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [isSpinning, targetPoints]);

  return (
    <div className="fixed inset-0 z-[2000] bg-background-dark font-sans antialiased flex flex-col items-center justify-center overflow-y-auto no-scrollbar animate-fadeIn">
      {/* Dynamic Background FX */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[150%] h-[150%] blur-[100px] pointer-events-none transition-all duration-1000 ${isSpinning ? 'bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] animate-pulse' : 'bg-[radial-gradient(circle,rgba(251,191,36,0.15)_0%,transparent_70%)]'
          }`}></div>
      </div>

      <div className="w-full max-w-md min-h-full flex flex-col px-6 py-12 relative z-10">

        {/* Top Section: Celebration */}
        <div className="flex flex-col items-center mb-8 mt-10">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg">
              {isPioneer ? t('contributionSuccess.stationAdded') : t('contributionSuccess.priceVerified')}
            </h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              {isPioneer ? t('contributionSuccess.pioneerMsg') : t('contributionSuccess.thanksMsg')}
            </p>
          </div>

          {/* THE SMOOTH COUNT-UP REWARD DISPLAY */}
          <div className={`relative flex flex-col items-center justify-center w-full aspect-square max-w-[280px] rounded-[3rem] border-4 transition-all duration-500 shadow-2xl ${isSpinning
            ? 'border-primary/50 bg-surface-darker shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-pulse'
            : 'border-accent-gold/80 bg-gradient-to-br from-surface-dark to-surface-darker shadow-[0_0_80px_rgba(251,191,36,0.4)] scale-105'
            }`}>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 text-center w-full block">
              {isSpinning ? t('contributionSuccess.calculating') : (isPioneer ? t('contributionSuccess.pioneerBonus') : t('contributionSuccess.mysteryReward'))}
            </span>
            <div className="flex items-baseline justify-center gap-2 tabular-nums w-full">
              <span className={`text-[80px] font-black leading-none tracking-tighter text-center w-full transition-colors ${isSpinning ? 'text-white blur-[1px]' : 'text-accent-gold drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                }`}>
                +{displayPoints}
              </span>
            </div>
            <span className={`text-xl font-black mt-2 text-center w-full transition-colors ${isSpinning ? 'text-primary/50' : 'text-accent-gold/80'}`}>
              PTS
            </span>

            {/* Confetti element that shows up when spinning stops */}
            {!isSpinning && (
              <div className="absolute -top-6 -right-6 text-4xl animate-bounce-in">🎉</div>
            )}
          </div>
        </div>

        {/* Contribution Summary Card */}
        <div className="bg-surface-dark/60 backdrop-blur-md rounded-[2rem] px-6 py-5 flex items-center gap-5 border border-white/5 mb-auto">
          <div className={`size-12 rounded-full flex-shrink-0 flex items-center justify-center border ${isPioneer ? 'bg-accent-gold/10 border-accent-gold/20 text-accent-gold' : 'bg-primary/10 border-primary/20 text-primary'}`}>
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPioneer ? 'flag' : 'check_circle'}
            </span>
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1 opacity-70">
              {t('contributionSuccess.contributionLogged')}
            </span>
            <span className="text-sm font-black text-white truncate">
              {summary ? `${summary.station} • ${summary.price.toFixed(2)} DH` : t('contributionSuccess.contributionVerified')}
            </span>
          </div>
        </div>

        {/* Bottom Section: Actions */}
        <div className="mt-8 space-y-4 w-full">
          {!isSpinning && (
            <button
              onClick={() => {
                const text = `I just earned ${displayPoints} XP on FuelSpy Morocco for ${isPioneer ? 'adding' : 'verifying'} ${summary?.fuel || 'fuel'} at ${summary?.station || 'a station'}! Join me and find the cheapest fuel: https://fuelspy.ma`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="w-full h-16 bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-xl rounded-[2rem] shadow-[0_15px_30px_rgba(37,211,102,0.3)] flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="h-6 w-6" />
              {t('contributionSuccess.shareWhatsApp')}
            </button>
          )}

          <button
            disabled={isSpinning}
            onClick={onDone}
            className={`w-full h-16 font-black text-lg rounded-[2rem] transition-all uppercase tracking-[0.15em] border ${isSpinning
              ? 'bg-surface-dark text-slate-500 opacity-50 cursor-not-allowed border-transparent'
              : 'bg-transparent text-white border-white/20 hover:bg-white/5 active:scale-95'
              }`}
          >
            {isSpinning ? t('contributionSuccess.wait') : t('contributionSuccess.returnToMap')}
          </button>
        </div>
      </div>
    </div>
  );
};