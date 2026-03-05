import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { User as AppUser } from '../types';

export const Badges: React.FC<{ onBack: () => void; currentUser?: AppUser | null }> = ({ onBack, currentUser }) => {
  const { t } = useLanguage();
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  const reports = currentUser?.reportsCount || 0;
  const verified = currentUser?.verifiedCount || 0;
  const savings = currentUser?.savings || 0;
  const level = currentUser?.level || 1;
  const points = currentUser?.totalPoints || 0;

  const badges = [
    {
      id: 'b1',
      title: t('badges.list.b1_title'),
      desc: t('badges.list.b1_desc'),
      crit: t('badges.list.b1_crit'),
      icon: 'document_scanner',
      unlocked: reports >= 1
    },
    {
      id: 'b2',
      title: t('badges.list.b2_title'),
      desc: t('badges.list.b2_desc'),
      crit: t('badges.list.b2_crit'),
      icon: 'visibility',
      unlocked: reports >= 10
    },
    {
      id: 'b3',
      title: t('badges.list.b3_title'),
      desc: t('badges.list.b3_desc'),
      crit: t('badges.list.b3_crit'),
      icon: 'verified_user',
      unlocked: verified >= 5
    },
    {
      id: 'b4',
      title: t('badges.list.b4_title'),
      desc: t('badges.list.b4_desc'),
      crit: t('badges.list.b4_crit'),
      icon: 'savings',
      unlocked: savings >= 100
    },
    {
      id: 'b5',
      title: t('badges.list.b5_title'),
      desc: t('badges.list.b5_desc'),
      crit: t('badges.list.b5_crit'),
      icon: 'landscape',
      unlocked: reports >= 50
    },
    {
      id: 'b6',
      title: t('badges.list.b6_title'),
      desc: t('badges.list.b6_desc'),
      crit: t('badges.list.b6_crit'),
      icon: 'nights_stay',
      unlocked: reports >= 20
    },
    {
      id: 'b7',
      title: t('badges.list.b7_title'),
      desc: t('badges.list.b7_desc'),
      crit: t('badges.list.b7_crit'),
      icon: 'groups',
      unlocked: level >= 15
    },
    {
      id: 'b8',
      title: t('badges.list.b8_title'),
      desc: t('badges.list.b8_desc'),
      crit: t('badges.list.b8_crit'),
      icon: 'military_tech',
      unlocked: points >= 5000
    },
    {
      id: 'b9',
      title: t('badges.list.placeholder_title'),
      desc: t('badges.list.placeholder_desc'),
      crit: t('badges.list.placeholder_crit'),
      icon: 'more_horiz',
      unlocked: false
    },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalBadgesCount = 8; // We have 8 real badges
  const progressPercent = Math.round((unlockedCount / totalBadgesCount) * 100) || 0;

  const selectedBadge = badges.find(b => b.id === selectedBadgeId);

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fadeIn relative">
      <header className="flex items-center justify-between p-4 pt-12 z-20">
        <button onClick={onBack} className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-black">{t('badges.title')}</h1>
        <div className="size-11" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-3xl" />
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{t('badges.totalBadges')}</p>
              <h2 className="text-4xl font-black text-white leading-none">{unlockedCount}/{totalBadgesCount}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-primary uppercase">{currentUser?.level && currentUser.level >= 10 ? t('badges.eliteTier') : 'Scout'}</p>
            </div>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {badges.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBadgeId(b.id)}
              className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all active:scale-95 ${b.unlocked ? 'bg-surface-dark border-primary/20 shadow-lg shadow-primary/5' : 'bg-surface-dark/40 border-white/5 opacity-40'}`}
            >
              <div className={`size-14 rounded-full flex items-center justify-center relative ${b.unlocked ? 'bg-primary/10 text-primary' : 'bg-white/5 text-slate-600'}`}>
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: b.unlocked ? "'FILL' 1" : "" }}>{b.icon}</span>
                {!b.unlocked && <span className="material-symbols-outlined absolute -top-1 -right-1 text-[14px] bg-background-dark p-0.5 rounded-full">lock</span>}
              </div>
              <p className="text-[9px] font-black uppercase text-center text-slate-400 tracking-tighter leading-tight">{b.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Badge Details Modal */}
      {selectedBadgeId && selectedBadge && (
        <div className="absolute inset-0 z-50 flex items-end p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedBadgeId(null)}>
          <div
            className="w-full bg-surface-dark rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`size-24 rounded-full flex items-center justify-center ${selectedBadge.unlocked ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-600'}`}>
                <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: selectedBadge.unlocked ? "'FILL' 1" : "" }}>{selectedBadge.icon}</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white mb-2">{selectedBadge.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{selectedBadge.desc}</p>
              </div>

              <div className="w-full p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">How to achieve</p>
                <p className={`text-sm font-bold ${selectedBadge.unlocked ? 'text-primary' : 'text-slate-300'}`}>
                  {selectedBadge.crit}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedBadge.unlocked ? (
                  <div className="px-4 py-2 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-full border border-primary/30">
                    Unlocked
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-white/5 text-slate-500 text-[10px] font-black uppercase rounded-full border border-white/5">
                    Locked
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedBadgeId(null)}
                className="w-full h-14 bg-white/5 text-white font-bold rounded-2xl border border-white/10 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
