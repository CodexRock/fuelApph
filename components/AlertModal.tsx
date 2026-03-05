import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AlertModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'info';
    onClose: () => void;
    confirmText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    title,
    message,
    type = 'info',
    onClose,
    confirmText = 'OK'
}) => {
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

    const getIcon = () => {
        switch (type) {
            case 'error': return <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>;
            case 'success': return <span className="material-symbols-outlined text-green-500 text-5xl mb-4">check_circle</span>;
            default: return <span className="material-symbols-outlined text-primary text-5xl mb-4">info</span>;
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-scaleIn flex flex-col items-center text-center">
                {getIcon()}
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
                <p className="text-sm text-slate-300 mb-8 leading-relaxed font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-primary text-background-dark font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                    {confirmText}
                </button>
            </div>
        </div>,
        modalElement
    );
};
