import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';

interface AvatarPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (avatarId: string) => void;
    currentAvatarId?: string;
}

const AVATARS = [
    { id: 'avatar_3d_moro_1', path: 'avatars/avatar1.png' },
    { id: 'avatar_3d_moro_2', path: 'avatars/avatar2.png' },
    { id: 'avatar_3d_moro_3', path: 'avatars/avatar3.png' },
    { id: 'avatar_3d_tech_agent', path: 'avatars/avatar4.png' },
    { id: 'avatar_3d_moro_4_business', path: 'avatars/avatar5.png' },
    { id: 'avatar_3d_moro_5_rider', path: 'avatars/avatar6.png' },
    { id: 'avatar_3d_moro_6_sporty', path: 'avatars/avatar7.png' },
    { id: 'avatar_3d_moro_7_classic', path: 'avatars/avatar8.png' },
];

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ isOpen, onClose, onSelect, currentAvatarId }) => {
    const { t } = useLanguage();
    const [modalElement, setModalElement] = React.useState<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setModalElement(document.getElementById('modal-root') || document.body);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setModalElement(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !modalElement) return null;

    return createPortal(
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background-dark/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] w-full max-w-sm relative z-10 shadow-2xl p-6 flex flex-col animate-scaleIn">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">{t('profile.chooseAvatar')}</h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{t('profile.netflixStyle')}</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar pb-2">
                    {AVATARS.map((avatar) => (
                        <button
                            key={avatar.id}
                            onClick={() => {
                                onSelect(avatar.id);
                                onClose();
                            }}
                            className={`group relative aspect-square rounded-[1.5rem] overflow-hidden border-4 transition-all duration-300 active:scale-95 ${currentAvatarId === avatar.id ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-white/5 hover:border-white/20'
                                }`}
                        >
                            <img
                                src={avatar.path}
                                alt={avatar.id}
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className={`absolute inset-0 bg-primary/10 transition-opacity duration-300 ${currentAvatarId === avatar.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            {currentAvatarId === avatar.id && (
                                <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-primary flex items-center justify-center text-background-dark shadow-lg">
                                    <span className="material-symbols-outlined text-[14px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex justify-center text-center">
                    <p className="text-[10px] font-bold text-slate-500 max-w-[200px]">
                        {t('profile.avatarInfo')}
                    </p>
                </div>
            </div>
        </div>,
        modalElement
    );
};
