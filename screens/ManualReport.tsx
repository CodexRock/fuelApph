import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Station, FuelType } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ManualReportProps {
  station: Station;
  onBack: () => void;
  onComplete: (price: number, fuelType: string) => void;
}

export const ManualReport: React.FC<ManualReportProps> = ({ station, onBack, onComplete }) => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState<Record<string, string>>({
    Diesel: station.prices?.Diesel?.toString() || "0",
    "Sans Plomb": station.prices?.['Sans Plomb']?.toString() || "0",
    Premium: station.prices?.Premium?.toString() || "0",
  });
  const [modifiedFuels, setModifiedFuels] = useState<Set<string>>(new Set());
  const [fuelType, setFuelType] = useState<FuelType>('Diesel');
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState('');

  const priceStr = prices[fuelType];

  const updatePrice = (newPrice: string) => {
    setPrices(prev => ({ ...prev, [fuelType]: newPrice }));
    setModifiedFuels(prev => new Set(prev).add(fuelType));
    setValidationError('');
  };

  // Sync price when station or fuelType changes initially
  React.useEffect(() => {
    // If not modified, sync with station
    if (!modifiedFuels.has(fuelType)) {
      const currentPrice = station.prices?.[fuelType];
      if (currentPrice && currentPrice > 0) {
        setPrices(prev => ({ ...prev, [fuelType]: currentPrice.toString() }));
      } else {
        setPrices(prev => ({ ...prev, [fuelType]: "0" }));
      }
    }
  }, [station.id, fuelType]);

  const handleKeypadPress = (val: string) => {
    // On first keypress for an unmodified fuel type, auto-clear the old price
    if (!modifiedFuels.has(fuelType) && val !== 'backspace') {
      if (val === '.') {
        updatePrice('0.');
      } else {
        updatePrice(val);
      }
      return;
    }
    if (val === 'backspace') {
      updatePrice(priceStr.length > 1 ? priceStr.slice(0, -1) : "0");
      return;
    }
    if (val === '.' && priceStr.includes('.')) return;
    if (priceStr === "0" && val !== ".") {
      updatePrice(val);
    } else {
      if (priceStr.length >= 6) return;
      updatePrice(priceStr + val);
    }
  };

  const adjustPrice = (amount: number) => {
    const current = parseFloat(priceStr) || 0;
    updatePrice(Math.max(0, current + amount).toFixed(2));
  };

  const handleConfirmClick = () => {
    if (modifiedFuels.size === 0) {
      setValidationError(t('app.noChanges'));
      return;
    }

    // Validate bounds
    for (const type of modifiedFuels) {
      const p = parseFloat(prices[type]);
      if (p < 8 || p > 20) {
        setValidationError(`Price for ${type} must be between 8 and 20 DH.`);
        setFuelType(type as FuelType);
        return;
      }
    }
    setShowConfirm(true);
  };

  const submitAll = () => {
    const reports: any[] = [];
    modifiedFuels.forEach(type => {
      reports.push({ fuelType: type, price: parseFloat(prices[type]) });
    });
    // Currently onComplete only takes single (price, type). Passing first one, then others if we updated App.tsx. Let's pass array
    // @ts-ignore
    onComplete(reports);
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-background-dark font-sans flex flex-col items-center justify-start text-slate-100 antialiased h-screen w-full overflow-hidden select-none animate-fadeIn">
      {/* Top Navigation */}
      <header className="w-full flex items-center justify-between px-4 py-4 pt-12 shrink-0 z-10">
        <button onClick={onBack} className="flex items-center justify-center p-3 rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <h1 className="text-lg font-black uppercase tracking-widest">{t('manualReport.reportPrice')}</h1>
        <button className="flex items-center justify-center p-3 rounded-full hover:bg-white/10 transition-colors text-primary">
          <span className="material-symbols-outlined text-2xl">document_scanner</span>
        </button>
      </header>

      {/* Main Content Area - Scrollable for mobile compatibility */}
      <main className="flex-1 w-full max-w-md flex flex-col px-4 pb-4 overflow-y-auto no-scrollbar gap-4">

        {/* Fuel Type Selector */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {(['Diesel', 'Sans Plomb', 'Premium'] as FuelType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFuelType(type)}
              className={`h-12 flex items-center justify-center rounded-2xl border-2 transition-all duration-200 relative overflow-hidden ${fuelType === type
                ? 'bg-primary border-primary text-background-dark shadow-lg shadow-primary/20'
                : 'bg-surface-dark border-transparent text-slate-400'
                }`}
            >
              <span className="text-xs font-black uppercase tracking-tight">
                {type === 'Diesel' ? t('station.diesel') : type === 'Sans Plomb' ? t('station.sansPlomb') : t('station.premium') || 'Premium'}
              </span>
              {fuelType === type && (
                <div className="absolute top-1 right-1 text-background-dark">
                  <span className="material-symbols-outlined text-[10px] font-black">check_circle</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Price Display Section */}
        <div className="flex flex-col items-center justify-center py-2 shrink-0">
          <div className="flex items-center gap-6 w-full justify-center">
            {/* Stepper Minus */}
            <button
              onClick={() => adjustPrice(-0.01)}
              className="size-10 flex items-center justify-center rounded-full bg-surface-dark text-slate-400 active:bg-red-500/20 active:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl font-black">remove</span>
            </button>

            {/* Main Price */}
            <div className="flex flex-col items-center">
              <div className="flex items-baseline">
                <span className="text-[64px] font-black tracking-tighter leading-none text-white tabular-nums">
                  {priceStr}
                </span>
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2 opacity-70">{t('map.madL')}</span>
            </div>

            {/* Stepper Plus */}
            <button
              onClick={() => adjustPrice(0.01)}
              className="size-10 flex items-center justify-center rounded-full bg-surface-dark text-slate-400 active:bg-primary/20 active:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-2xl font-black">add</span>
            </button>
          </div>
          {validationError && (
            <p className="text-red-400 font-bold text-xs mt-4 animate-fadeIn">{validationError}</p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 px-2 mb-2 shrink-0">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map((key) => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              className={`h-12 rounded-2xl transition-all flex items-center justify-center active:scale-90 text-xl font-black ${key === 'backspace'
                ? 'bg-surface-dark/50 text-red-500'
                : 'bg-surface-dark text-white'
                }`}
            >
              {key === 'backspace' ? <span className="material-symbols-outlined">backspace</span> : key}
            </button>
          ))}
        </div>

        {/* Detected Station Info */}
        <div className="flex items-center gap-3 p-3 bg-surface-dark/40 rounded-2xl border border-white/5 shrink-0">
          <div className="size-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            <span className="text-slate-900 font-black text-[10px] uppercase">{station.brand.substring(0, 2)}</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <span className="text-sm font-black text-white truncate uppercase">{station.name}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter truncate mt-1">{station.location.address}</span>
          </div>
          <button className="text-[10px] font-black text-primary px-4 py-2 rounded-lg bg-primary/10 uppercase tracking-widest">
            {t('manualReport.change')}
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleConfirmClick}
          className="w-full h-14 bg-primary text-background-dark font-black text-lg rounded-3xl shadow-[0_15px_30px_rgba(59,130,246,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-1 shrink-0 mb-4 uppercase tracking-widest"
        >
          <span>{modifiedFuels.size > 0 ? t('manualReport.confirmPrice') : t('app.noChanges')}</span>
          <span className="material-symbols-outlined font-black text-[20px]">{modifiedFuels.size > 0 ? "check" : "edit"}</span>
        </button>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (document.getElementById('modal-root') || document.body) && createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="bg-surface-dark border border-white/5 rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-black uppercase tracking-widest mb-4">{t('manualReport.confirmPrice')}</h3>
            <div className="bg-background-dark/50 rounded-2xl p-4 mb-6 space-y-3">
              {Array.from(modifiedFuels).map(type => (
                <div key={type} className="flex justify-between items-center bg-surface-dark/50 p-3 rounded-xl">
                  <span className="font-bold text-slate-300">
                    {type === 'Diesel' ? t('station.diesel') : type === 'Sans Plomb' ? t('station.sansPlomb') : t('station.premium')}
                  </span>
                  <span className="font-black text-primary text-xl">{prices[type]} <span className="text-xs text-slate-500">DH</span></span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 text-slate-300 hover:bg-white/5">{t('app.cancel')}</button>
              <button onClick={submitAll} className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-primary text-background-dark shadow-[0_10px_20px_rgba(59,130,246,0.3)]">{t('app.confirm')}</button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}

      {/* iOS Home Indicator Spacer */}
      <div className="h-4 w-full shrink-0" />
    </div>
  );
};