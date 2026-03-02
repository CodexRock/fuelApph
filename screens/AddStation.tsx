import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { isInsideMorocco, getFunnyMoroccoRestrictionMessage } from '../utils/location';
import { isValidStation } from '../utils/brands';

interface AddStationProps {
  location: { lat: number; lng: number } | null;
  onBack: () => void;
  onComplete: (brand: string, price: number) => void;
}

export const AddStation: React.FC<AddStationProps> = ({ location, onBack, onComplete }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceStr, setPriceStr] = useState<string>("13.50");

  const brands = [
    { id: 'Afriquia', color: 'bg-blue-600' },
    { id: 'Shell', color: 'bg-yellow-400 text-black' },
    { id: 'TotalEnergies', color: 'bg-red-500' },
    { id: 'Winxo', color: 'bg-purple-700' },
    { id: 'Ola Energy', color: 'bg-blue-800' },
    { id: 'Petrom', color: 'bg-orange-600' },
    { id: 'Other', color: 'bg-slate-700' }
  ];

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setPriceStr(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
      return;
    }
    if (val === '.' && priceStr.includes('.')) return;
    if (priceStr === "0" && val !== ".") setPriceStr(val);
    else if (priceStr.length < 6) setPriceStr(prev => prev + val);
  };

  return (
    <div className="absolute inset-0 z-[1200] bg-background-dark font-sans flex flex-col text-slate-100 antialiased h-screen w-full overflow-hidden animate-slide-up">
      <header className="flex items-center justify-between px-4 py-4 pt-12 shrink-0 z-10 border-b border-white/5">
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="p-3 rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black uppercase tracking-widest text-white">{t('addStation.title')}</h1>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{t('addStation.pioneerReward')}</span>
        </div>
        <div className="w-12" />
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 flex flex-col">
        {step === 1 ? (
          <div className="flex flex-col flex-1 animate-fadeIn">
            <h2 className="text-2xl font-black text-white mb-2">{t('addStation.selectBrand')}</h2>
            <p className="text-slate-400 text-sm mb-8">{t('addStation.whatStation')}</p>

            <div className="grid grid-cols-2 gap-4 mb-auto">
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={`relative h-24 rounded-3xl flex flex-col items-center justify-center border-2 transition-all active:scale-95 ${selectedBrand === b.id ? 'border-primary ring-4 ring-primary/20 bg-surface-dark' : 'border-white/5 bg-surface-dark/50'
                    }`}
                >
                  <div className={`size-10 rounded-xl mb-2 flex items-center justify-center shadow-lg font-black text-xs ${b.color}`}>
                    {b.id.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-white">{b.id}</span>
                  {selectedBrand === b.id && (
                    <div className="absolute top-2 right-2 text-primary">
                      <span className="material-symbols-outlined text-sm font-black" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              disabled={!selectedBrand}
              onClick={() => setStep(2)}
              className={`w-full h-16 mt-8 font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-2 ${selectedBrand ? 'bg-primary text-background-dark shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:scale-[1.02]' : 'bg-surface-dark text-slate-500 cursor-not-allowed'
                }`}
            >
              {t('addStation.nextStep')} <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8 p-4 bg-surface-dark rounded-2xl border border-white/5">
              <div className="size-12 rounded-xl bg-white flex items-center justify-center shadow-inner">
                <span className="text-slate-900 font-black text-sm uppercase">{selectedBrand.substring(0, 2)}</span>
              </div>
              <div>
                <h3 className="font-black text-white text-lg">{selectedBrand} {t('addStation.station')}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">my_location</span>
                  Lat: {location?.lat.toFixed(4)}, Lng: {location?.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white text-center mb-6">{t('addStation.currentDieselPrice')}</h2>

            <div className="flex justify-center mb-8">
              <div className="flex flex-col items-center">
                <span className="text-[72px] font-black tracking-tighter leading-none text-white tabular-nums">
                  {priceStr}
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2 opacity-70">{t('addStation.madLiter')}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypadPress(key)}
                  className={`h-16 rounded-2xl transition-all flex items-center justify-center active:scale-90 text-2xl font-black ${key === 'backspace' ? 'bg-surface-dark/50 text-red-500' : 'bg-surface-dark text-white'
                    }`}
                >
                  {key === 'backspace' ? <span className="material-symbols-outlined">backspace</span> : key}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (location && isInsideMorocco(location.lat, location.lng)) {
                  let finalName = selectedBrand;
                  if (selectedBrand === 'Other') {
                    const customName = prompt(t('addStation.enterName') || "Entrez le nom de la station (ex: Station CP):");
                    if (!customName) return;
                    if (!isValidStation(customName, 'Other')) {
                      alert(t('addStation.invalidName') || "Nom invalide. Assurez-vous d'inclure 'Station' ou une marque reconnaissable.");
                      return;
                    }
                    finalName = customName;
                  }
                  onComplete(finalName, parseFloat(priceStr));
                } else {
                  alert(getFunnyMoroccoRestrictionMessage());
                }
              }}
              className="w-full h-16 mt-8 bg-accent-gold text-background-dark font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(251,191,36,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined font-black">flag</span>
              {t('addStation.claimReward')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};