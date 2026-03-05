import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
    type?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onClose,
    type = 'primary'
}) => {
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-scaleIn flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-orange-500 text-5xl mb-4">help_center</span>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
                <p className="text-sm text-slate-300 mb-8 leading-relaxed font-medium">{message}</p>
                <div className="flex gap-4 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-surface-darker text-white font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all outline outline-1 outline-white/10"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-4 bg-primary text-background-dark font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        modalElement
    );
};
