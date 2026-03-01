import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FuelType, Station } from '../types';
import { fetchStationsInBounds } from '../services/placesService';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../i18n/LanguageContext';
import { calculateDistance } from '../utils/distance';

interface MapExplorerProps {
  onStationSelect: (station: Station) => void;
  hideBottomCard?: boolean;
  onViewList?: () => void;
  onAddStationInitiated: (location: { lat: number, lng: number }) => void;
  refreshKey?: number;
  userLocation?: { lat: number, lng: number } | null;
  selectedStation?: Station | null;
}

const BoundsTracker: React.FC<{ onBoundsChange: (bounds: L.LatLngBounds, center: L.LatLng) => void }> = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds(), map.getCenter()),
    zoomend: () => onBoundsChange(map.getBounds(), map.getCenter()),
  });

  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (isInitialLoad.current) {
      onBoundsChange(map.getBounds(), map.getCenter());
      isInitialLoad.current = false;
    }
  }, [map, onBoundsChange]);

  return null;
};

const MapController: React.FC<{ targetCenter: L.LatLng | null; targetZoom?: number | null }> = ({ targetCenter, targetZoom }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, targetZoom || map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [targetCenter, targetZoom, map]);
  return null;
};

export const MapExplorer: React.FC<MapExplorerProps> = ({ onStationSelect, hideBottomCard, onViewList, onAddStationInitiated, refreshKey, userLocation, selectedStation }) => {
  const { t } = useLanguage();
  const [activeFuel, setActiveFuel] = useState<FuelType>('Diesel');
  const [isBottomCardExpanded, setIsBottomCardExpanded] = useState(false);
  const [isDroppingPin, setIsDroppingPin] = useState(false);

  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [mapCenter, setMapCenter] = useState<L.LatLng>(new L.LatLng(33.5890, -7.6310));

  const [searchQuery, setSearchQuery] = useState('');
  const [targetCenter, setTargetCenter] = useState<L.LatLng | null>(null);
  const [targetZoom, setTargetZoom] = useState<number | null>(null);

  const [touchStart, setTouchStart] = useState(0);
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [destination, setDestination] = useState('');

  const [dbStations, setDbStations] = useState<Station[]>([]);
  const [dynamicStations, setDynamicStations] = useState<Station[]>([]);
  const [isLoadingArea, setIsLoadingArea] = useState(false);
  const [hasCenteredUser, setHasCenteredUser] = useState(false);

  // Center on user location once when acquired
  useEffect(() => {
    if (userLocation && !hasCenteredUser && !selectedStation) {
      setTargetCenter(new L.LatLng(userLocation.lat, userLocation.lng));
      setTargetZoom(14); // Good initial zoom
      setHasCenteredUser(true);
    }
  }, [userLocation, hasCenteredUser, selectedStation]);

  // Listen for externally selected stations (e.g. from Search)
  useEffect(() => {
    if (selectedStation?.location) {
      setTargetCenter(new L.LatLng(selectedStation.location.lat, selectedStation.location.lng));
      setTargetZoom(16); // Close up zoom
    }
  }, [selectedStation]);

  const fuelTypes: { id: FuelType; label: string }[] = [
    { id: 'Diesel', label: t('station.diesel') },
    { id: 'Sans Plomb', label: t('station.sansPlomb') },
    { id: 'Premium', label: t('station.premium') }
  ];

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds, center: L.LatLng) => {
    setMapBounds(bounds);
    setMapCenter(center);
  }, []);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchPredictions = useCallback(
    L.Util.throttle(async (input: string) => {
      if (!input.trim() || !window.google || !window.google.maps || !window.google.maps.places) return;

      try {
        const places = window.google.maps.places as any;

        // Try the modern AutocompleteSuggestion API first
        if (places.AutocompleteSuggestion) {
          try {
            const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input,
              includedRegionCodes: ['ma'],
              language: 'fr'
            });

            if (suggestions && suggestions.length > 0) {
              setSearchResults(suggestions.map((s: any) => ({
                place_id: s.placePrediction.placeId,
                description: s.placePrediction.text.text,
                structured_formatting: {
                  main_text: s.placePrediction.text.text.split(',')[0],
                  secondary_text: s.placePrediction.text.text.split(',').slice(1).join(',').trim()
                }
              })));
              return;
            }
          } catch (modernErr) {
            // Silently swallow and fall back to legacy
            console.warn("Modern Places API failed, falling back to legacy:", modernErr);
          }
        }

        // Fallback to the stable legacy AutocompleteService
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input,
            componentRestrictions: { country: 'ma' },
            types: ['geocode', 'establishment']
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSearchResults(predictions);
            } else {
              setSearchResults([]);
            }
          }
        );
      } catch (err) {
        console.error("Autocomplete fatal error:", err);
        setSearchResults([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchPredictions(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, fetchPredictions]);

  const handlePlaceSelect = async (placeId: string) => {
    setIsLoadingArea(true);
    setSearchResults([]);
    setIsSearchFocused(false);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const { lat, lng } = results[0].geometry.location;
        const newCenter = new L.LatLng(lat(), lng());
        setTargetCenter(newCenter);
        setTargetZoom(15);
        setSearchQuery(results[0].formatted_address);
      }
      setIsLoadingArea(false);
    });
  };

  const MapEventsHandler = () => {
    useMapEvents({
      click: () => {
        setIsSearchFocused(false);
        setSearchResults([]);
      },
      movestart: () => {
        if (isSearchFocused) {
          setIsSearchFocused(false);
          setSearchResults([]);
        }
      }
    });
    return null;
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handlePlaceSelect(searchResults[0].place_id);
    }
  };

  const boundsKey = mapBounds ? `${mapBounds.getSouth().toFixed(4)},${mapBounds.getWest().toFixed(4)},${mapBounds.getNorth().toFixed(4)},${mapBounds.getEast().toFixed(4)}` : null;

  // Fetch stations from Supabase and OSM based on map bounds
  useEffect(() => {
    const loadArea = async () => {
      if (!mapBounds) return;

      setIsLoadingArea(true);
      const boundsData = {
        south: mapBounds.getSouth(),
        west: mapBounds.getWest(),
        north: mapBounds.getNorth(),
        east: mapBounds.getEast(),
      };

      try {
        // 1. Fetch Verified Stations from Supabase using spatial RPC
        const { data: supabaseStations, error: rpcError } = await supabase.rpc('get_stations_in_bounds', {
          min_lat: boundsData.south,
          max_lat: boundsData.north,
          min_lng: boundsData.west,
          max_lng: boundsData.east
        });

        if (!rpcError && supabaseStations) {
          setDbStations(supabaseStations as Station[]);
        }

        // 2. Fetch "Ghost" Stations from OSM
        const importedStations = await fetchStationsInBounds(boundsData);

        // Filter out OSM stations that are already in our DB
        const dbIds = new Set((supabaseStations || []).map((s: any) => s.id));
        const newStations = importedStations.filter(s => !dbIds.has(s.id));

        setDynamicStations(newStations);
      } catch (err) {
        console.error('Error loading area stations:', err);
      } finally {
        setIsLoadingArea(false);
      }
    };

    const debounceTimer = setTimeout(loadArea, 700);
    return () => clearTimeout(debounceTimer);
  }, [boundsKey]);

  const displayedStations = useMemo(() => {
    // Filter out dynamic stations that are too close (e.g., within 50 meters) to any dbStation
    const filteredDynamic = dynamicStations.filter(dyn => {
      // Return true if NO dbStation is within 50m
      return !dbStations.some(db => {
        const dist = calculateDistance(dyn.location.lat, dyn.location.lng, db.location.lat, db.location.lng);
        return dist < 50; // 50 meters threshold
      });
    });
    return [...dbStations, ...filteredDynamic];
  }, [dbStations, dynamicStations]);

  const cheapestNearby = useMemo(() => {
    const realStations = displayedStations.filter(s => !s.isGhost && s.prices[activeFuel]);
    if (realStations.length === 0) return null;
    return [...realStations].sort((a, b) => (a.prices[activeFuel] || 99) - (b.prices[activeFuel] || 99))[0];
  }, [activeFuel, displayedStations]);

  const openWaze = (lat: number, lng: number) => {
    window.open(`waze://?ll=${lat},${lng}&navigate=yes`, '_blank');
  };

  const confirmPinDrop = () => {
    setIsDroppingPin(false);
    onAddStationInitiated({ lat: mapCenter.lat, lng: mapCenter.lng });
  };

  const handleCardTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientY);
  const handleCardTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStart;
    if (delta < -30) setIsBottomCardExpanded(true);
    if (delta > 30) setIsBottomCardExpanded(false);
  };

  const createCustomIcon = useCallback((station: Station) => {
    const brandColors: Record<string, string> = {
      'Afriquia': '#1A6B3C', 'Shell': '#FBDB0C', 'TotalEnergies': '#ED1C24',
      'Petrom': '#1A5276', 'Ola Energy': '#003399', 'Winxo': '#913bb1'
    };

    if (station.isGhost) {
      const bgColor = brandColors[station.brand] || '#475569';
      const textColor = station.brand === 'Shell' ? '#000' : '#fff';
      const displayName = station.brand === 'Other' ? 'Station' : station.brand;

      const iconHTML = renderToStaticMarkup(
        <div className="relative flex flex-col items-center group hover:z-[100] transition-all">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[10px] shadow-lg border border-white/5 bg-surface-dark/95 backdrop-blur-md z-10 whitespace-nowrap">
            <div
              className="w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] font-black shadow-sm"
              style={{ backgroundColor: bgColor, color: textColor }}
            >
              {station.brand.charAt(0)}
            </div>
            <span className="text-[10px] font-bold text-slate-300 truncate max-w-[60px]">{displayName}</span>
            <div className="w-px h-2.5 bg-white/10 mx-0.5"></div>
            <span className="material-symbols-outlined text-[13px] text-slate-400">add_circle</span>
          </div>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-surface-dark/95 -mt-[1px]" />
        </div>
      );
      return L.divIcon({ html: iconHTML, className: 'custom-modern-pin', iconSize: [100, 30], iconAnchor: [50, 30] });
    }

    const price = station.prices[activeFuel];
    if (!price) return null;

    const allPrices = displayedStations.filter(s => !s.isGhost).map(s => s.prices[activeFuel]).filter(Boolean) as number[];
    const isCheapest = price === Math.min(...allPrices);

    const iconHTML = renderToStaticMarkup(
      <div className="relative flex flex-col items-center">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-2xl border transition-all duration-300 ${isCheapest ? 'bg-primary border-white text-background-dark scale-110 z-50 ring-4 ring-primary/20' : 'bg-surface-dark border-white/10 text-white z-10'}`}>
          <div className="w-4 h-4 rounded-lg flex items-center justify-center text-[7px] font-black shadow-sm" style={{ backgroundColor: brandColors[station.brand] || '#64748b', color: station.brand === 'Shell' ? '#000' : '#fff' }}>
            {station.brand.charAt(0)}
          </div>
          <span className="text-[13px] font-black tracking-tighter">{price.toFixed(2)}</span>
        </div>
        <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] -mt-[1px] ${isCheapest ? 'border-t-primary' : 'border-t-surface-dark'}`} />
      </div>
    );

    return L.divIcon({ html: iconHTML, className: 'custom-modern-pin', iconSize: [70, 40], iconAnchor: [35, 40] });
  }, [activeFuel, displayedStations]);

  return (
    <div className="relative h-full w-full bg-background-dark select-none overflow-hidden">

      {!isDroppingPin && (
        <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pt-6 space-y-2 pointer-events-none animate-fadeIn">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex-1 bg-surface-darker/90 backdrop-blur-xl rounded-2xl flex flex-col px-4 py-2 shadow-2xl border border-white/5 ring-1 ring-white/10 transition-all">

              <div className="flex items-center gap-2 h-10">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {isRouteMode ? 'my_location' : 'search'}
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={isRouteMode ? t('map.startLocation') : t('map.searchPlaceholder')}
                  disabled={isRouteMode}
                  className="bg-transparent border-none outline-none flex-1 text-xs font-bold text-white placeholder:text-slate-500 focus:ring-0 truncate disabled:opacity-50"
                />

                {/* Google Places Results Dropdown */}
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface-darker/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up z-[2000] pointer-events-auto">
                    {searchResults.map((res, i) => (
                      <button
                        key={res.place_id}
                        onClick={() => handlePlaceSelect(res.place_id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-primary/20 ${i !== searchResults.length - 1 ? 'border-b border-white/5' : ''}`}
                      >
                        <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined text-lg">location_on</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{res.structured_formatting.main_text}</p>
                          <p className="text-[9px] text-slate-500 truncate">{res.structured_formatting.secondary_text}</p>
                        </div>
                      </button>
                    ))}
                    <div className="px-4 py-2 bg-black/20 flex justify-end">
                      <img src="https://developers.google.com/static/maps/images/google_on_white.png" alt="Powered by Google" className="h-2 opacity-50 inverse" />
                    </div>
                  </div>
                )}

                {isLoadingArea && (
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}

                {!isRouteMode && !isLoadingArea && (
                  <button onClick={() => setIsRouteMode(true)} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">route</span> {t('map.route')}
                  </button>
                )}
                {isRouteMode && (
                  <button onClick={() => setIsRouteMode(false)} className="text-slate-400">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>

              {isRouteMode && (
                <div className="flex items-center gap-2 h-10 border-t border-white/10 mt-1 pt-1 animate-slide-up">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">location_on</span>
                  <input
                    type="text"
                    placeholder={t('map.whereTo')}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-xs font-bold text-white placeholder:text-slate-500 focus:ring-0"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto mt-2">
            {fuelTypes.map(ft => (
              <button key={ft.id} onClick={() => setActiveFuel(ft.id)} className={`flex-shrink-0 h-8 px-5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 border ${activeFuel === ft.id ? 'bg-primary text-background-dark border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-surface-darker/80 backdrop-blur-md text-slate-400 border-white/5'}`}>
                {ft.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isDroppingPin && (
        <div className={`absolute right-4 z-[1000] flex flex-col gap-3 pointer-events-auto transition-all duration-300 ${hideBottomCard ? 'top-40' : 'top-[50%] -translate-y-1/2'}`}>
          <button className="size-12 bg-surface-darker/90 backdrop-blur-xl rounded-[1.25rem] shadow-2xl flex items-center justify-center text-primary border border-white/5 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[26px]">my_location</span>
          </button>
          <button onClick={() => setIsDroppingPin(true)} className="size-12 bg-accent-gold/90 backdrop-blur-xl rounded-[1.25rem] shadow-[0_10px_30px_rgba(251,191,36,0.3)] flex items-center justify-center text-background-dark border border-accent-gold active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[26px]">add_location_alt</span>
          </button>
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <MapContainer center={[33.5890, -7.6310]} zoom={14} zoomControl={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController targetCenter={targetCenter} targetZoom={targetZoom} />
          <MapEventsHandler />

          <BoundsTracker onBoundsChange={handleBoundsChange} />

          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                html: renderToStaticMarkup(
                  <div className="relative flex items-center justify-center">
                    <div className="absolute size-8 bg-blue-500/20 rounded-full animate-ping"></div>
                    <div className="size-4 bg-blue-500 border-2 border-white rounded-full shadow-lg z-10"></div>
                  </div>
                ),
                className: 'user-location-pin',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })}
            />
          )}

          {!isDroppingPin && displayedStations.map(station => {
            const icon = createCustomIcon(station);
            if (!icon) return null;
            return <Marker key={station.id} position={[station.location.lat, station.location.lng]} icon={icon} eventHandlers={{ click: () => onStationSelect(station) }} />;
          })}
        </MapContainer>
      </div>

      {isDroppingPin && (
        <div className="absolute inset-0 z-[2000] pointer-events-none flex flex-col items-center justify-center animate-fadeIn">
          <div className="bg-background-dark/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-lg border border-white/10">
            {t('map.dragPin')}
          </div>
          <div className="size-12 -mt-16 text-accent-gold drop-shadow-[0_10px_20px_rgba(251,191,36,0.5)] animate-bounce-slight flex items-end justify-center">
            <span className="material-symbols-outlined text-[56px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          </div>
          <div className="w-4 h-1.5 bg-black/40 rounded-[100%] blur-[1px] mt-1" />
          <div className="absolute bottom-8 left-6 right-6 pointer-events-auto">
            <div className="flex gap-3">
              <button onClick={() => setIsDroppingPin(false)} className="size-16 bg-surface-dark text-white rounded-[2rem] shadow-xl border border-white/10 flex items-center justify-center active:scale-95 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
              <button onClick={confirmPinDrop} className="flex-1 h-16 bg-accent-gold text-background-dark font-black text-lg rounded-[2rem] shadow-[0_15px_30px_rgba(251,191,36,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest">
                {t('map.confirmLocation')}
              </button>
            </div>
          </div>
        </div>
      )}

      {!hideBottomCard && !isDroppingPin && cheapestNearby && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none animate-slide-up">
          <div
            onTouchStart={handleCardTouchStart}
            onTouchEnd={handleCardTouchEnd}
            onClick={(e) => {
              if (!isBottomCardExpanded && (e.target as HTMLElement).tagName !== 'BUTTON') {
                setIsBottomCardExpanded(true);
              }
            }}
            className={`bg-surface-darker/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto transition-all duration-500 ease-in-out overflow-hidden ${isBottomCardExpanded ? 'max-h-[320px]' : 'max-h-[92px]'} cursor-pointer`}
          >
            <button onClick={() => setIsBottomCardExpanded(!isBottomCardExpanded)} className="w-full h-6 flex items-center justify-center">
              <div className="w-10 h-1 bg-white/10 rounded-full" />
            </button>
            <div className="px-6 pb-6 pt-0">
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary border border-primary/10">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                      {isRouteMode ? t('map.cheapestRoute') : t('map.cheapestNearby')}
                    </p>
                    <h3 className="text-base font-black text-white truncate max-w-[160px] leading-tight mt-0.5">{cheapestNearby.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary tracking-tighter leading-none">{cheapestNearby.prices[activeFuel]?.toFixed(2)}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <span className="text-[10px] font-black text-slate-500">{t('map.madL')}</span>
                  </div>
                </div>
              </div>

              {isBottomCardExpanded && (
                <div className="mt-8 space-y-6 animate-fadeIn">
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-center justify-around text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">near_me</span> {cheapestNearby.distance}</span>
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">timer</span> 4 {t('map.mins')}</span>
                    <span className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${Date.now() - cheapestNearby.lastUpdatedTimestamp > 86400000 ? 'text-slate-500' : 'text-primary'}`}>verified</span>
                      {cheapestNearby.lastUpdated?.toUpperCase() || ''}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); openWaze(cheapestNearby.location.lat, cheapestNearby.location.lng); }} className="flex-1 h-16 bg-blue-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                      <img src="https://cdn.simpleicons.org/waze/ffffff" alt="Waze" className="h-6 w-6" /> {t('map.startJourney')}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onStationSelect(cheapestNearby); }} className="size-16 bg-white/5 text-white rounded-2xl flex items-center justify-center active:scale-95 border border-white/5">
                      <span className="material-symbols-outlined text-[24px]">info</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};