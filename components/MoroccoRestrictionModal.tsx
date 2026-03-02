import React from 'react';
import { getFunnyMoroccoRestrictionMessage } from '../utils/location';

interface MoroccoRestrictionModalProps {
    onClose: () => void;
}

export const MoroccoRestrictionModal: React.FC<MoroccoRestrictionModalProps> = ({ onClose }) => {
    const message = getFunnyMoroccoRestrictionMessage();

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-surface-darker border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center animate-scale-up">
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
                    <span className="material-symbols-outlined text-4xl text-primary animate-bounce-slight font-black">public_off</span>
                </div>

                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Oups ! 🌍</h2>

                <p className="text-slate-300 font-bold leading-relaxed mb-8">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="w-full h-14 bg-primary text-background-dark font-black rounded-2xl shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    D'accord, je reviens ! 🇲🇦
                </button>
            </div>
        </div>
    );
};
