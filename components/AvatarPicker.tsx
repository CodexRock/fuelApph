import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface AvatarPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (avatarPath: string) => void;
    currentAvatar?: string | null;
}

const AVATARS = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png',
    '/avatars/avatar8.png',
];

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ isOpen, onClose, onSelect, currentAvatar }) => {
    const { t } = useLanguage();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-fadeIn transition-all">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative bg-surface-dark border border-white/10 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-[95vw] sm:max-w-lg animate-bounce-in overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-primary/10 blur-[60px] pointer-events-none" />

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{t('profile.chooseAvatar') || 'Choose your Avatar'}</h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{t('profile.netflixStyle') || 'Premium 3D Collection'}</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 relative z-10 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
                    {AVATARS.map((path, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onSelect(path);
                                onClose();
                            }}
                            className={`group relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-300 active:scale-90 ${currentAvatar === path ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-white/5 hover:border-white/20'
                                }`}
                        >
                            <img
                                src={path}
                                alt={`Avatar ${index + 1}`}
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className={`absolute inset-0 bg-primary/20 transition-opacity duration-300 ${currentAvatar === path ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            {currentAvatar === path && (
                                <div className="absolute top-2 right-2 size-6 rounded-full bg-primary flex items-center justify-center text-background-dark shadow-lg">
                                    <span className="material-symbols-outlined text-[16px] font-black font-variation-settings-fill">check</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-center text-center">
                    <p className="text-[10px] font-bold text-slate-500 max-w-[200px]">
                        {t('profile.avatarInfo') || 'Select a unique icon that represents your personality on the road.'}
                    </p>
                </div>
            </div>
        </div>
    );
};
