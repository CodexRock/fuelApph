import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';

interface SearchScreenProps {
  onBack: () => void;
  onApplyFilters: (filters: any) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onBack, onApplyFilters }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFuel, setSelectedFuel] = useState<'Diesel' | 'Sans Plomb' | 'Premium'>('Diesel');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const brands = [
    { id: 'Afriquia', label: 'Afriquia', code: 'AF', color: 'bg-blue-600' },
    { id: 'Shell', label: 'Shell', code: 'SH', color: 'bg-yellow-400 text-black' },
    { id: 'TotalEnergies', label: 'Total', code: 'TE', color: 'bg-orange-500' },
    { id: 'Winxo', label: 'Winxo', code: 'WX', color: 'bg-purple-600' },
    { id: 'ZIZ', label: 'ZIZ', code: 'ZZ', color: 'bg-red-600' },
    { id: 'Petrom', label: 'Petrom', code: 'PT', color: 'bg-teal-500' },
    { id: 'STLC', label: 'STLC', code: 'ST', color: 'bg-green-600' },
    { id: 'Other', label: 'Autre', code: 'XX', color: 'bg-slate-500' },
  ];

  const amenities = [
    { id: 'Mosque', label: t('amenities.Mosque'), icon: 'mosque' },
    { id: 'Café', label: t('amenities.Café'), icon: 'local_cafe' },
    { id: 'ATM', label: t('amenities.ATM'), icon: 'atm' },
    { id: 'Car Wash', label: t('amenities.Car Wash'), icon: 'local_car_wash' },
    { id: 'EV Charge', label: t('amenities.EV Charge'), icon: 'ev_charger' },
  ];

  const [popularCities, setPopularCities] = useState([
    { name: 'Casablanca', stations: 0, img: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?auto=format&fit=crop&q=80&w=400&h=300' },
    { name: 'Rabat', stations: 0, img: 'https://images.unsplash.com/photo-1570804485046-1d8ef7c3b835?auto=format&fit=crop&q=80&w=400&h=300' },
    { name: 'Marrakech', stations: 0, img: 'https://images.unsplash.com/photo-1597825310705-776fd308cbb3?auto=format&fit=crop&q=80&w=400&h=300' },
    { name: 'Fès', stations: 0, img: 'https://images.unsplash.com/photo-1579017308347-e2aba1215db8?auto=format&fit=crop&q=80&w=400&h=300' },
    { name: 'Tanger', stations: 0, img: 'https://images.unsplash.com/photo-1553522991-71439aa39b90?auto=format&fit=crop&q=80&w=400&h=300' },
    { name: 'Agadir', stations: 0, img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=400&h=300' },
  ]);

  const [recentSearches, setRecentSearches] = useState<{ name: string, meta: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fuelspy_recent_searches') || '[]');
    } catch { return []; }
  });

  const addRecentSearch = (name: string, meta: string) => {
    const updated = [{ name, meta }, ...recentSearches.filter(s => s.name !== name)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('fuelspy_recent_searches', JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('fuelspy_recent_searches');
  };

  useEffect(() => {
    const fetchStats = async () => {
      const { count: casaCount } = await supabase.from('stations').select('*', { count: 'exact', head: true }).ilike('name', '%casablanca%');
      const { count: rabatCount } = await supabase.from('stations').select('*', { count: 'exact', head: true }).ilike('name', '%rabat%');
      const { count: kechCount } = await supabase.from('stations').select('*', { count: 'exact', head: true }).ilike('name', '%marrakech%');

      setPopularCities(prev => prev.map(c => {
        if (c.name === 'Casablanca') return { ...c, stations: casaCount || 0 };
        if (c.name === 'Rabat') return { ...c, stations: rabatCount || 0 };
        if (c.name === 'Marrakech') return { ...c, stations: kechCount || 0 };
        return c;
      }));
    };
    fetchStats();
  }, []);

  const toggleBrand = (id: string) => {
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      query: searchQuery,
      selectedFuel,
      selectedBrands,
      selectedAmenities
    });
  };

  const hasFiltersOrQuery = searchQuery.trim().length > 0 || selectedBrands.length > 0 || selectedAmenities.length > 0;

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fadeIn overflow-hidden">
      <header className="flex items-center justify-between p-4 pt-12 shrink-0">
        <button onClick={onBack} className="text-white p-2 rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-white text-xl font-black tracking-tight">{t('search.findFuel')}</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center text-primary">
            <span className="material-symbols-outlined text-xl">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.searchPlaceholder')}
            className="w-full bg-surface-dark border-none rounded-2xl py-4 flex-1 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8">
          {[
            { id: 'cheapest', label: t('search.cheapest'), icon: 'payments' },
            { id: 'nearest', label: t('search.nearest'), icon: 'near_me' },
            { id: 'rewards', label: t('search.myRewards'), icon: 'stars' },
          ].map((f, i) => (
            <button
              key={f.id}
              onClick={() => {
                if (f.id === 'cheapest' || f.id === 'nearest') {
                  onApplyFilters({ query: '', selectedFuel, selectedBrands: [], selectedAmenities: [], sortValue: f.id });
                }
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${i === 0 ? 'bg-primary border-primary text-background-dark shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-slate-400 hover:bg-surface-dark/80 active:scale-95'
                }`}
            >
              <span className="material-symbols-outlined text-lg">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-lg">{t('search.recentSearches')}</h2>
            <button className="text-primary text-xs font-bold active:opacity-50 transition-opacity" onClick={() => { setSearchQuery(''); setSelectedBrands([]); setSelectedAmenities([]); }}>{t('search.clear')}</button>
          </div>
          <div className="space-y-3">
            {recentSearches.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-surface-dark/40 p-4 rounded-2xl border border-white/5 active:scale-[0.98] transition-all cursor-pointer hover:bg-surface-dark/60"
                onClick={() => onApplyFilters({ query: s.name, selectedFuel, selectedBrands: [], selectedAmenities: [] })}
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-white/5 rounded-full flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{s.name}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{s.meta}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-600 text-lg">north_east</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-white font-black text-lg mb-4">{t('search.popularCities')}</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {popularCities.slice(0, 2).map((city) => (
              <div
                key={city.name}
                className="relative h-32 rounded-3xl overflow-hidden group cursor-pointer active:scale-95 transition-all"
                onClick={() => onApplyFilters({ query: city.name, selectedFuel, selectedBrands: [], selectedAmenities: [] })}
              >
                <img src={city.img} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-black text-xl leading-none">{city.name}</p>
                  <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">local_gas_station</span>
                    {city.stations} {t('search.stations')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="relative h-32 rounded-3xl overflow-hidden group cursor-pointer active:scale-95 transition-all"
            onClick={() => onApplyFilters({ query: popularCities[2].name, selectedFuel, selectedBrands: [], selectedAmenities: [] })}
          >
            <img src={popularCities[2].img} alt={popularCities[2].name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <p className="text-white font-black text-xl leading-none">{popularCities[2].name}</p>
              <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">local_gas_station</span>
                {popularCities[2].stations} {t('search.stations')}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-white font-black text-lg mb-4">{t('search.filterBrand')}</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {brands.map((brand) => (
              <div key={brand.id} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => toggleBrand(brand.id)}
                  className={`size-16 rounded-3xl flex items-center justify-center text-sm font-black transition-all border-2 ${selectedBrands.includes(brand.id) ? 'border-primary ring-4 ring-primary/10' : 'border-white/5'
                    } ${brand.color}`}
                >
                  {brand.code}
                </button>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{brand.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-white font-black text-lg mb-4">{t('search.amenities')}</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`size-14 rounded-2xl flex items-center justify-center transition-all border ${selectedAmenities.includes(amenity.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-dark border-white/5 text-slate-500'
                    }`}
                >
                  <span className="material-symbols-outlined">{amenity.icon}</span>
                </button>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-white font-black text-lg mb-4">{t('search.fuelType')}</h2>
          <div className="flex bg-surface-dark p-1.5 rounded-2xl border border-white/5">
            {(['Diesel', 'Sans Plomb', 'Premium'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFuel(type)}
                className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${selectedFuel === type ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-500'
                  }`}
              >
                {type === 'Diesel' ? t('station.diesel') : type === 'Sans Plomb' ? t('station.sansPlomb') : 'Premium'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFiltersOrQuery && (
        <div className="absolute bottom-6 left-6 right-6 z-50 animate-slide-up">
          <button
            onClick={handleApply}
            className="w-full bg-primary text-background-dark font-black px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
          >
            {t('search.showResults') || 'Show Results'}
          </button>
        </div>
      )}
    </div>
  );
};