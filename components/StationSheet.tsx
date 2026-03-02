import React, { useState, useRef } from 'react';
import { Station } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { confirmPrice } from '../services/stationService';
import { calculateDistance, estimateDrivingTime } from '../utils/distance';
import { supabase } from '../lib/supabase';

interface StationSheetProps {
  station: Station | null;
  onClose: () => void;
  onReport: () => void;
  onManualReport: () => void;
  onVoiceReport: () => void;
  userLocation?: { lat: number, lng: number } | null;
  onValidateDistance: () => boolean;
  showAlert: (title: string, message: string, type?: 'error' | 'success' | 'info') => void;
}

export const StationSheet: React.FC<StationSheetProps> = ({
  station,
  onClose,
  onReport,
  onManualReport,
  onVoiceReport,
  userLocation,
  onValidateDistance,
  showAlert
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [oneTapSuccess, setOneTapSuccess] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingAmenities, setEditingAmenities] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(station?.amenities || []);
  const [savingAmenities, setSavingAmenities] = useState(false);

  if (!station) return null;

  let drivingTimeText = '';
  if (userLocation) {
    const dist = calculateDistance(userLocation.lat, userLocation.lng, station.location.lat, station.location.lng);
    const mins = estimateDrivingTime(dist);
    drivingTimeText = `${mins} min`;
    if (dist < 1000) {
      drivingTimeText += ` (${Math.round(dist)} m)`;
    } else {
      drivingTimeText += ` (${(dist / 1000).toFixed(1)} km)`;
    }
  }

  const isStale = Date.now() - station.lastUpdatedTimestamp > 86400000;
  const isHighlyTrusted = (station.verifiedByLevel || 0) > 10 && !isStale;

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only pull down if we are at the top of the scrollable content
    if (diff > 0 && scrollRef.current && scrollRef.current.scrollTop <= 0) {
      setTranslateY(diff);
    } else {
      setTranslateY(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > 100) {
      onClose();
    }
    setTranslateY(0);
  };

  const openWaze = () => window.open(`waze://?ll=${station.location.lat},${station.location.lng}&navigate=yes`, '_blank');
  const openGoogleMaps = () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}`, '_blank');

  const handleOneTap = async () => {
    if (!onValidateDistance()) return;

    if (user && station) {
      // Confirm whichever fuel type has a price, prioritize Diesel then Sans Plomb
      const fuelToConfirm = station.prices?.Diesel ? 'Diesel' : station.prices?.['Sans Plomb'] ? 'Sans Plomb' : 'Diesel';
      const priceToConfirm = station.prices?.[fuelToConfirm as keyof typeof station.prices] || 0;
      const result = await confirmPrice(
        station.id,
        user.id,
        fuelToConfirm,
        priceToConfirm
      );

      if (!result.success) {
        showAlert(t('app.error') || 'Error', result.error || 'Failed to confirm price', 'error');
        return;
      }

      setOneTapSuccess(true);
      setTimeout(() => setOneTapSuccess(false), 3000);
    }
  };

  return (
    <div className="absolute inset-0 z-[3000] pointer-events-none flex flex-col justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto transition-opacity animate-fadeIn" onClick={onClose} />

      <div
        className="relative bg-surface-darker/98 backdrop-blur-2xl border-t border-white/10 rounded-t-[32px] w-full max-w-md mx-auto pointer-events-auto shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden max-h-[90vh]"
        style={{ transform: `translateY(${translateY}px)`, transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full flex justify-center pt-4 pb-2 active:bg-white/5 cursor-grab">
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto no-scrollbar px-6 pb-8"
        >

          <div className="flex items-start justify-between mt-2 mb-6">
            <div className="flex gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center p-2 shadow-inner ${station.isGhost ? 'bg-surface-dark text-slate-500 border border-white/5' : 'bg-white text-slate-900'}`}>
                <span className="font-bold text-lg uppercase">{station.brand.substring(0, 2)}</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">{station.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-[16px]">near_me</span> {station.isGhost ? t('station.mapImport') : t('station.station')}
                  </span>
                  {drivingTimeText && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-white">
                        <span className="material-symbols-outlined text-[16px] text-accent-gold">directions_car</span>
                        {drivingTimeText}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {station.isGhost ? (
            <div className="bg-gradient-to-br from-primary/20 to-surface-dark border border-primary/30 rounded-[2rem] p-6 mb-8 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 size-24 bg-primary/20 blur-2xl rounded-full"></div>
              <div className="size-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <span className="material-symbols-outlined text-3xl">add_a_photo</span>
              </div>
              <h2 className="text-xl font-black text-white mb-2">{t('station.beFirst')}</h2>
              <p className="text-xs text-slate-300 mb-6 font-medium leading-relaxed">
                {t('station.ghostDesc').replace('{brand}', station.brand)}
              </p>
              <button onClick={onReport} className="w-full h-14 bg-primary text-background-dark font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                {t('station.scanNow')}
              </button>
              <button onClick={onManualReport} className="mt-4 text-[10px] text-slate-400 font-bold uppercase hover:text-white">{t('station.enterManually')}</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-surface-dark/60 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-50">
                    <span className="material-symbols-outlined text-white/20 text-4xl -rotate-12">local_gas_station</span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1 text-left uppercase">{t('station.diesel')}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white tracking-tight">{station.prices.Diesel}</span>
                    <span className="text-sm font-medium text-gray-400">DH</span>
                  </div>
                </div>
                <div className="bg-surface-dark/60 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
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

              <div className={`flex items-center gap-2 mb-6 px-3 py-2 rounded-xl border ${isStale ? 'bg-slate-800/50 border-slate-600' : isHighlyTrusted ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20'}`}>
                <div className={`size-2 rounded-full ${isStale ? 'bg-slate-500' : isHighlyTrusted ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
                <div className="flex-1 flex justify-between items-center text-xs font-medium">
                  <span className={`flex items-center gap-1.5 ${isStale ? 'text-slate-400' : 'text-slate-300'}`}>
                    {isStale ? t('station.needsVerification') : `${t('station.verifiedBy')} ${station.verifiedBy || t('station.community')}`}
                    {!isStale && station.verifiedByLevel && (
                      <span className="bg-white/10 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black border border-white/10 uppercase tracking-widest">
                        LVL {station.verifiedByLevel}
                      </span>
                    )}
                  </span>
                  <span className={isStale ? 'text-slate-500 font-bold' : 'text-white font-bold'}>{station.lastUpdated}</span>
                </div>
              </div>

              {/* Amenities — Interactive */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('station.availableServices') || 'Services'}</h3>
                  <button
                    onClick={() => setEditingAmenities(!editingAmenities)}
                    className="text-[10px] font-black text-primary uppercase tracking-widest"
                  >
                    {editingAmenities ? (t('app.cancel') || 'Cancel') : (t('station.addAmenities') || '+ Add')}
                  </button>
                </div>

                {editingAmenities ? (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'Cafe', icon: 'local_cafe', label: t('amenities.Café') || 'Café' },
                        { id: 'Shop', icon: 'local_mall', label: t('amenities.Shop') || 'Shop' },
                        { id: 'Wash', icon: 'local_car_wash', label: t('amenities.Car Wash') || 'Car Wash' },
                        { id: 'WC', icon: 'wc', label: t('amenities.WC') || 'WC' },
                        { id: 'Mosque', icon: 'mosque', label: t('amenities.Mosque') || 'Mosque' },
                        { id: 'ATM', icon: 'atm', label: t('amenities.ATM') || 'ATM' },
                        { id: 'Air', icon: 'air', label: t('amenities.Air') || 'Air' },
                        { id: 'EV', icon: 'ev_charger', label: t('amenities.EV Charge') || 'EV' },
                        { id: 'Tire', icon: 'tire_repair', label: 'Tire' },
                      ].map(a => (
                        <button
                          key={a.id}
                          onClick={() => setSelectedAmenities(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedAmenities.includes(a.id)
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-surface-dark border-white/5 text-slate-500'
                            }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                          {a.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={async () => {
                        setSavingAmenities(true);
                        await supabase.from('stations').update({ amenities: selectedAmenities }).eq('id', station.id);
                        setSavingAmenities(false);
                        setEditingAmenities(false);
                        showAlert(t('app.success') || 'Success!', t('station.amenitiesSaved') || 'Amenities updated! +5 PTS', 'success');
                      }}
                      disabled={savingAmenities}
                      className="w-full py-3 bg-primary text-background-dark font-black text-xs rounded-xl uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                    >
                      {savingAmenities ? '...' : (t('app.confirm') || 'Save')}
                    </button>
                  </div>
                ) : station.amenities && station.amenities.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {station.amenities.map(amenity => {
                      let icon = 'local_convenience_store';
                      switch (amenity) {
                        case 'Cafe': icon = 'local_cafe'; break;
                        case 'Shop': icon = 'local_mall'; break;
                        case 'Wash': icon = 'local_car_wash'; break;
                        case 'WC': icon = 'wc'; break;
                        case 'Mosque': icon = 'mosque'; break;
                        case 'Tire': icon = 'tire_repair'; break;
                        case 'ATM': icon = 'atm'; break;
                        case 'Air': icon = 'air'; break;
                        case 'EV': icon = 'ev_charger'; break;
                      }
                      return (
                        <div key={amenity} className="flex flex-col items-center justify-center bg-surface-dark border border-white/5 rounded-xl min-w-[64px] h-16 shrink-0 shadow-lg">
                          <span className="material-symbols-outlined text-slate-400 mb-1 text-[20px]">{icon}</span>
                          <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingAmenities(true)}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 text-xs font-black uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all"
                  >
                    {t('station.noAmenities') || 'No services reported yet — tap to add'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                <button onClick={openWaze} className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20 shadow-lg active:scale-95">
                  <img src="https://cdn.simpleicons.org/waze/60a5fa" alt="Waze" className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('station.openWaze')}</span>
                </button>
                <button onClick={openGoogleMaps} className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-surface-dark/60 text-slate-300 hover:bg-surface-dark transition-colors border border-white/10 shadow-lg active:scale-95">
                  <span className="material-symbols-outlined text-lg">map</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('station.googleMaps')}</span>
                </button>
                <button onClick={() => {
                  const dieselPrice = station.prices?.Diesel ? `Diesel: ${station.prices.Diesel} DH` : '';
                  const spPrice = station.prices?.['Sans Plomb'] ? `SP: ${station.prices['Sans Plomb']} DH` : '';
                  const prices = [dieselPrice, spPrice].filter(Boolean).join(' | ');
                  const text = `⛽ ${station.name} — ${prices}\n📍 https://www.google.com/maps?q=${station.location.lat},${station.location.lng}\n\nVia FuelSpy Morocco 🇲🇦`;
                  if (navigator.share) {
                    navigator.share({ title: station.name, text });
                  } else {
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }
                }} className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20 shadow-lg active:scale-95">
                  <span className="material-symbols-outlined text-lg">share</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                </button>
              </div>

              {!oneTapSuccess ? (
                <button onClick={handleOneTap} className="w-full relative group flex items-center justify-center gap-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 py-4 rounded-2xl mb-8 shadow-[0_0_20px_rgba(34,197,94,0.05)] transition-all active:scale-95">
                  <span className="text-2xl animate-bounce-slight">👍</span>
                  <span className="font-black text-sm uppercase tracking-widest">{t('station.confirmPrices')}</span>
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-background-dark text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">+10 PTS</div>
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-green-500 text-background-dark py-4 rounded-2xl mb-8 shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-fadeIn duration-300">
                  <span className="material-symbols-outlined font-black">check_circle</span>
                  <span className="font-black text-sm uppercase tracking-widest">{t('station.verified10')}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{t('station.reportChange')}</h3>
                </div>

                <button onClick={onReport} className="w-full group relative flex items-center justify-between bg-primary hover:bg-blue-400 transition-all duration-300 rounded-2xl p-5 text-background-dark overflow-hidden shadow-lg">
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
                  <button onClick={onVoiceReport} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all rounded-2xl p-4 active:scale-95">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                    <span className="font-black text-xs uppercase tracking-widest">{t('station.voice')}</span>
                  </button>
                  <button onClick={onManualReport} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all rounded-2xl p-4 active:scale-95">
                    <span className="material-symbols-outlined text-slate-400">edit</span>
                    <span className="font-black text-xs uppercase tracking-widest">{t('station.manual')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};