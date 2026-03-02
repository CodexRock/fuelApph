import React, { useEffect, useState, useMemo } from 'react';
import { Station } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';

interface NearbyListProps {
  onStationSelect: (station: Station) => void;
  onBack: () => void;
  title?: string;
  initialSearch?: string;
  searchPlaceholder?: string;
  searchFilters?: { query?: string, selectedFuel?: string, selectedBrands?: string[], selectedAmenities?: string[], sortValue?: string } | null;
  userLocation?: { lat: number, lng: number } | null;
}

import { calculateDistance } from '../utils/distance';

export const NearbyList: React.FC<NearbyListProps> = ({
  onStationSelect,
  onBack,
  title,
  initialSearch = "Agdal, Rabat",
  searchPlaceholder,
  searchFilters,
  userLocation
}) => {
  const { t } = useLanguage();

  const displayTitle = title || t('nearby.nearbyStations');
  const displayPlaceholder = searchPlaceholder || t('nearby.searchArea');

  const sortOptions = [
    { id: 'cheapest', label: t('nearby.cheapest') },
    { id: 'nearest', label: t('nearby.nearest') },
    { id: 'verified', label: t('nearby.verified') }
  ];

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<string>(searchFilters?.sortValue || 'nearest');

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      let query = supabase.from('stations').select('*').limit(50);

      if (searchFilters?.selectedBrands && searchFilters.selectedBrands.length > 0) {
        query = query.in('brand', searchFilters.selectedBrands);
      }

      if (searchFilters?.query && searchFilters.query.trim() !== '') {
        const q = searchFilters.query.toLowerCase();
        // Search in station name or city (location is jsonb)
        query = query.or(`name.ilike.%${q}%,location->>city.ilike.%${q}%,location->>address.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (data && !error) {
        let filteredData = data;

        if (searchFilters?.selectedAmenities && searchFilters.selectedAmenities.length > 0) {
          filteredData = filteredData.filter((s: any) =>
            searchFilters.selectedAmenities!.every(a => s.amenities?.includes(a))
          );
        }

        if (searchFilters?.selectedFuel) {
          filteredData = filteredData.filter((s: any) => s.prices && s.prices[searchFilters.selectedFuel as keyof typeof s.prices]);
        }

        if (userLocation) {
          filteredData = filteredData.map((s: any) => ({
            ...s,
            calculatedDistance: calculateDistance(userLocation.lat, userLocation.lng, s.location.lat, s.location.lng)
          }));
        }

        setStations(filteredData as Station[]);
      }
      setLoading(false);
    };
    fetchStations();
  }, []);

  const sortedStations = useMemo(() => {
    let result = [...stations];
    const fuelType = searchFilters?.selectedFuel as keyof Station['prices'] || 'Diesel';

    if (activeSort === 'cheapest') {
      result.sort((a, b) => {
        const priceA = a.prices && a.prices[fuelType] ? a.prices[fuelType]! : 999;
        const priceB = b.prices && b.prices[fuelType] ? b.prices[fuelType]! : 999;
        return priceA - priceB;
      });
    } else if (activeSort === 'nearest') {
      result.sort((a: any, b: any) => {
        const distA = a.calculatedDistance || 999;
        const distB = b.calculatedDistance || 999;
        return distA - distB;
      });
    } else if (activeSort === 'verified') {
      // Simplistic sort by last updated string or placeholder
      result.sort((a, b) => {
        const ta = a.lastUpdated === 'Just now' ? 0 : 1;
        const tb = b.lastUpdated === 'Just now' ? 0 : 1;
        return ta - tb;
      });
    }
    return result;
  }, [stations, activeSort, searchFilters]);

  const bestPrice = useMemo(() => {
    if (sortedStations.length === 0) return null;
    const fuelType = searchFilters?.selectedFuel as keyof Station['prices'] || 'Diesel';
    let minPrice: number | null = null;

    sortedStations.forEach(s => {
      if (s.prices && s.prices[fuelType]) {
        if (minPrice === null || s.prices[fuelType]! < minPrice) {
          minPrice = s.prices[fuelType]!;
        }
      }
    });
    return minPrice;
  }, [sortedStations, searchFilters]);

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fadeIn">
      <header className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-md pt-12 pb-4 px-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white">{displayTitle}</h1>
          <button onClick={onBack} className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 transition-all">
            <span className="material-symbols-outlined text-primary text-[20px]">map</span>
            <span className="text-xs font-bold text-primary">{t('nearby.map')}</span>
          </button>
        </div>

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
            <span className="material-symbols-outlined">search</span>
          </span>
          <input
            className="w-full bg-surface-dark border-none rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50"
            placeholder={displayPlaceholder}
            defaultValue={initialSearch}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {sortOptions.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => setActiveSort(opt.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold border transition-all ${activeSort === opt.id ? 'bg-primary border-primary text-background-dark shadow-primary/20 shadow-lg' : 'bg-surface-dark border-white/10 text-slate-300'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">{opt.id === 'cheapest' ? 'attach_money' : opt.id === 'nearest' ? 'near_me' : opt.id === 'verified' ? 'verified' : 'local_gas_station'}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-24 no-scrollbar">
        {loading ? (
          <div className="flex justify-center p-8"><div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : sortedStations.length === 0 ? (
          <div className="text-center text-slate-400 p-8">{t('nearby.noStationsFound') || 'No stations found'}</div>
        ) : (
          sortedStations.map((s) => {
            const fuelType = searchFilters?.selectedFuel as keyof typeof s.prices || 'Diesel';
            const price = s.prices ? s.prices[fuelType] : null;
            const isBest = price !== null && bestPrice !== null && price <= bestPrice;

            return (
              <div
                key={s.id}
                onClick={() => onStationSelect(s)}
                className={`relative group bg-surface-dark rounded-2xl p-5 border transition-all active:scale-[0.98] cursor-pointer ${isBest ? 'border-primary/40 shadow-xl shadow-primary/5' : 'border-white/5'
                  }`}
              >
                {isBest && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-primary/20 text-primary px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border border-primary/20">
                    <span className="material-symbols-outlined text-[12px] fill-1">stars</span>
                    {t('nearby.bestPrice')}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="relative size-14 shrink-0 rounded-xl bg-white p-2 flex items-center justify-center shadow-inner">
                    <span className="text-slate-800 font-black text-xs uppercase">{s.brand.substring(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-lg font-bold text-white truncate pr-16 leading-tight">{s.name}</h3>
                    <p className="text-slate-500 text-xs truncate mb-4">{s.location.address}, {s.location.city}</p>

                    <div className="flex items-baseline justify-between border-t border-white/5 pt-4 mt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                          <span className="material-symbols-outlined text-[16px]">distance</span>
                          {(s as any).calculatedDistance ? `${(s as any).calculatedDistance.toFixed(1)} km` : s.distance}
                        </div>
                        <div className="flex items-center gap-1 text-primary text-xs font-black">
                          <span className="material-symbols-outlined text-[16px] fill-1">verified</span>
                          {s.lastUpdated || '2h'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl font-black text-primary leading-none tracking-tight">
                          {price || '--'} <span className="text-xs font-bold">DH</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};