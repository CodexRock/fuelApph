import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const VehicleSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [category, setCategory] = useState<'car' | 'taxi' | 'truck' | 'moto'>('car');
  const [fuel, setFuel] = useState('Diesel');
  const [modelName, setModelName] = useState('');
  const [odometer, setOdometer] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('users').select('vehicle').eq('id', user.id).single().then(({ data }) => {
        if (data?.vehicle) {
          const v = typeof data.vehicle === 'string' ? JSON.parse(data.vehicle) : data.vehicle;
          setModelName(v.model || '');
          setOdometer(v.odometer?.toString() || '');
          setCategory(v.category || 'car');
          setFuel(v.fuel || 'Diesel');
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('users').update({
      vehicle: JSON.stringify({ model: modelName, odometer: parseInt(odometer) || 0, category, fuel })
    }).eq('id', user.id);
    setSaving(false);
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fadeIn">
      <header className="flex items-center justify-between p-4 pt-12 z-20">
        <button onClick={onBack} className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-black">{t('vehicleSettings.title') || 'Vehicle Settings'}</h1>
        <div className="size-11" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        <section>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('vehicleSettings.category') || 'Vehicle Category'}</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'car', label: t('vehicleSettings.personal') || 'Personal', icon: 'directions_car' },
              { id: 'taxi', label: t('vehicleSettings.taxi') || 'Taxi', icon: 'local_taxi' },
              { id: 'truck', label: t('vehicleSettings.truck') || 'Truck', icon: 'local_shipping' },
              { id: 'moto', label: t('vehicleSettings.moto') || 'Moto', icon: 'moped' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${category === cat.id ? 'bg-primary border-primary text-background-dark' : 'bg-surface-dark border-white/5 text-slate-400'}`}
              >
                <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                <span className="text-[9px] font-black uppercase">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('vehicleSettings.coreInfo') || 'Vehicle Information'}</h2>
          <div className="bg-surface-dark rounded-3xl border border-white/5 p-2 space-y-1">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <span className="text-sm font-bold text-slate-300">{t('vehicleSettings.modelName') || 'Model Name'}</span>
              <input
                className="bg-transparent border-none text-right font-bold text-white focus:ring-0 focus:outline-none p-0 w-40"
                value={modelName}
                onChange={e => setModelName(e.target.value)}
                placeholder={t('vehicleSettings.enterModel') || 'e.g. Dacia Logan'}
                list="moroccan-cars"
              />
              <datalist id="moroccan-cars">
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
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">{t('vehicleSettings.odometer') || 'Odometer'}</span>
              <div className="flex items-center gap-2">
                <input
                  className="bg-transparent border-none text-right font-bold text-white focus:ring-0 focus:outline-none p-0 w-24"
                  value={odometer}
                  onChange={e => setOdometer(e.target.value)}
                  type="number"
                  placeholder="0"
                />
                <span className="text-xs text-slate-500 font-bold">KM</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('vehicleSettings.primaryFuel') || 'Primary Fuel'}</h2>
          <div className="flex gap-3">
            {['Diesel', 'Sans Plomb', 'Premium'].map(f => (
              <button
                key={f}
                onClick={() => setFuel(f)}
                className={`flex-1 py-4 rounded-2xl border font-bold text-xs transition-all ${fuel === f ? 'bg-white text-background-dark border-white' : 'bg-surface-dark border-white/5 text-slate-400'}`}
              >
                {f === 'Diesel' ? (t('station.diesel') || 'Diesel') : f === 'Sans Plomb' ? (t('station.sansPlomb') || 'Unleaded') : (t('station.premium') || 'Premium')}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-16 bg-primary text-background-dark font-black text-lg rounded-[2rem] shadow-xl shadow-primary/20 active:scale-95 transition-all mt-8 disabled:opacity-50"
        >
          {saving ? (
            <div className="size-6 border-4 border-background-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (t('vehicleSettings.saveChanges') || 'Save Changes')}
        </button>
      </div>
    </div>
  );
};