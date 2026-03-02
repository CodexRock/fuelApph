import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { extractFuelPriceFromImage } from '../services/geminiService';

interface ScanFlowProps {
  onComplete: (price: number, type: string) => void;
  onCancel: () => void;
  onFallback: () => void;
}

export const ScanFlow: React.FC<ScanFlowProps> = ({ onComplete, onCancel, onFallback }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'camera' | 'processing' | 'verify'>('camera');
  const [extractedData, setExtractedData] = useState<{ price: number; fuelType: string } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (step === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraError(null);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError(err.message || 'Camera permission denied');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
  };

  const handleCapture = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;

    setStep('processing');

    // Capture frame on canvas
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      try {
        const result = await extractFuelPriceFromImage(base64Image);
        stopCamera();
        if (result && result.price) {
          setExtractedData(result);
          setStep('verify');
        } else {
          onFallback();
        }
      } catch (err) {
        console.error("Processing error:", err);
        onFallback();
      }
    } else {
      onFallback();
    }
  };

  const adjustPrice = (amount: number) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        price: Math.max(0, parseFloat((extractedData.price + amount).toFixed(2)))
      });
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col">
      {cameraError && step === 'camera' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-background-dark/95 backdrop-blur-md">
          <div className="size-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <span className="material-symbols-outlined text-4xl">no_photography</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-3 tracking-tight">{t('scanFlow.cameraErrorTitle') || 'Camera Blocked'}</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xs">{t('scanFlow.cameraErrorDesc') || 'Please allow camera access in your browser settings to scan prices automatically.'}</p>

          <div className="w-full space-y-3 max-w-xs">
            <button
              onClick={startCamera}
              className="w-full h-14 bg-white/10 text-white font-bold rounded-2xl active:scale-95 transition-all border border-white/10"
            >
              {t('scanFlow.tryAgain') || 'Try Again'}
            </button>
            <button
              onClick={onFallback}
              className="w-full h-14 bg-primary text-background-dark font-black rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              {t('scanFlow.manualEntry') || 'Enter Manually'}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-xs mt-2"
            >
              {t('scanFlow.cancel') || 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {step === 'camera' && !cameraError && (
        <div className="relative flex-1">
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />

          <div className="absolute inset-0 flex flex-col p-6 pointer-events-none">
            <div className="flex justify-between items-center pointer-events-auto">
              <button onClick={onCancel} className="size-10 bg-black/40 rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="px-3 py-1 bg-primary text-background-dark rounded-full text-xs font-bold">{t('scanFlow.pointBoard')}</div>
              <div className="w-10" />
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-72 h-40 border-2 border-primary/50 rounded-xl relative">
                <div className="absolute -top-1 -left-1 size-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 size-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 size-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 size-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                <div className="absolute w-[90%] left-[5%] h-0.5 bg-primary shadow-[0_0_15px_rgba(59,130,246,1)] animate-scan-move" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 pointer-events-auto">
              <p className="text-white/60 text-sm text-center">{t('scanFlow.aiDetect')}</p>
              <button
                onClick={handleCapture}
                className="size-20 rounded-full border-4 border-white flex items-center justify-center p-1 mb-8"
              >
                <div className="size-full bg-white rounded-full active:scale-90 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background-dark">
          <div className="relative size-32 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-5xl">document_scanner</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('scanFlow.analyzing')}</h2>
          <p className="text-slate-400">{t('scanFlow.glareFallback')}</p>
        </div>
      )}

      {step === 'verify' && extractedData && (
        <div className="flex-1 flex flex-col bg-background-dark p-6 pt-12">
          <h2 className="text-3xl font-extrabold text-white mb-2 text-center">{t('scanFlow.verifyDetails')}</h2>
          <p className="text-slate-400 text-center mb-8">{t('scanFlow.confirmInfo')}</p>

          <div className="bg-surface-dark rounded-2xl p-6 border border-primary/20 space-y-6 shadow-xl mb-auto">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{t('scanFlow.detectedFuel')}</label>
              <div className="flex gap-2">
                {['Diesel', 'Sans Plomb', 'Premium'].map(type => (
                  <button
                    key={type}
                    onClick={() => setExtractedData({ ...extractedData, fuelType: type })}
                    className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${extractedData.fuelType === type ? 'bg-primary border-primary text-background-dark' : 'bg-surface-darker border-white/5 text-slate-400'}`}
                  >
                    {type === 'Diesel' ? t('station.diesel') : type === 'Sans Plomb' ? t('station.sansPlomb') : t('station.premium')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{t('scanFlow.pricePerLiter')}</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => adjustPrice(-0.01)}
                  className="size-14 rounded-2xl bg-surface-darker border border-white/5 flex items-center justify-center text-primary active:scale-90 transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined !text-3xl font-black">remove</span>
                </button>

                <div className="flex-1 relative">
                  <input
                    type="number"
                    step="0.01"
                    value={extractedData.price}
                    onChange={(e) => setExtractedData({ ...extractedData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-surface-darker border-2 border-primary/30 rounded-2xl py-4 text-4xl font-extrabold text-white text-center focus:border-primary focus:ring-0 tabular-nums"
                  />
                  <div className="absolute -bottom-6 left-0 right-0 text-center">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('scanFlow.tapToType')}</span>
                  </div>
                </div>

                <button
                  onClick={() => adjustPrice(0.01)}
                  className="size-14 rounded-2xl bg-surface-darker border border-white/5 flex items-center justify-center text-primary active:scale-90 transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined !text-3xl font-black">add</span>
                </button>
              </div>

              <div className="flex justify-center gap-3 mt-8">
                {[-0.10, -0.05, 0.05, 0.10].map(val => (
                  <button
                    key={val}
                    onClick={() => adjustPrice(val)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 active:scale-95 transition-all"
                  >
                    {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-8">
            <button
              onClick={() => onComplete(extractedData.price, extractedData.fuelType)}
              className="w-full h-16 bg-primary hover:bg-primary-dark text-background-dark font-bold text-xl rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">check_circle</span>
              {t('scanFlow.looksGood')}
            </button>
            <button
              onClick={onFallback}
              className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors"
            >
              {t('scanFlow.editManually')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};