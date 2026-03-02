import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const SecuritySettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const [faEnabled, setFaEnabled] = useState(true);
  const [faceId, setFaceId] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fadeIn">
      <header className="flex items-center justify-between p-4 pt-12 z-20">
        <button onClick={onBack} className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-black">{t('securitySettings.title')}</h1>
        <div className="size-11" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('securitySettings.auth')}</h2>
          <div className="bg-surface-dark rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">password</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('securitySettings.changePass')}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{t('securitySettings.lastChanged')}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-600">chevron_right</span>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400">
                  <span className="material-symbols-outlined">phonelink_lock</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('securitySettings.twoFactor')}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{t('securitySettings.highlyRec')}</p>
                </div>
              </div>
              <button
                onClick={() => setFaEnabled(!faEnabled)}
                className={`w-12 h-6 rounded-full relative transition-all ${faEnabled ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${faEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('securitySettings.biometrics') || 'Biometrics'}</h2>
          <div className="bg-surface-dark rounded-[2rem] border border-white/5 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-400">
                <span className="material-symbols-outlined">fingerprint</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t('securitySettings.faceId') || 'Face ID / Touch ID'}</p>
                <p className="text-[10px] text-slate-500 font-medium">{t('securitySettings.fastLogin') || 'For faster login'}</p>
              </div>
            </div>
            <button
              onClick={() => setFaceId(!faceId)}
              className={`w-12 h-6 rounded-full relative transition-all ${faceId ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${faceId ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('profile.locationPrivacy') || 'Location & Privacy'}</h2>
          <div className="bg-surface-dark rounded-[2rem] border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-green-400">
                  <span className="material-symbols-outlined">my_location</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('profile.locationAccess') || 'Location Access'}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{t('profile.locationDesc') || 'Required to find nearby stations'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if ('geolocation' in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    () => alert(t('profile.locationGranted') || 'Location permission granted!'),
                    () => alert(t('profile.locationDenied') || 'Location permission denied. Please enable it in your browser settings.')
                  );
                }
              }}
              className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl transition-all"
            >
              {t('profile.regrantLocation') || 'Update Location Permission'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};