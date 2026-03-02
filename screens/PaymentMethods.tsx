import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const PaymentMethods: React.FC<{ onBack: () => void }> = ({ onBack }) => {
   const { t } = useLanguage();
   return (
      <div className="flex flex-col h-full bg-background-dark animate-fadeIn">
         <header className="flex items-center justify-between p-4 pt-12 z-20">
            <button onClick={onBack} className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-white">
               <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-black">{t('paymentMethods.title') || 'Payment Methods'}</h1>
            <div className="size-11" />
         </header>

         <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center max-w-xs">
               <div className="size-24 bg-surface-dark border border-white/5 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
               </div>
               <h2 className="text-2xl font-black text-white mb-3">{t('paymentMethods.comingSoon') || 'Coming Soon'}</h2>
               <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {t('paymentMethods.comingSoonDesc') || 'We\'re working on integrating payment methods so you can pay for fuel directly through FuelSpy. Stay tuned!'}
               </p>
               <div className="w-full space-y-3">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-white/5">
                     <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">credit_card</span>
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-bold text-white">{t('paymentMethods.cardPayment') || 'Card Payment'}</p>
                        <p className="text-[10px] text-slate-500">{t('paymentMethods.cardPaymentDesc') || 'Visa, Mastercard, CMI'}</p>
                     </div>
                     <span className="ml-auto text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase tracking-widest">{t('paymentMethods.soon') || 'Soon'}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-white/5">
                     <div className="size-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-500">smartphone</span>
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-bold text-white">{t('paymentMethods.mobilePay') || 'Mobile Payment'}</p>
                        <p className="text-[10px] text-slate-500">{t('paymentMethods.mobilePayDesc') || 'M-Wallet, Inwi Money'}</p>
                     </div>
                     <span className="ml-auto text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase tracking-widest">{t('paymentMethods.soon') || 'Soon'}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};