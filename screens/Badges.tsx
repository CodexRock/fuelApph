import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

import { User as AppUser } from '../types';

export const Badges: React.FC<{ onBack: () => void; currentUser?: AppUser | null }> = ({ onBack, currentUser }) => {
  const { t } = useLanguage();
  const reports = currentUser?.reportsCount || 0;

  const badges = [
    { id: 1, title: t('badges.list.b1'), icon: 'document_scanner', unlocked: reports >= 1 },
    { id: 2, title: t('badges.list.b2'), icon: 'visibility', unlocked: reports >= 5 },
    { id: 3, title: t('badges.list.b3'), icon: 'wb_twilight', unlocked: reports >= 10 },
    { id: 4, title: t('badges.list.b4'), icon: 'add_road', unlocked: reports >= 25 },
    { id: 5, title: t('badges.list.b5'), icon: 'landscape', unlocked: reports >= 50 },
    { id: 6, title: t('badges.list.b6'), icon: 'nights_stay', unlocked: reports >= 100 },
    { id: 7, title: t('badges.list.b7'), icon: 'verified_user', unlocked: reports >= 250 },
    { id: 8, title: t('badges.list.b8'), icon: 'trending_up', unlocked: reports >= 500 },
    { id: 9, title: t('badges.list.b9'), icon: 'groups', unlocked: reports >= 1000 },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalBadges = badges.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100) || 0;

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fadeIn">
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
              <h2 className="text-4xl font-black text-white leading-none">{unlockedCount}/{totalBadges}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-primary uppercase">{currentUser?.level && currentUser.level >= 5 ? t('badges.eliteTier') : 'Tracker'}</p>
            </div>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {badges.map(b => (
            <div key={b.id} className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${b.unlocked ? 'bg-surface-dark border-primary/20' : 'bg-surface-dark/40 border-white/5 opacity-50'}`}>
              <div className={`size-14 rounded-full flex items-center justify-center relative ${b.unlocked ? 'bg-primary/10 text-primary' : 'bg-white/5 text-slate-600'}`}>
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: b.unlocked ? "'FILL' 1" : "" }}>{b.icon}</span>
                {!b.unlocked && <span className="material-symbols-outlined absolute -top-1 -right-1 text-[14px] bg-background-dark p-0.5 rounded-full">lock</span>}
              </div>
              <p className="text-[9px] font-black uppercase text-center text-slate-400 tracking-tighter leading-tight">{b.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};