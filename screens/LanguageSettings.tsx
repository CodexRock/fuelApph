import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const LanguageSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fadeIn">
      <header className="flex items-center justify-between p-4 pt-12 z-20">
        <button onClick={onBack} className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-black">{t('languageSettings.title')}</h1>
        <div className="size-11" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        <section>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('languageSettings.select')}</h2>
          <div className="space-y-3">
            <button
              onClick={() => setLanguage('en')}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${language === 'en' ? 'bg-primary/10 border-primary text-white' : 'bg-surface-dark border-white/5 text-slate-400'
                }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">🇬🇧</span>
                <span className="font-bold text-sm">English</span>
              </div>
              {language === 'en' && <span className="material-symbols-outlined text-primary">check_circle</span>}
            </button>

            <button
              onClick={() => setLanguage('fr')}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${language === 'fr' ? 'bg-primary/10 border-primary text-white' : 'bg-surface-dark border-white/5 text-slate-400'
                }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">🇫🇷</span>
                <span className="font-bold text-sm">Français</span>
              </div>
              {language === 'fr' && <span className="material-symbols-outlined text-primary">check_circle</span>}
            </button>

            <button
              onClick={() => setLanguage('ar')}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${language === 'ar' ? 'bg-primary/10 border-primary text-white' : 'bg-surface-dark border-white/5 text-slate-400'
                }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">🇲🇦</span>
                <span className="font-bold text-sm">العربية</span>
              </div>
              {language === 'ar' && <span className="material-symbols-outlined text-primary">check_circle</span>}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};