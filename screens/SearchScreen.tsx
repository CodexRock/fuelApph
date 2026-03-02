import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';

interface SearchScreenProps {
  onBack: () => void;
  onApplyFilters: (filters: any) => void;
}

const CITY_GRADIENTS = [
  'from-blue-600 to-cyan-500',
  'from-purple-600 to-pink-500',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-600',
  'from-indigo-500 to-violet-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-lime-500 to-green-600',
  'from-fuchsia-500 to-purple-600',
  'from-cyan-500 to-blue-500',
  'from-yellow-500 to-amber-600',
];

const CITY_ICONS = [
  'location_city', 'mosque', 'castle', 'landscape', 'fort',
  'beach_access', 'domain', 'apartment', 'villa', 'temple_buddhist',
  'holiday_village', 'factory'
];

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
    { id: 'Mosque', label: t('amenities.Mosque') || 'Mosque', icon: 'mosque' },
    { id: 'Café', label: t('amenities.Café') || 'Café', icon: 'local_cafe' },
    { id: 'ATM', label: t('amenities.ATM') || 'ATM', icon: 'atm' },
    { id: 'Car Wash', label: t('amenities.Car Wash') || 'Car Wash', icon: 'local_car_wash' },
    { id: 'EV Charge', label: t('amenities.EV Charge') || 'EV Charge', icon: 'ev_charger' },
  ];

  const [popularCities] = useState([
    { name: 'Casablanca', icon: 'location_city' },
    { name: 'Rabat', icon: 'account_balance' },
    { name: 'Marrakech', icon: 'mosque' },
    { name: 'Fès', icon: 'castle' },
    { name: 'Tanger', icon: 'sailing' },
    { name: 'Agadir', icon: 'beach_access' },
    { name: 'Meknès', icon: 'fort' },
    { name: 'Oujda', icon: 'landscape' },
    { name: 'Kénitra', icon: 'domain' },
    { name: 'Tétouan', icon: 'villa' },
    { name: 'Safi', icon: 'factory' },
    { name: 'El Jadida', icon: 'holiday_village' },
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

  const handleCityTap = (cityName: string) => {
    addRecentSearch(cityName, t('search.popularCities') || 'Popular City');
    onApplyFilters({ query: cityName, selectedFuel, selectedBrands: [], selectedAmenities: [] });
  };

  const handleApply = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim(), new Date().toLocaleDateString());
    }
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
        <h1 className="text-white text-xl font-black tracking-tight">{t('search.findFuel') || 'Find Fuel'}</h1>
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
            placeholder={t('search.searchPlaceholder') || 'Search station or city...'}
            className="w-full bg-surface-dark border-none rounded-2xl py-4 flex-1 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Quick Filters — only Cheapest and Nearest */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8">
          {[
            { id: 'cheapest', label: t('search.cheapest') || 'Cheapest', icon: 'payments' },
            { id: 'nearest', label: t('search.nearest') || 'Nearest', icon: 'near_me' },
          ].map((f, i) => (
            <button
              key={f.id}
              onClick={() => {
                onApplyFilters({ query: '', selectedFuel, selectedBrands: [], selectedAmenities: [], sortValue: f.id });
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${i === 0 ? 'bg-primary border-primary text-background-dark shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-slate-400 hover:bg-surface-dark/80 active:scale-95'
                }`}
            >
              <span className="material-symbols-outlined text-lg">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black text-lg">{t('search.recentSearches') || 'Recent Searches'}</h2>
              <button className="text-primary text-xs font-bold active:opacity-50 transition-opacity" onClick={clearRecent}>{t('search.clear') || 'Clear'}</button>
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
        )}

        {/* Popular Cities — Gradient Icon Cards */}
        <div className="mb-10">
          <h2 className="text-white font-black text-lg mb-4">{t('search.popularCities') || 'Popular Cities'}</h2>
          <div className="grid grid-cols-3 gap-3">
            {popularCities.map((city, i) => (
              <button
                key={city.name}
                className="flex flex-col items-center gap-2 p-4 rounded-3xl border border-white/5 bg-surface-dark hover:border-primary/30 active:scale-95 transition-all group"
                onClick={() => handleCityTap(city.name)}
              >
                <div className={`size-12 rounded-2xl bg-gradient-to-br ${CITY_GRADIENTS[i % CITY_GRADIENTS.length]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{city.icon}</span>
                </div>
                <span className="text-[11px] font-black text-white tracking-tight text-center leading-tight">{city.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="mb-10">
          <h2 className="text-white font-black text-lg mb-4">{t('search.filterBrand') || 'Filter by Brand'}</h2>
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

        {/* Amenities */}
        <div className="mb-10">
          <h2 className="text-white font-black text-lg mb-4">{t('search.amenities') || 'Amenities'}</h2>
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

        {/* Fuel Type */}
        <div className="mb-10">
          <h2 className="text-white font-black text-lg mb-4">{t('search.fuelType') || 'Fuel Type'}</h2>
          <div className="flex bg-surface-dark p-1.5 rounded-2xl border border-white/5">
            {(['Diesel', 'Sans Plomb', 'Premium'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFuel(type)}
                className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${selectedFuel === type ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-500'
                  }`}
              >
                {type === 'Diesel' ? (t('station.diesel') || 'Diesel') : type === 'Sans Plomb' ? (t('station.sansPlomb') || 'Unleaded') : (t('station.premium') || 'Premium')}
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