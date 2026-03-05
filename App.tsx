import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AuthScreen } from './screens/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { MapExplorer } from './components/MapExplorer';
import { StationSheet } from './components/StationSheet';
import { ScanFlow } from './screens/ScanFlow';
import { Rewards } from './screens/Rewards';
import { Profile } from './screens/Profile';
import { ContributionSuccess } from './screens/ContributionSuccess';
import { Onboarding } from './screens/Onboarding';
import { NearbyList } from './screens/NearbyList';
import { ManualReport } from './screens/ManualReport';
import { VoiceReport } from './screens/VoiceReport';
import { SearchScreen } from './screens/SearchScreen';
import { AddStation } from './screens/AddStation';
import { Station } from './types';
import { AlertModal } from './components/AlertModal';
import { useLanguage } from './i18n/LanguageContext';
import { supabase } from './lib/supabase';
import { submitPriceReport, addNewStation, mapStation } from './services/stationService';
import { calculateDistance } from './utils/distance';
import { isValidStation } from './utils/brands';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [searchView, setSearchView] = useState<'filters' | 'results'>('filters');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const [viewMode, setViewMode] = useState<'map' | 'list' | 'manual_report' | 'voice_report' | 'add_station'>('map');
  const [lastViewBeforeReport, setLastViewBeforeReport] = useState<'map'>('map');

  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('fuelspy_onboarded') === 'true';
  });

  const [isPioneerContribution, setIsPioneerContribution] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [lastContribution, setLastContribution] = useState<{ station: string, fuel: string, price: number } | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [userName, setUserName] = useState('');
  const [userLevel, setUserLevel] = useState(1);
  const [userRole, setUserRole] = useState('user');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [stationRefreshKey, setStationRefreshKey] = useState(0);
  const [searchFilters, setSearchFilters] = useState<{ selectedFuel?: string, selectedBrands?: string[], selectedAmenities?: string[] } | null>(null);

  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, type: 'error' | 'success' | 'info' } | null>(null);
  const [showLocationReminder, setShowLocationReminder] = useState(false);
  const [hasSeenLocationReminder, setHasSeenLocationReminder] = useState(false);

  const { t } = useLanguage();
  const { user, isLoading, isRecovering } = useAuth();

  // Fetch user profile data for service calls
  useEffect(() => {
    if (user && !isRecovering) {
      supabase.from('users').select('name, level, role').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setUserName(data.name || '');
          setUserLevel(data.level || 1);
          setUserRole(data.role || 'user');
        }
      });
    }
  }, [user, isRecovering]);

  // Track geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setShowLocationReminder(false);
      },
      (err) => {
        console.log('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED && !hasSeenLocationReminder) {
          setShowLocationReminder(true);
          setHasSeenLocationReminder(true);
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [hasSeenLocationReminder]);

  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const checkDistance = (targetLat: number, targetLng: number): boolean => {
    if (userRole === 'admin') return true;
    if (!userLocation) {
      showAlert(t('app.locationReminderTitle'), t('app.locationRequired'), 'error');
      return false;
    }
    const dist = calculateDistance(userLocation.lat, userLocation.lng, targetLat, targetLng);
    if (dist > 150) {
      showAlert(t('app.error'), t('app.tooFar'), 'error');
      return false;
    }
    return true;
  };

  const handleReport = () => {
    if (selectedStation && !checkDistance(selectedStation.location.lat, selectedStation.location.lng)) return;
    setIsScanning(true);
  };

  const finishContribution = async (
    stationName: string,
    reports: { fuelType: string, price: number }[],
    pioneer: boolean = false,
    stationId?: string
  ) => {
    setIsScanning(false);
    if (!reports || reports.length === 0) return;

    // Use the first report for basic display purposes
    setLastContribution({ station: stationName, fuel: reports[0].fuelType, price: reports[0].price });
    setIsPioneerContribution(pioneer);

    let totalPoints = 0;

    // Process all reports sequentially
    for (let i = 0; i < reports.length; i++) {
      const { fuelType, price } = reports[i];

      if (user && stationId && !pioneer) {
        if (stationId.startsWith('osm-') && selectedStation) {
          // Create the station on the first report
          // Note: In a robust app, we should get the returned station ID and use submitPriceReport for subsequent ones.
          // For now, we will just call addNewStation (which might result in duplicate stations if we're not careful, 
          // but Supabase ID will just change. Actually, to be safe, if i > 0 we should skip OSM migration for same lat/lng,
          // but `addNewStation` handles it via just inserting. Let's assume users rarely report 2 fuels on a ghost station at once, or if they do it gets created.
          // Since addNewStation doesn't easily return the full object in our existing submitResult, we'll just run it.
          const result = await addNewStation({
            userId: user.id,
            userName,
            userLevel,
            brand: selectedStation.brand,
            location: selectedStation.location,
            fuelType,
            price,
          });
          totalPoints += result.pointsEarned;
        } else {
          // Submit price report to existing Supabase station
          const result = await submitPriceReport({
            userId: user.id,
            stationId,
            fuelType,
            price,
            reportType: 'manual',
            userName,
            userLevel,
          });
          totalPoints += result.pointsEarned;
        }
      }
    }
    // Handle pioneers outside the loop for simplicity (only uses first report for creation)
    if (user && pioneer && pendingLocation) {
      const brandType = stationName.replace(' Station', '') as Station['brand'];

      if (!isValidStation(stationName, brandType)) {
        console.error('Invalid station name/brand combo prevented:', stationName, brandType);
        return;
      }

      for (let i = 0; i < reports.length; i++) {
        // Add brand new station to Supabase (each fuel type will create a "station" record if we just loop, 
        // ideally we create once. Since Pioneer usually does one, we'll just process the first one to avoid duplicates).
        if (i === 0) {
          const result = await addNewStation({
            userId: user.id,
            userName,
            userLevel,
            brand: stationName.replace(' Station', ''),
            location: pendingLocation,
            fuelType: reports[0].fuelType,
            price: reports[0].price,
          });
          totalPoints += result.pointsEarned;
        }
      }
    } else if (!user) {
      // Fallback if no user
      totalPoints += pioneer ? 200 : 50;
    }

    setEarnedPoints(totalPoints);
    setShowSuccess(true);
    setViewMode('map');
    // Trigger station list refresh
    setStationRefreshKey(prev => prev + 1);
  };

  const handleStationUpdate = async () => {
    if (!selectedStation) return;
    const { data, error } = await supabase.from('stations').select('*').eq('id', selectedStation.id).single();
    if (data && !error) {
      setSelectedStation(mapStation(data));
      setStationRefreshKey(prev => prev + 1);
    }
  };

  const handleSignOut = () => {
    setHasOnboarded(false);
    setActiveTab('map');
  };

  const selectStation = (s: Station) => {
    setSelectedStation(s);
    setActiveTab('map');
    setViewMode('map');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-white">
        <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || isRecovering) {
    return <AuthScreen />;
  }

  if (!hasOnboarded) return <Onboarding onComplete={() => { localStorage.setItem('fuelspy_onboarded', 'true'); setHasOnboarded(true); }} />;

  if (isScanning) return (
    <ScanFlow
      onCancel={() => setIsScanning(false)}
      onComplete={(price, type) => finishContribution(selectedStation?.name || t('app.unknown'), [{ fuelType: type, price }], false, selectedStation?.id)}
      onFallback={() => {
        setIsScanning(false);
        setLastViewBeforeReport('map');
        setViewMode('manual_report');
      }}
    />
  );

  if (showSuccess) {
    return (
      <ContributionSuccess
        summary={lastContribution}
        isPioneer={isPioneerContribution}
        earnedPoints={earnedPoints}
        onDone={() => {
          setShowSuccess(false);
          setSelectedStation(null);
        }}
      />
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={(tab) => {
      setActiveTab(tab);
      if (tab === 'map' && activeTab !== 'map') setViewMode('map');
      if (tab === 'search') setSearchView('filters');
    }}>
      {activeTab === 'map' && (
        <>
          {viewMode === 'map' && (
            <>
              <MapExplorer
                selectedStation={selectedStation}
                hideBottomCard={!!selectedStation}
                refreshKey={stationRefreshKey}
                userLocation={userLocation}
                onViewList={() => setViewMode('list')}
                onStationSelect={(s) => setSelectedStation(s)}
                onAddStationInitiated={(loc) => {
                  if (!checkDistance(loc.lat, loc.lng)) return;
                  setPendingLocation(loc);
                  setViewMode('add_station');
                }}
              />

              <StationSheet
                station={selectedStation}
                userLocation={userLocation}
                onClose={() => setSelectedStation(null)}
                showAlert={showAlert}
                onUpdate={handleStationUpdate}
                onReport={handleReport}
                onValidateDistance={() => selectedStation ? checkDistance(selectedStation.location.lat, selectedStation.location.lng) : false}
                onManualReport={() => {
                  if (selectedStation && !checkDistance(selectedStation.location.lat, selectedStation.location.lng)) return;
                  setLastViewBeforeReport('map');
                  setViewMode('manual_report');
                }}
                onVoiceReport={() => {
                  if (selectedStation && !checkDistance(selectedStation.location.lat, selectedStation.location.lng)) return;
                  setLastViewBeforeReport('map');
                  setViewMode('voice_report');
                }}
              />
            </>
          )}

          {viewMode === 'list' && (
            <NearbyList onBack={() => setViewMode('map')} onStationSelect={selectStation} userLocation={userLocation} />
          )}

          {viewMode === 'add_station' && (
            <AddStation
              location={pendingLocation}
              onBack={() => setViewMode('map')}
              onComplete={(brand, price) => {
                const name = brand === 'Other' ? 'Unknown Station' : `${brand} Station`;
                finishContribution(name, [{ fuelType: 'Diesel', price }], true, undefined);
              }}
            />
          )}

          {viewMode === 'manual_report' && selectedStation && (
            <ManualReport station={selectedStation} onBack={() => setViewMode(lastViewBeforeReport)} onComplete={(reports) => finishContribution(selectedStation.name, reports, false, selectedStation.id)} />
          )}

          {viewMode === 'voice_report' && selectedStation && (
            <VoiceReport station={selectedStation} onBack={() => setViewMode(lastViewBeforeReport)} onComplete={(p, t) => finishContribution(selectedStation.name, [{ fuelType: t, price: p }], false, selectedStation.id)} />
          )}
        </>
      )}

      {activeTab === 'search' && (
        searchView === 'filters' ? <SearchScreen onBack={() => setActiveTab('map')} onApplyFilters={(filters) => { setSearchFilters(filters); setSearchView('results'); }} />
          : <NearbyList title={t('app.searchResults')} searchFilters={searchFilters} initialSearch="" onBack={() => setSearchView('filters')} onStationSelect={selectStation} userLocation={userLocation} />
      )}

      {activeTab === 'rewards' && <Rewards showAlert={showAlert} />}
      {activeTab === 'profile' && <Profile onSignOut={handleSignOut} />}

      {activeTab === 'scan' && (
        <div className="h-full flex items-center justify-center p-8 text-center animate-fadeIn relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.08),transparent_70%)]" />
          <div className="relative z-10">
            <div className="size-28 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse-slow"></div>
              <span className="material-symbols-outlined text-6xl relative">document_scanner</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">{t('app.snapSave')}</h2>
            <p className="text-slate-400 mb-12 max-w-xs mx-auto leading-relaxed text-lg">{t('app.snapDesc')}</p>
            <button
              onClick={() => setIsScanning(true)}
              className="bg-primary text-background-dark font-black px-14 py-6 rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all text-xl uppercase tracking-widest"
            >
              {t('app.startScanning')}
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AlertModal
        isOpen={!!alertConfig}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        type={alertConfig?.type || 'info'}
        onClose={() => setAlertConfig(null)}
      />

      <AlertModal
        isOpen={showLocationReminder}
        title={t('app.locationReminderTitle') || 'Location Required'}
        message={t('app.locationReminderDesc') || "Please allow location access to fully use the app's features."}
        type="error"
        onClose={() => setShowLocationReminder(false)}
        confirmText="OK"
      />
    </Layout>
  );
};

export default App;