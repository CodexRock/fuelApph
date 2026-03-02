import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

import { User as AppUser } from '../types';

export const Referrals: React.FC<{ onBack: () => void; user: AppUser | null }> = ({ onBack, user }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const referralCode = user?.name
    ? `${user.name.split(' ')[0].toUpperCase()}-FS24`
    : `FS-${user?.id?.substring(0, 6).toUpperCase() || '2024'}`;

  const shareText = `Use my referral code ${referralCode} to get bonus XP on FuelSpy Morocco! \n🔗 https://fuelspy.ma`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fadeIn">
      <header className="flex items-center justify-between p-4 pt-12 z-20">
        <button onClick={onBack} className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-black">{t('referrals.title')}</h1>
        <div className="size-11" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="text-center mb-10">
          <div className="relative size-48 mx-auto mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full animate-pulse-slow" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNjQ3fqVFwiU9xxrCL0L0ek57d3EKTz30Eqi9qwcK8KWkH73RF8D8bLS8DL8IU_KUPCyhtT1TwWzdBHK9ma4qTm_phoI_n57TuqH3B4ZMo-jCu2_wz11Xe6ptOi3cJC3Iqqe0L4CJewXWJm1IHS4PDp8TVDP_Yzn2mKF8aXnVUT_T0_Sg-tKAgfbWDZmpBB6dY_knk2m0glSw4oro9DdrSzJoHwMxaH_ZYCNe1cdRbuWEWUGnsA183JIKUo2RPYHFeIwSQmMW6xa1E"
              className="size-full object-contain relative z-10"
              alt="Invite"
            />
          </div>
          <h2 className="text-4xl font-black text-white leading-none mb-3">{t('referrals.shareSavings')}</h2>
          <p className="text-slate-400 text-lg leading-relaxed px-4">{t('referrals.desc1')}<span className="text-primary font-bold">{t('referrals.desc2')}</span>{t('referrals.desc3')}</p>
        </div>

        {/* 3 Step Guide */}
        <div className="grid grid-cols-3 gap-2 mb-10">
          <Step num={1} icon="send" label={t('referrals.step1')} />
          <Step num={2} icon="qr_code_scanner" label={t('referrals.step2')} />
          <Step num={3} icon="card_giftcard" label={t('referrals.step3')} />
        </div>

        {/* Code Card */}
        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 size-24 bg-primary/10 blur-3xl" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">{t('referrals.yourCode')}</span>
          <div className="flex items-center justify-between gap-4 bg-background-dark/50 rounded-2xl border-2 border-dashed border-white/10 p-2 pl-6 mb-8">
            <span className="text-2xl font-black tracking-widest text-white font-mono">{referralCode}</span>
            <button
              onClick={handleCopy}
              className="bg-primary text-background-dark size-12 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined font-black">{copied ? 'check' : 'content_copy'}</span>
            </button>
          </div>
          <button
            onClick={handleShare}
            className="w-full h-16 bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#25D366]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="h-6 w-6" />
            {t('referrals.inviteNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Step: React.FC<{ num: number; icon: string; label: string }> = ({ num, icon, label }) => (
  <div className="flex flex-col items-center gap-3 group">
    <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-all">
      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase text-center tracking-tighter">{num}. {label}</p>
  </div>
);