import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User as AppUser } from '../types';
import { Leaderboard } from './Leaderboard';
import { Referrals } from './Referrals';
import { VehicleLog } from './VehicleLog';
import { Notifications } from './Notifications';
import { Badges } from './Badges';
import { VehicleSettings } from './VehicleSettings';
import { PaymentMethods } from './PaymentMethods';
import { SecuritySettings } from './SecuritySettings';
import { HelpCenter } from './HelpCenter';
import { LanguageSettings } from './LanguageSettings';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { AvatarPicker } from '../components/AvatarPicker';

type ProfileSubView = 'main' | 'leaderboard' | 'referrals' | 'logs' | 'notifications' | 'badges' | 'vehicle' | 'payment' | 'security' | 'help' | 'language';

interface ProfileProps {
  onSignOut: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onSignOut }) => {
  const [subView, setSubView] = useState<ProfileSubView>('main');
  const [profileData, setProfileData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
    }
  }, [user]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
    } else {
      setProfileData({
        id: data.id,
        name: data.name,
        level: data.level,
        xp: data.xp,
        nextLevelXp: data.next_level_xp,
        totalPoints: data.total_points,
        reportsCount: data.reports_count,
        verifiedCount: data.verified_count,
        savings: data.savings,
        globalRank: data.global_rank,
        vehicle: data.vehicle
      });
      setAvatarUrl(data.avatar_url || null);
    }
    setLoading(false);
  };

  const handleAvatarSelect = async (path: string) => {
    if (!user) return;
    const { error } = await supabase.from('users').update({ avatar_url: path }).eq('id', user.id);
    if (error) {
      console.error('Error updating avatar:', error);
    } else {
      setAvatarUrl(path);
    }
  };

  const renderContent = () => {
    switch (subView) {
      case 'leaderboard': return <Leaderboard onBack={() => setSubView('main')} currentUser={profileData} />;
      case 'referrals': return <Referrals onBack={() => setSubView('main')} user={profileData} />;
      case 'logs': return <VehicleLog onBack={() => setSubView('main')} />;
      case 'notifications': return <Notifications onBack={() => setSubView('main')} />;
      case 'badges': return <Badges onBack={() => setSubView('main')} currentUser={profileData} />;
      case 'vehicle': return <VehicleSettings onBack={() => setSubView('main')} />;
      case 'payment': return <PaymentMethods onBack={() => setSubView('main')} />;
      case 'security': return <SecuritySettings onBack={() => setSubView('main')} />;
      case 'help': return <HelpCenter onBack={() => setSubView('main')} />;
      case 'language': return <LanguageSettings onBack={() => setSubView('main')} />;
      default:
        if (loading || !profileData) {
          return (
            <div className="flex items-center justify-center p-12">
              <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          );
        }
        return (
          <div className="animate-fadeIn pb-32">
            {/* Header & Level Progress */}
            <div className="flex flex-col items-center pt-12 pb-10 px-6 bg-gradient-to-b from-surface-dark/40 to-background-dark relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-primary/5 blur-[120px] pointer-events-none" />

              <button
                onClick={() => setSubView('notifications')}
                className="absolute right-6 top-12 size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-slate-400"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-surface-dark" />
              </button>

              <div className="relative mb-6">
                <div className="size-32 rounded-full border-4 border-primary/20 p-1.5 relative">
                  <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90" viewBox="0 0 132 132">
                    <circle cx="66" cy="66" r="60" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                    <circle cx="66" cy="66" r="60" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="376" strokeDashoffset={376 * (1 - ((profileData.xp || 0) / (profileData.nextLevelXp || 100)))} strokeLinecap="round" className="text-primary transition-all duration-1000" />
                  </svg>
                  <button
                    onClick={() => setIsAvatarPickerOpen(true)}
                    className="cursor-pointer size-full block rounded-full relative z-10 group overflow-hidden"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl.startsWith('http') || avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`} alt="Profile" className="size-full rounded-full object-cover" />
                    ) : (
                      <div className="size-full rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white">
                        <span className="text-4xl font-black">{(profileData.name || 'U').charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl">edit_square</span>
                    </div>
                  </button>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-background-dark font-black px-3 py-1 rounded-full border-4 border-background-dark shadow-xl text-xs z-20">
                  {t('profile.level') || 'LVL'} {profileData.level || 1}
                </div>
              </div>

              <h1 className="text-3xl font-black text-white mb-1 tracking-tight">{profileData.name}</h1>
              <p className="text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4">{t('profile.expertTracker') || 'Expert Tracker'}</p>

              {/* XP Progress Bar */}
              <div className="w-full bg-surface-dark rounded-2xl border border-white/5 p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('profile.level') || 'LVL'} {profileData.level || 1}</span>
                  <span className="text-[10px] font-black text-primary">{profileData.xp || 0} / {profileData.nextLevelXp || 100} XP</span>
                </div>
                <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min(100, ((profileData.xp || 0) / (profileData.nextLevelXp || 100)) * 100)}%` }}></div>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 text-center font-bold">{Math.max(0, (profileData.nextLevelXp || 100) - (profileData.xp || 0))} XP {t('profile.toNextLevel') || 'to next level'}</p>
              </div>

              <div className="w-full grid grid-cols-3 gap-0.5 rounded-3xl overflow-hidden bg-white/5 border border-white/5 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col items-center py-4 bg-surface-dark/40">
                  <span className="text-[9px] font-black text-slate-500 uppercase mb-1">{t('profile.savings')}</span>
                  <span className="text-lg font-black text-white">{profileData.savings}<span className="text-[10px] font-bold text-slate-500 ml-0.5">DH</span></span>
                </div>
                <div className="flex flex-col items-center py-4 bg-surface-dark/40 border-x border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase mb-1">{t('profile.reports')}</span>
                  <span className="text-lg font-black text-white">{profileData.reportsCount}</span>
                </div>
                <div className="flex flex-col items-center py-4 bg-surface-dark/40">
                  <span className="text-[9px] font-black text-slate-500 uppercase mb-1">{t('profile.rank')}</span>
                  <span className="text-lg font-black text-primary">#{profileData.globalRank || '-'}</span>
                </div>
              </div>
            </div>

            <div className="px-6 grid grid-cols-2 gap-4 -mt-4 relative z-10">
              <MenuButton
                icon="leaderboard"
                label={t('profile.leaderboard')}
                desc={t('profile.leaderboardDesc')}
                color="text-primary"
                onClick={() => setSubView('leaderboard')}
              />
              <MenuButton
                icon="group_add"
                label={t('profile.referrals')}
                desc={t('profile.referralsDesc')}
                color="text-fs-blue"
                onClick={() => setSubView('referrals')}
              />
              <MenuButton
                icon="book_2"
                label={t('profile.fuelLogs')}
                desc={t('profile.fuelLogsDesc')}
                color="text-accent-gold"
                onClick={() => setSubView('logs')}
              />
              <MenuButton
                icon="military_tech"
                label={t('profile.badges')}
                desc={t('profile.badgesDesc')}
                color="text-orange-500"
                onClick={() => setSubView('badges')}
              />
            </div>

            <div className="mt-8 px-6 space-y-3">
              <ListButton icon="directions_car" label={t('profile.vehicleSettings')} onClick={() => setSubView('vehicle')} />
              <ListButton icon="payments" label={t('profile.paymentMethods')} onClick={() => setSubView('payment')} />
              <ListButton icon="security" label={t('profile.accountSecurity')} onClick={() => setSubView('security')} />
              <ListButton icon="language" label={t('profile.language')} onClick={() => setSubView('language')} />
              <ThemeToggleButton />
              <ListButton icon="help" label={t('profile.helpCenter')} onClick={() => setSubView('help')} />

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  onSignOut();
                }}
                className="w-full flex items-center justify-between p-5 rounded-2xl bg-red-500/5 text-red-500 font-bold border border-red-500/10 active:scale-95 transition-all mt-4"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined">logout</span>
                  <span>{t('profile.signOut')}</span>
                </div>
              </button>
            </div>
          </div >
        );
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white overflow-y-auto no-scrollbar">
      {renderContent()}
      <AvatarPicker
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatarId={avatarUrl || undefined}
      />
    </div>
  );
};

const MenuButton: React.FC<{ icon: string; label: string; desc: string; color: string; onClick: () => void }> = ({ icon, label, desc, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-start p-5 rounded-[2rem] bg-surface-dark border border-white/5 shadow-xl active:scale-95 transition-all text-left">
    <div className={`size-10 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>
      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
    <p className="font-black text-white text-sm">{label}</p>
    <p className="text-[10px] font-bold text-slate-500 tracking-tight">{desc}</p>
  </button>
);

const ListButton: React.FC<{ icon: string; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 rounded-2xl bg-surface-dark border border-white/5 active:scale-[0.98] transition-all text-left"
  >
    <div className="flex items-center gap-4">
      <span className="material-symbols-outlined text-slate-400">{icon}</span>
      <span className="font-bold text-sm text-slate-200">{label}</span>
    </div>
    <span className="material-symbols-outlined text-slate-600">chevron_right</span>
  </button>
);

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-between p-5 rounded-2xl bg-surface-dark border border-white/5 active:scale-[0.98] transition-all text-left"
    >
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-slate-400">
          {theme === 'dark' ? 'dark_mode' : 'light_mode'}
        </span>
        <span className="font-bold text-sm text-slate-200">
          {theme === 'dark' ? t('profile.darkMode') : t('profile.lightMode')}
        </span>
      </div>
      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300'}`}>
        <div className={`size-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </button>
  );
};