import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const { t, language, setLanguage } = useLanguage();

  const next = () => setStep(s => s + 1);

  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [vehicleModel, setVehicleModel] = useState('');
  const [fuelType, setFuelType] = useState('Diesel');

  const requestLocation = () => {
    setIsRequestingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsRequestingLocation(false);
          next();
        },
        () => {
          setIsRequestingLocation(false);
          next();
        },
        { timeout: 10000 }
      );
    } else {
      setIsRequestingLocation(false);
      next();
    }
  };

  const requestNotifications = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    onComplete();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background-dark overflow-hidden relative font-sans selection:bg-primary selection:text-background-dark">

      {/* STEP 1: WELCOME & VALUE PROP */}
      {step === 1 && (
        <div className="absolute inset-0 flex flex-col animate-fadeIn">
          {/* Language Toggle */}
          <div className="absolute top-12 right-6 z-20 bg-black/40 backdrop-blur-md rounded-full p-1 flex items-center border border-white/10">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-primary text-background-dark' : 'text-slate-300'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'fr' ? 'bg-primary text-background-dark' : 'text-slate-300'}`}
            >
              FR
            </button>
          </div>

          <div className="absolute inset-0 z-0 h-full w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDmYQmEGn2yY0olRz7FKixPtBSO5WuxM9XKQQykx5aC7O7x4mplU7b9NGk38c2h4EnXYxoBumA6FT_uYBNRSy-SRiB0ctb_snl8x8LqRFPqrbeL_olaV5J8wp7B2O48Mz5rZr-Sxj27fbmWCY428pyHrIYM1oci1VLkfhXI2SzLuRhCjMkt1Uoj3pWLnD6lOn6gzCh3GG90chhyXTfbrMXzEYOJLKlhEzSjtVf0B2O3M1iNCCP_srjiHIFFWg7sdaVhBkmwpDojecSg")' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-background-dark"></div>
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between p-8">
            <div className="flex items-center gap-2 rounded-full bg-black/20 w-fit px-3 py-1.5 backdrop-blur-md border border-white/10 mt-8">
              <span className="material-symbols-outlined text-primary text-xl">local_gas_station</span>
              <span className="text-white text-sm font-semibold tracking-wide uppercase">FuelSpy Morocco</span>
            </div>
            <div className="flex flex-col gap-6 pb-12">
              <div className="flex flex-col gap-3">
                <h1 className="text-white text-5xl font-bold leading-none tracking-tighter">
                  {t('onboarding.title')} <span className="text-primary">{t('onboarding.titleHighlight')}</span>
                </h1>
                <p className="text-slate-200 text-lg font-medium leading-relaxed">{t('onboarding.subtitle')}</p>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={next} className="w-full h-16 bg-primary hover:bg-primary-dark text-background-dark font-bold text-xl rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
                  {t('onboarding.getStarted')} <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION PERMISSION */}
      {step === 2 && (
        <div className="flex-1 flex flex-col animate-fadeIn relative bg-background-dark overflow-hidden p-8 pt-20">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative size-40 mb-10">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse-slow"></div>
              <div className="size-full bg-surface-dark border border-white/5 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-4">{t('onboarding.locationTitle')}</h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs mx-auto">
              {t('onboarding.locationSubtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-auto mb-8">
            <button
              onClick={requestLocation}
              disabled={isRequestingLocation}
              className="w-full h-16 bg-primary text-background-dark font-black text-lg rounded-[2rem] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
            >
              {isRequestingLocation ? (
                <div className="size-6 border-4 border-background-dark border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined">my_location</span>
                  {t('onboarding.allowLocation') || 'Allow Location'}
                </>
              )}
            </button>
            <button onClick={next} disabled={isRequestingLocation} className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors disabled:opacity-50">
              {t('onboarding.skip') || 'Skip for now'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VEHICLE PROFILE */}
      {step === 3 && (
        <div className="flex-1 flex flex-col animate-fadeIn relative bg-background-dark overflow-hidden p-8 pt-20">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <div className="relative size-32 mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full"></div>
              <div className="size-full bg-surface-dark border border-white/5 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
              </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">{t('onboarding.vehicleTitle') || 'Your Vehicle'}</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
              {t('onboarding.vehicleSubtitle') || 'Help us personalize your fuel recommendations.'}
            </p>
          </div>

          <div className="flex flex-col gap-5 mt-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4 mb-2 block">
                {t('profile.vehicleModel') || 'Vehicle Model'}
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={e => setVehicleModel(e.target.value)}
                placeholder="e.g. Dacia Logan"
                className="w-full h-14 bg-surface-dark border border-white/10 rounded-2xl px-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4 mb-2 block">
                {t('profile.fuelType') || 'Fuel Type'}
              </label>
              <div className="flex gap-2">
                {['Diesel', 'Sans Plomb', 'Premium'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFuelType(type)}
                    className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all border ${fuelType === type
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface-dark border-white/5 text-slate-400 hover:bg-white/5'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-auto mb-8">
            <button onClick={next} className="w-full h-16 bg-primary text-background-dark font-black text-lg rounded-[2rem] shadow-2xl transition-all active:scale-[0.98]">
              {t('auth.continue') || 'Continue'}
            </button>
            <button onClick={next} className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors">
              {t('onboarding.skip') || 'Skip for now'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PUSH NOTIFICATIONS */}
      {step === 4 && (
        <div className="flex-1 flex flex-col animate-fadeIn relative bg-background-dark overflow-hidden p-8 pt-20">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative size-40 mb-10">
              <div className="absolute inset-0 bg-accent-gold/20 blur-[60px] rounded-full animate-pulse-slow"></div>
              <div className="size-full bg-surface-dark border border-white/5 rounded-full flex items-center justify-center shadow-2xl relative z-10 text-accent-gold">
                <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
              </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{t('onboarding.notifTitle') || 'Never Miss a Deal'}</h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs mx-auto">
              {t('onboarding.notifSubtitle') || 'Get alerted when fuel prices drop in your city and when people verify your reports.'}
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-auto mb-8">
            <button onClick={requestNotifications} className="w-full h-16 bg-accent-gold text-background-dark font-black text-lg rounded-[2rem] shadow-[0_15px_30px_rgba(251,191,36,0.3)] transition-all active:scale-[0.98]">
              {t('onboarding.allowNotif') || 'Enable Notifications'}
            </button>
            <button onClick={onComplete} className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-xs">
              {t('onboarding.skip') || 'Maybe Later'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};