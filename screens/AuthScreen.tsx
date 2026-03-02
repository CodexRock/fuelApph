import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

export const AuthScreen: React.FC = () => {
    const { t } = useLanguage();
    const { isRecovering, setRecovering } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: email.split('@')[0] }
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
            setError(err.message || t('auth.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-background text-white p-4">
            <div className="bg-surface p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-800">
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

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-primary/10 border border-primary/50 text-primary p-3 rounded-lg mb-4 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
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

                    {(view === 'login' || view === 'signup' || view === 'reset') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                {view === 'reset' ? t('auth.newPassword') : t('auth.password')}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="••••••••"
                            />
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
