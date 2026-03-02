import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

// Map Supabase error codes/messages to user-friendly localized messages
const getFriendlyError = (err: any, t: (key: string) => string): string => {
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('invalid login credentials')) return t('auth.errorInvalidCredentials');
    if (msg.includes('user already registered')) return t('auth.errorAlreadyRegistered');
    if (msg.includes('email not confirmed')) return t('auth.errorEmailNotConfirmed');
    if (msg.includes('password')) return t('auth.errorWeakPassword');
    if (msg.includes('rate limit')) return t('auth.errorRateLimit');
    if (msg.includes('network')) return t('auth.errorNetwork');
    return err?.message || t('auth.failed');
};

export const AuthScreen: React.FC = () => {
    const { t } = useLanguage();
    const { isRecovering, setRecovering } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [view, setView] = useState<AuthView>(isRecovering ? 'reset' : 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    React.useEffect(() => {
        if (isRecovering) {
            setView('reset');
        }
    }, [isRecovering]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else if (view === 'signup') {
                if (!fullName.trim()) {
                    throw new Error(t('auth.errorNameRequired'));
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName.trim() }
                    }
                });
                if (error) throw error;
            } else if (view === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                setMessage(t('auth.checkEmail'));
            } else if (view === 'reset') {
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                setMessage(t('auth.resetSuccess'));
                setRecovering(false);
                setTimeout(() => setView('login'), 3000);
            }
        } catch (err: any) {
            setError(getFriendlyError(err, t));
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(getFriendlyError(err, t));
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background text-white p-4">
            <div className="bg-surface p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-800">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <span className="material-symbols-outlined text-3xl">local_gas_station</span>
                    </div>
                    <h1 className="text-2xl font-black">FuelSpy Morocco</h1>
                    <p className="text-slate-400 mt-2">
                        {view === 'login' ? t('auth.welcome') :
                            view === 'signup' ? t('auth.create') :
                                view === 'forgot' ? t('auth.forgotPassword') :
                                    t('auth.resetPassword')}
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-primary/10 border border-primary/50 text-primary p-3 rounded-lg mb-4 text-sm">
                        {message}
                    </div>
                )}

                {/* Social Login Buttons (Login & Signup views) */}
                {(view === 'login' || view === 'signup') && (
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            {t('auth.continueGoogle')}
                        </button>
                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold py-3 rounded-xl hover:bg-[#166FE5] transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                            {t('auth.continueFacebook')}
                        </button>
                        <button
                            onClick={() => handleSocialLogin('apple')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-black text-white font-bold py-3 rounded-xl border border-slate-700 hover:bg-slate-900 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                            {t('auth.continueApple')}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-2">
                            <div className="flex-1 h-px bg-slate-700"></div>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('auth.orEmail')}</span>
                            <div className="flex-1 h-px bg-slate-700"></div>
                        </div>
                    </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Full Name — Signup only */}
                    {view === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('auth.fullName')}</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder={t('auth.fullNamePlaceholder')}
                            />
                        </div>
                    )}

                    {/* Email */}
                    {view !== 'reset' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('auth.email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                    )}

                    {/* Password with visibility toggle */}
                    {(view === 'login' || view === 'signup' || view === 'reset') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                {view === 'reset' ? t('auth.newPassword') : t('auth.password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {view === 'signup' && (
                                <p className="text-[11px] text-slate-500 mt-1.5">{t('auth.passwordHint')}</p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-background-dark font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? t('auth.processing') :
                            view === 'login' ? t('auth.signIn') :
                                view === 'signup' ? t('auth.signUp') :
                                    view === 'forgot' ? t('auth.sendResetLink') :
                                        t('auth.updatePassword')}
                    </button>
                </form>

                {/* Navigation Links */}
                <div className="mt-6 text-center space-y-3">
                    {view === 'login' && (
                        <>
                            <button
                                onClick={() => setView('forgot')}
                                className="block w-full text-sm text-primary hover:underline transition-colors"
                            >
                                {t('auth.forgotPassword')}
                            </button>
                            <button
                                onClick={() => setView('signup')}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                {t('auth.noAccount')}
                            </button>
                        </>
                    )}
                    {view === 'signup' && (
                        <button
                            onClick={() => setView('login')}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {t('auth.hasAccount')}
                        </button>
                    )}
                    {(view === 'forgot' || view === 'reset') && (
                        <button
                            onClick={() => setView('login')}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {t('auth.backToLogin')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
