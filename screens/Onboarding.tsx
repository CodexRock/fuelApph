import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AvatarPicker } from '../components/AvatarPicker';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const { t, language, setLanguage } = useLanguage();

  const next = () => setStep(s => s + 1);

  const { user } = useAuth();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [vehicleModel, setVehicleModel] = useState('');
  const [odometer, setOdometer] = useState('');
  const [category, setCategory] = useState<'car' | 'taxi' | 'truck' | 'moto'>('car');
  const [fuelType, setFuelType] = useState('Diesel');
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

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

  const saveVehicleData = async () => {
    if (!user) {
      next();
      return;
    }

    setIsSaving(true);
    try {
      await supabase.from('users').update({
        vehicle: JSON.stringify({
          model: vehicleModel,
          odometer: parseInt(odometer) || 0,
          category,
          fuel: fuelType
        }),
        avatar_url: selectedAvatar
      }).eq('id', user.id);
      next();
    } catch (error) {
      console.error('Error saving vehicle data:', error);
      next();
    } finally {
      setIsSaving(false);
    }
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
            <h2 className="text-3xl font-black text-white mb-2">{t('onboarding.vehicleTitle') || 'Your Profile'}</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
              {t('onboarding.vehicleSubtitle') || 'Customize your identity and vehicle.'}
            </p>
          </div>

          <div className="flex flex-col gap-5 mt-4 overflow-y-auto no-scrollbar pb-4 text-left">
            {/* Avatar Selection */}
            <div className="flex flex-col items-center mb-4">
              <button
                onClick={() => setIsAvatarPickerOpen(true)}
                className="size-24 rounded-[2rem] bg-surface-dark border-4 border-white/5 relative group overflow-hidden transition-all hover:border-primary/50 active:scale-95"
              >
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt="Selected Avatar" className="size-full object-cover" />
                ) : (
                  <div className="size-full flex flex-col items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-3xl">add_reaction</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{t('onboarding.pickAvatar')}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              {selectedAvatar && (
                <button
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="mt-2 text-[10px] font-black text-primary uppercase tracking-widest"
                >
                  {t('profile.changeAvatar')}
                </button>
              )}
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4 mb-2 block text-left">
                {t('vehicleSettings.category') || 'Vehicle Category'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'car', icon: 'directions_car' },
                  { id: 'taxi', icon: 'local_taxi' },
                  { id: 'truck', icon: 'local_shipping' },
                  { id: 'moto', icon: 'moped' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${category === cat.id ? 'bg-primary border-primary text-background-dark' : 'bg-surface-dark border-white/5 text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4 mb-2 block text-left">
                {t('profile.vehicleModel') || 'Vehicle Model'}
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={e => setVehicleModel(e.target.value)}
                placeholder={t('onboarding.vehicleModelPlaceholder')}
                className="w-full h-14 bg-surface-dark border border-white/10 rounded-2xl px-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors font-bold"
                list="moroccan-cars-onboarding"
              />
              <datalist id="moroccan-cars-onboarding">
                <option value="Dacia Logan" />
                <option value="Dacia Sandero" />
                <option value="Dacia Duster" />
                <option value="Renault Clio" />
                <option value="Renault Megane" />
                <option value="Peugeot 208" />
                <option value="Peugeot 308" />
                <option value="Volkswagen Golf" />
                <option value="Volkswagen Tiguan" />
                <option value="Hyundai Tucson" />
                <option value="Hyundai i10" />
                <option value="Toyota Corolla" />
                <option value="Toyota Yaris" />
                <option value="Kia Picanto" />
                <option value="Kia Sportage" />
                <option value="Fiat 500" />
                <option value="Citroen C3" />
                <option value="Ford Fiesta" />
                <option value="Seat Ibiza" />
                <option value="Skoda Octavia" />
              </datalist>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4 mb-2 block text-left">
                {t('vehicleSettings.odometer') || 'Odometer'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={odometer}
                  onChange={e => setOdometer(e.target.value)}
                  placeholder="0"
                  className="w-full h-14 bg-surface-dark border border-white/10 rounded-2xl px-5 pr-14 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors font-bold"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-black">KM</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4 mb-2 block text-left">
                {t('profile.fuelType') || 'Fuel Type'}
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'Diesel', label: t('station.diesel') },
                  { id: 'Sans Plomb', label: t('station.sansPlomb') },
                  { id: 'Premium', label: t('station.premium') }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFuelType(item.id)}
                    className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all border ${fuelType === item.id
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-surface-dark border-white/5 text-slate-400 hover:bg-white/5'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-auto mb-8 pt-4 text-left">
            <button onClick={saveVehicleData} disabled={isSaving} className="w-full h-16 bg-primary text-background-dark font-black text-lg rounded-[2rem] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center">
              {isSaving ? (
                <div className="size-6 border-4 border-background-dark border-t-transparent rounded-full animate-spin"></div>
              ) : t('auth.continue') || 'Continue'}
            </button>
            <button onClick={next} disabled={isSaving} className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors">
              {t('onboarding.skip') || 'Skip for now'}
            </button>
          </div>
        </div>
      )
      }

      {/* STEP 4: PUSH NOTIFICATIONS */}
      {
        step === 4 && (
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
        )
      }
    </div >
  );
};