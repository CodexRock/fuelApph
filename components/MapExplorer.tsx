import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FuelType, Station } from '../types';
import { fetchStationsInBounds } from '../services/placesService';
import { getShortBrand, getTimeAgo, isValidStation } from '../utils/brands';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { calculateDistance } from '../utils/distance';
import { MoroccoRestrictionModal } from './MoroccoRestrictionModal';
import { isInsideMorocco } from '../utils/location';
import { syncNewStations } from '../services/stationSyncService';
import { mapStation } from '../services/stationService';

interface MapExplorerProps {
  onStationSelect: (station: Station) => void;
  hideBottomCard?: boolean;
  onViewList?: () => void;
  onAddStationInitiated: (location: { lat: number, lng: number }) => void;
  refreshKey?: number;
  userLocation?: { lat: number, lng: number } | null;
  selectedStation?: Station | null;
}

interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  source: 'google' | 'osm';
  lat?: number;
  lng?: number;
}

interface SearchedPlace {
  name: string;
  address: string;
  lat: number;
  lng: number;
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

// Constant light mode map tile layer (standard OSM tiles)
const ThemeAwareTileLayer: React.FC = () => {
  const lightUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url={lightUrl}
    />
  );
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
  const [dropPinPosition, setDropPinPosition] = useState<L.LatLng | null>(null);
  const [addingStationLocation, setAddingStationLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [showMoroccoAlert, setShowMoroccoAlert] = useState(false);

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

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchedPlace, setSearchedPlace] = useState<SearchedPlace | null>(null);

  // Load Google Maps API via Official Bootstrap Loader (Required for Places API New / $rpc)
  useEffect(() => {
    const rawKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!rawKey) return;

    // Clean any accidental quotes or whitespace from the .env file
    const cleanKey = rawKey.trim().replace(/['"]/g, '');

    // Failsafe Warning: API Keys should start with 'AIza'
    if (!cleanKey.startsWith('AIza')) {
      console.error("🚨 FUELSPY WARNING: Your VITE_GOOGLE_MAPS_API_KEY does not start with 'AIza'. It looks invalid. Please check your .env.local file to ensure there are no comments on the same line.");
    }

    if (window.google?.maps?.importLibrary) return;

    // Official Bootstrap Loader
    ((g: any) => {
      var h: any, a: any, k: any, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b: any = window;
      b = b[c] || (b[c] = {});
      var d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(), u = () => h || (h = new Promise(async (f, n) => {
        await (a = m.createElement("script"));
        e.set("libraries", [...r].join(","));
        for (k in g) e.set(k.replace(/[A-Z]/g, (t: string) => "_" + t[0].toLowerCase()), g[k]);
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => h = n(Error(p + " could not load."));
        a.nonce = m.querySelector("script[nonce]")?.getAttribute("nonce") || "";
        m.head.append(a);
      }));
      d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f: any, ...n: any) => r.add(f) && u().then(() => d[l](f, ...n))
    })({
      key: cleanKey,
      v: "weekly",
    });

    // Pre-initialize Places Library
    if (window.google?.maps?.importLibrary) {
      window.google.maps.importLibrary("places").catch(console.error);
    }
  }, []);

  // Center on user location once when acquired
  useEffect(() => {
    if (userLocation && !hasCenteredUser && !selectedStation) {
      setTargetCenter(new L.LatLng(userLocation.lat, userLocation.lng));
      setTargetZoom(14);
      setHasCenteredUser(true);
    }
  }, [userLocation, hasCenteredUser, selectedStation]);

  // Listen for externally selected stations (e.g. from Search)
  useEffect(() => {
    if (selectedStation?.location) {
      setTargetCenter(new L.LatLng(selectedStation.location.lat, selectedStation.location.lng));
      setTargetZoom(16);
    }
  }, [selectedStation]);

  const fuelTypes: { id: FuelType; label: string }[] = [
    { id: 'Diesel', label: t('station.diesel') || 'Diesel' },
    { id: 'Sans Plomb', label: t('station.sansPlomb') || 'Sans Plomb' },
    { id: 'Premium', label: t('station.premium') || 'Premium' }
  ];

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds, center: L.LatLng) => {
    setMapBounds(bounds);
    setMapCenter(center);
    if (isDroppingPin) {
      setDropPinPosition(center);
    }
  }, [isDroppingPin]);

  const fetchPredictions = useCallback(
    L.Util.throttle(async (input: string) => {
      if (!input.trim()) return;

      let suggestionsFound = false;

      // 1. Try Google Maps Places API (New) First via importLibrary
      if (window.google?.maps?.importLibrary) {
        try {
          const placesLib = await window.google.maps.importLibrary("places") as any;

          if (placesLib.AutocompleteSuggestion) {
            const { suggestions } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input,
              includedRegionCodes: ['MA'], // MUST be uppercase per Google CLDR spec
              language: 'fr'
            });

            if (suggestions && suggestions.length > 0) {
              setSearchResults(suggestions.map((s: any) => ({
                place_id: s.placePrediction.placeId,
                description: s.placePrediction.text.text,
                structured_formatting: {
                  main_text: s.placePrediction.text.text.split(',')[0],
                  secondary_text: s.placePrediction.text.text.split(',').slice(1).join(',').trim()
                },
                source: 'google'
              })));
              suggestionsFound = true;
            }
          }
        } catch (err) {
          console.warn("Google Places API error (likely backend $rpc rejection). Gracefully falling back to OSM...", err);
        }
      }

      // 2. Fallback to OpenStreetMap (Nominatim) if Google fails (e.g. $rpc rejection, billing error)
      if (!suggestionsFound) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&countrycodes=ma&format=json&limit=5`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setSearchResults(data.map((item: any) => ({
                place_id: item.place_id.toString(),
                description: item.display_name,
                structured_formatting: {
                  main_text: item.name || item.display_name.split(',')[0],
                  secondary_text: item.display_name.split(',').slice(1).join(',').trim()
                },
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                source: 'osm'
              })));
            } else {
              setSearchResults([]);
            }
          }
        } catch (err) {
          console.error("OSM Nominatim API failed:", err);
          setSearchResults([]);
        }
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchPredictions(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, fetchPredictions]);

  const handlePlaceSelect = async (result: SearchResult) => {
    setIsLoadingArea(true);
    setSearchResults([]);
    setIsSearchFocused(false);

    try {
      if (result.source === 'osm' && result.lat && result.lng) {
        const newCenter = new L.LatLng(result.lat, result.lng);
        setTargetCenter(newCenter);
        setTargetZoom(16);
        setSearchQuery(result.structured_formatting.main_text);
        setSearchedPlace({
          name: result.structured_formatting.main_text,
          address: result.description,
          lat: result.lat,
          lng: result.lng
        });
      } else if (window.google?.maps?.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ placeId: result.place_id }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const { lat, lng } = results[0].geometry.location;
            const newCenter = new L.LatLng(lat(), lng());
            setTargetCenter(newCenter);
            setTargetZoom(16);
            setSearchQuery(result.structured_formatting.main_text);
            setSearchedPlace({
              name: result.structured_formatting.main_text,
              address: results[0].formatted_address,
              lat: lat(),
              lng: lng()
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingArea(false);
    }
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
      handlePlaceSelect(searchResults[0]);
    }
  };

  const boundsKey = mapBounds ? `${mapBounds.getSouth().toFixed(4)},${mapBounds.getWest().toFixed(4)},${mapBounds.getNorth().toFixed(4)},${mapBounds.getEast().toFixed(4)}` : null;

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
        const { data: supabaseStations, error: rpcError } = await supabase.rpc('get_stations_in_bounds', {
          min_lat: boundsData.south,
          max_lat: boundsData.north,
          min_lng: boundsData.west,
          max_lng: boundsData.east
        });

        if (!rpcError && supabaseStations) {
          setDbStations((supabaseStations as any[]).map(mapStation));
        }

        const importedStations = await fetchStationsInBounds(boundsData);
        const dbIds = new Set((supabaseStations || []).map((s: any) => s.id));
        const newStations = importedStations.filter(s => !dbIds.has(s.id));
        setDynamicStations(newStations);

        // Sync new stations to the database
        if (newStations.length > 0) {
          syncNewStations(importedStations, supabaseStations || []);
        }
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
    const filteredDynamic = dynamicStations.filter(dyn => {
      return !dbStations.some(db => {
        const dist = calculateDistance(dyn.location.lat, dyn.location.lng, db.location.lat, db.location.lng);
        return dist < 50;
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

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const onConfirmPin = () => {
    if (!dropPinPosition) return;

    if (!isInsideMorocco(dropPinPosition.lat, dropPinPosition.lng)) {
      setShowMoroccoAlert(true);
      setIsDroppingPin(false);
      return;
    }

    setAddingStationLocation(dropPinPosition);
    setIsDroppingPin(false);
    setDropPinPosition(null);
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
      'Petrom': '#1A5276', 'Ola Energy': '#003399', 'Winxo': '#913bb1',
      'Ziz': '#D42127', 'Somap': '#0058A8', 'Petromin': '#006837', 'E.Leclerc': '#0066B3'
    };

    if (station.isGhost) {
      const bgColor = brandColors[station.brand] || '#475569';
      const textColor = station.brand === 'Shell' ? '#000' : '#fff';
      const shortBrandName = getShortBrand(station.brand);

      const iconHTML = renderToStaticMarkup(
        <div className="relative flex flex-col items-center group hover:z-[100] transition-all">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 bg-surface-darker/90 backdrop-blur-md z-10 whitespace-nowrap">
            <div
              className="size-4 rounded flex items-center justify-center text-[9px] font-black shadow-sm shrink-0"
              style={{ backgroundColor: bgColor, color: textColor }}
            >
              {station.brand.charAt(0)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{shortBrandName}</span>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <span className="material-symbols-outlined text-[15px] text-primary/80">add_circle</span>
          </div>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-surface-darker/90 -mt-[1px]" />
        </div>
      );
      return L.divIcon({ html: iconHTML, className: 'custom-modern-pin', iconSize: [120, 35], iconAnchor: [60, 35] });
    }

    const price = station.prices[activeFuel];
    if (!price) return null;

    const allPrices = displayedStations.filter(s => !s.isGhost).map(s => s.prices[activeFuel]).filter(Boolean) as number[];
    const isCheapest = price === Math.min(...allPrices);

    const shortBrand = getShortBrand(station.brand);
    const timeAgo = getTimeAgo(station.lastUpdatedTimestamp);

    const iconHTML = renderToStaticMarkup(
      <div className="relative flex flex-col items-center group">
        <div className={`flex items-stretch min-w-[85px] rounded-xl shadow-2xl border transition-all duration-500 overflow-hidden ${isCheapest ? 'bg-primary border-white scale-110 z-50 ring-4 ring-primary/30' : 'bg-surface-darker/95 border-white/10 text-white z-10'}`}>
          {/* Brand Accent Bar */}
          <div
            className="w-1.5 shrink-0"
            style={{ backgroundColor: brandColors[station.brand] || '#475569' }}
          />

          <div className="flex-1 flex flex-col justify-center px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className={`text-[8px] font-black uppercase tracking-[0.1em] truncate ${isCheapest ? 'text-background-dark/80' : 'text-slate-400'}`}>
                {shortBrand}
              </span>
              {timeAgo === 'NEW' && (
                <div className="bg-accent-gold px-1 rounded-[3px] shadow-sm animate-pulse">
                  <span className="text-background-dark text-[7px] font-black italic">NEW</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-1.5 leading-none">
              <span className={`text-[16px] font-black tracking-tighter tabular-nums ${isCheapest ? 'text-background-dark' : 'text-white'}`}>
                {price.toFixed(2)}
              </span>
              {timeAgo !== 'NEW' && (
                <span className={`text-[7px] font-black opacity-60 uppercase ${isCheapest ? 'text-background-dark' : 'text-slate-500'}`}>
                  {timeAgo}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] -mt-[1px] ${isCheapest ? 'border-t-white' : 'border-t-surface-darker/95'}`} />
      </div>
    );

    return L.divIcon({ html: iconHTML, className: 'price-pin-modern', iconSize: [90, 45], iconAnchor: [45, 45] });
  }, [activeFuel, displayedStations]);

  useEffect(() => {
    if (addingStationLocation) {
      onAddStationInitiated(addingStationLocation);
      setAddingStationLocation(null); // Reset after initiating
    }
  }, [addingStationLocation, onAddStationInitiated]);

  return (
    <div className="relative h-full w-full bg-background-dark select-none overflow-hidden">

      {!isDroppingPin && (
        <div className="absolute top-0 left-0 right-0 z-[2000] p-4 pt-6 space-y-2 pointer-events-none animate-fadeIn">
          <div className="relative flex items-center gap-2 pointer-events-auto z-50">
            <div className="flex-1 bg-surface-darker/90 backdrop-blur-xl rounded-2xl flex flex-col px-4 py-2 shadow-2xl border border-white/5 ring-1 ring-white/10 transition-all">

              <div className="flex items-center gap-2 h-10">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {isRouteMode ? 'my_location' : 'search'}
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value === '') {
                      setSearchedPlace(null);
                      setSearchResults([]);
                    }
                  }}
                  onKeyDown={handleSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={isRouteMode ? (t('map.startLocation') || 'Start location') : (t('map.searchPlaceholder') || 'Search location')}
                  disabled={isRouteMode}
                  className="bg-transparent border-none outline-none flex-1 text-xs font-bold text-white placeholder:text-slate-500 focus:ring-0 truncate disabled:opacity-50"
                />

                {searchQuery && !isRouteMode && (
                  <button onClick={() => { setSearchQuery(''); setSearchedPlace(null); setSearchResults([]); }} className="text-slate-400 mr-1 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}

                {/* Search Results Dropdown */}
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface-darker/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up z-[2000] pointer-events-auto">
                    {searchResults.map((res, i) => (
                      <button
                        key={res.place_id}
                        onClick={() => handlePlaceSelect(res)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 active:bg-primary/20 ${i !== searchResults.length - 1 ? 'border-b border-white/5' : ''}`}
                      >
                        <div className={`size-8 rounded-lg flex items-center justify-center text-slate-400 ${res.source === 'google' ? 'bg-white/5' : 'bg-primary/10 text-primary'}`}>
                          <span className="material-symbols-outlined text-lg">location_on</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{res.structured_formatting.main_text}</p>
                          <p className="text-[9px] text-slate-500 truncate">{res.structured_formatting.secondary_text}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {isLoadingArea && (
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}

                {!isRouteMode && !isLoadingArea && (
                  <button onClick={() => setIsRouteMode(true)} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">route</span> {t('map.route') || 'Route'}
                  </button>
                )}
                {isRouteMode && (
                  <button onClick={() => setIsRouteMode(false)} className="text-slate-400">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>

              {isRouteMode && (
                <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-white/10 animate-slide-up">
                  <div className="flex items-center gap-2 h-10">
                    <span className="material-symbols-outlined text-red-500 text-[20px]">location_on</span>
                    <input
                      type="text"
                      placeholder={t('map.whereTo') || 'Where to?'}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="bg-transparent border-none outline-none flex-1 text-xs font-bold text-white placeholder:text-slate-500 focus:ring-0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const originParams = searchQuery ? `&origin=${encodeURIComponent(searchQuery)}` : '';
                        const destParams = `&destination=${encodeURIComponent(destination || 'Morocco')}`;
                        window.open(`https://www.google.com/maps/dir/?api=1${originParams}${destParams}`, '_blank');
                      }}
                      disabled={!destination && !searchQuery}
                      className="flex-1 h-10 bg-surface-dark rounded-xl flex items-center justify-center gap-2 border border-white/5 active:scale-95 transition-all text-xs font-bold text-slate-300 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">map</span> Google Maps
                    </button>
                    <button
                      onClick={() => {
                        const q = encodeURIComponent(destination || searchQuery || 'Morocco');
                        window.open(`waze://?q=${q}&navigate=yes`, '_blank');
                      }}
                      disabled={!destination && !searchQuery}
                      className="flex-1 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center gap-2 border border-blue-500/20 active:scale-95 transition-all text-xs font-bold disabled:opacity-50"
                    >
                      <img src="https://cdn.simpleicons.org/waze/60a5fa" alt="Waze" className="h-4 w-4" /> Waze
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto mt-2 z-10">
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
          <button onClick={() => {
            if (userLocation) {
              setTargetCenter(new L.LatLng(userLocation.lat, userLocation.lng));
              setTargetZoom(16);
            } else {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setTargetCenter(new L.LatLng(pos.coords.latitude, pos.coords.longitude));
                  setTargetZoom(16);
                }
              );
            }
          }} className="size-12 bg-surface-darker/90 backdrop-blur-xl rounded-[1.25rem] shadow-2xl flex items-center justify-center text-primary border border-white/5 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[26px]">my_location</span>
          </button>
          <button onClick={() => { setIsDroppingPin(true); setDropPinPosition(mapCenter); }} className="size-12 bg-accent-gold/90 backdrop-blur-xl rounded-[1.25rem] shadow-[0_10px_30px_rgba(251,191,36,0.3)] flex items-center justify-center text-background-dark border border-accent-gold active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[26px]">add_location_alt</span>
          </button>
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <MapContainer center={[33.5890, -7.6310]} zoom={14} zoomControl={false} attributionControl={false} className="h-full w-full">
          <ThemeAwareTileLayer />
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

          {/* Searched Location Marker */}
          {searchedPlace && !isDroppingPin && (
            <Marker
              position={[searchedPlace.lat, searchedPlace.lng]}
              icon={L.divIcon({
                html: renderToStaticMarkup(
                  <div className="relative flex flex-col items-center animate-bounce-slight">
                    <div className="flex items-center justify-center size-10 bg-primary rounded-full shadow-[0_10px_20px_rgba(59,130,246,0.5)] border-[3px] border-white z-20">
                      <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    </div>
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-primary -mt-[3px] z-10" />
                  </div>
                ),
                className: 'searched-location-pin',
                iconSize: [40, 50],
                iconAnchor: [20, 50]
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
            {t('map.dragPin') || 'Drag to move'}
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
              <button onClick={onConfirmPin} className="flex-1 h-16 bg-accent-gold text-background-dark font-black text-lg rounded-[2rem] shadow-[0_15px_30px_rgba(251,191,36,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest">
                {t('map.confirmLocation') || 'Confirm Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Searched Location Navigation Card (takes priority if active) */}
      {!hideBottomCard && !isDroppingPin && searchedPlace && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none animate-slide-up">
          <div className="bg-surface-darker/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-primary/30 pointer-events-auto overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Selected Location</span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight mb-1">{searchedPlace.name}</h3>
                  <p className="text-xs font-medium text-slate-400 line-clamp-2">{searchedPlace.address}</p>
                </div>
                <button onClick={() => { setSearchedPlace(null); setSearchQuery(''); }} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button onClick={() => openWaze(searchedPlace.lat, searchedPlace.lng)} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20 shadow-lg active:scale-95">
                  <img src="https://cdn.simpleicons.org/waze/60a5fa" alt="Waze" className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">{t('station.openWaze') || 'Waze'}</span>
                </button>
                <button onClick={() => openGoogleMaps(searchedPlace.lat, searchedPlace.lng)} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-surface-dark/60 text-slate-300 hover:bg-surface-dark transition-colors border border-white/10 shadow-lg active:scale-95">
                  <span className="material-symbols-outlined text-lg">map</span>
                  <span className="text-xs font-black uppercase tracking-widest">{t('station.googleMaps') || 'Google Maps'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standard Cheapest Nearby Card */}
      {!hideBottomCard && !isDroppingPin && !searchedPlace && cheapestNearby && (
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
                      {isRouteMode ? (t('map.cheapestRoute') || 'Cheapest on Route') : (t('map.cheapestNearby') || 'Cheapest Nearby')}
                    </p>
                    <h3 className="text-base font-black text-white truncate max-w-[160px] leading-tight mt-0.5">{cheapestNearby.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary tracking-tighter leading-none">{cheapestNearby.prices[activeFuel]?.toFixed(2)}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <span className="text-[10px] font-black text-slate-500">{t('map.madL') || 'MAD/L'}</span>
                  </div>
                </div>
              </div>

              {isBottomCardExpanded && (
                <div className="mt-8 space-y-6 animate-fadeIn">
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-center justify-around text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">near_me</span> {cheapestNearby.distance}</span>
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">timer</span> 4 {t('map.mins') || 'mins'}</span>
                    <span className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${Date.now() - cheapestNearby.lastUpdatedTimestamp > 86400000 ? 'text-slate-500' : 'text-primary'}`}>verified</span>
                      {cheapestNearby.lastUpdated?.toUpperCase() || ''}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); openWaze(cheapestNearby.location.lat, cheapestNearby.location.lng); }} className="flex-1 h-16 bg-blue-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                      <img src="https://cdn.simpleicons.org/waze/ffffff" alt="Waze" className="h-6 w-6" /> {t('map.startJourney') || 'Start Journey'}
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
      {/* Morocco Restriction Modal */}
      {showMoroccoAlert && (
        <MoroccoRestrictionModal onClose={() => setShowMoroccoAlert(false)} />
      )}
    </div>
  );
};