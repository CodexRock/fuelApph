import React, { useState } from 'react';
import { Station } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { confirmPrice } from '../services/stationService';
import { isInsideMorocco, getFunnyMoroccoRestrictionMessage } from '../utils/location';

interface StationDetailsProps {
  station: Station;
  onBack: () => void;
  onReport: () => void;
  onManualReport: () => void;
  onVoiceReport: () => void;
}

export const StationDetails: React.FC<StationDetailsProps> = ({ station, onBack, onReport, onManualReport, onVoiceReport }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showRating, setShowRating] = useState(false);
  const [oneTapSuccess, setOneTapSuccess] = useState(false);

  const openNavigation = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}`, '_blank');
  };

  const handleOneTap = async () => {
    if (!isInsideMorocco(station.location.lat, station.location.lng)) {
      alert(getFunnyMoroccoRestrictionMessage());
      return;
    }
    setOneTapSuccess(true);
    if (user && station) {
      await confirmPrice(
        station.id,
        user.id,
        'Diesel',
        station.prices?.Diesel || 0
      );
    }
    setTimeout(() => setOneTapSuccess(false), 3000);
  };

  const amenitiesMap: Record<string, string> = {
    'Café': 'local_cafe',
    'Shop': 'grocery',
    'Air': 'tire_repair',
    'WC': 'wc',
    'Mosque': 'mosque',
    'ATM': 'atm',
    'Car Wash': 'local_car_wash',
    'EV Charge': 'ev_charger'
  };

  return (
    <div className="bg-background-dark font-display text-slate-100 overflow-hidden h-screen w-full relative flex flex-col">
      <div className="absolute inset-0 z-0 w-full h-full">
        <div className="w-full h-full bg-cover bg-center opacity-60 grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJLgQ9wEwiHsM99SSiFEXSia0Hldr_5vgU5gabEzxFBW8m8n6pGGj_VCXmwiTGKym51jNo9XknsvEtwRRl3zGJiTKB2JWR8WC1cH7nQJJL88atogIvMebAi6GHDbYOk_WRIV6Gjhw8aSvm09D6jyc7V1Hhb7fX218UhfVep3xrumlslJaB6RT4BGoZyW16yPWNyvpmo28zbOSjrw7X_wqWZ3sBhT8FM7mvCgzd-MCfZ_OZhYQ6oRnbSfNpTV7Wdtj6t3zqEk5MPouH')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/30 via-transparent to-background-dark/90"></div>

        <div className="absolute top-14 left-4 right-4 flex justify-between items-start z-20">
          <button onClick={onBack} className="bg-surface-dark/90 backdrop-blur-md p-3 rounded-full text-white shadow-lg border border-white/10">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        </div>

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-primary text-background-dark px-3 py-1 rounded-full text-xs font-bold mb-1 shadow-lg shadow-primary/20 whitespace-nowrap">
            {station.prices.Diesel} DH
          </div>
          <span className="material-symbols-outlined text-primary text-5xl drop-shadow-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end h-[92vh] sm:h-auto pointer-events-none">
        <div className="bg-surface-dark border-t border-white/10 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] w-full max-w-md mx-auto pointer-events-auto flex flex-col h-full sm:h-auto overflow-hidden relative backdrop-blur-xl bg-opacity-95">
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 sm:pb-6">
            {!showRating ? (
              <>
                <div className="flex items-start justify-between mt-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-2 shadow-inner">
                      <span className="text-slate-900 font-bold text-lg uppercase">{station.brand.substring(0, 2)}</span>
                    </div>
                    <div className="text-left">
                      <h1 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">{station.name}</h1>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1 text-primary">
                          <span className="material-symbols-outlined text-[16px]">near_me</span> {station.distance}
                        </span>
                        <span>•</span>
                        <span className="text-blue-400">{t('station.openNow')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={openNavigation} className="px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1 border border-primary/20">
                      <span className="material-symbols-outlined text-lg">navigation</span>
                      <span className="text-xs font-bold uppercase tracking-widest">{t('station.drive')}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                      <span className="material-symbols-outlined text-white/20 text-4xl -rotate-12">local_gas_station</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1 text-left uppercase">{t('station.diesel')}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white tracking-tight">{station.prices.Diesel}</span>
                      <span className="text-sm font-medium text-gray-400">DH</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                      <span className="material-symbols-outlined text-white/20 text-4xl -rotate-12">local_gas_station</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1 text-left uppercase">{t('station.sansPlomb')}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white tracking-tight">{station.prices['Sans Plomb']}</span>
                      <span className="text-sm font-medium text-gray-400">DH</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-xs text-slate-400 font-medium">{t('station.verifiedBy')} <span className="text-white font-bold">{station.verifiedBy || t('station.community')}</span> • {station.lastUpdated}</span>
                </div>

                {!oneTapSuccess ? (
                  <button onClick={handleOneTap} className="w-full relative group flex items-center justify-center gap-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 py-4 rounded-2xl mb-8 shadow-[0_0_20px_rgba(34,197,94,0.05)] transition-all active:scale-95">
                    <span className="text-2xl animate-bounce-slight">👍</span>
                    <span className="font-black text-sm uppercase tracking-widest">{t('station.confirmPrices')}</span>
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-background-dark text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">+10 PTS</div>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 bg-green-500 text-background-dark py-4 rounded-2xl mb-8 shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-bounce-in">
                    <span className="material-symbols-outlined font-black">check_circle</span>
                    <span className="font-black text-sm uppercase tracking-widest">{t('station.verified10')}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{t('station.reportChange')}</h3>
                    <div className="flex items-center gap-1 text-xs font-black text-accent-gold bg-accent-gold/10 px-2.5 py-1 rounded-full border border-accent-gold/20">
                      <span className="material-symbols-outlined text-[14px] fill-current">stars</span>
                      <span>{t('station.earn50')}</span>
                    </div>
                  </div>

                  <button onClick={() => {
                    if (isInsideMorocco(station.location.lat, station.location.lng)) {
                      onReport();
                    } else {
                      alert(getFunnyMoroccoRestrictionMessage());
                    }
                  }} className="w-full group relative flex items-center justify-between bg-primary hover:bg-blue-400 transition-all duration-300 rounded-2xl p-5 text-background-dark overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div className="flex items-center gap-4 z-10 text-left">
                      <div className="bg-background-dark/10 p-2.5 rounded-xl">
                        <span className="material-symbols-outlined text-[28px] font-black">center_focus_strong</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-lg leading-tight uppercase tracking-tight">{t('station.scanBoard')}</span>
                        <span className="text-[10px] opacity-70 font-black uppercase tracking-widest">{t('station.aiVerification')}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined z-10 font-black">arrow_forward</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => {
                      if (isInsideMorocco(station.location.lat, station.location.lng)) {
                        onVoiceReport();
                      } else {
                        alert(getFunnyMoroccoRestrictionMessage());
                      }
                    }} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all rounded-2xl p-4 active:scale-95">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                      <span className="font-black text-xs uppercase tracking-widest">{t('station.voice')}</span>
                    </button>
                    <button onClick={() => {
                      if (isInsideMorocco(station.location.lat, station.location.lng)) {
                        onManualReport();
                      } else {
                        alert(getFunnyMoroccoRestrictionMessage());
                      }
                    }} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all rounded-2xl p-4 active:scale-95">
                      <span className="material-symbols-outlined text-slate-400">edit</span>
                      <span className="font-black text-xs uppercase tracking-widest">{t('station.manual')}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 text-left">
                  <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">{t('station.availableServices')}</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {station.amenities.map(amenity => (
                      <div key={amenity} className="flex flex-col items-center gap-2 min-w-[64px]">
                        <div className="size-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-slate-300">
                          <span className="material-symbols-outlined text-[20px]">
                            {amenitiesMap[amenity] || 'check'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{t(`amenities.${amenity}`) || amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-fadeIn py-4 text-center">
                <h2 className="text-white font-black text-xl mb-4">{t('station.ratingStation')}</h2>
                <button onClick={() => setShowRating(false)} className="text-primary font-bold">{t('station.close')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};