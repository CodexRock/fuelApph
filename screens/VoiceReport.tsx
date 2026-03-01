import React, { useState, useEffect } from 'react';
import { Station } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { processVoiceReport } from '../services/geminiService';

interface VoiceReportProps {
  station: Station;
  onBack: () => void;
  onComplete: (price: number, fuelType: string) => void;
}

export const VoiceReport: React.FC<VoiceReportProps> = ({ station, onBack, onComplete }) => {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [detectedFuel, setDetectedFuel] = useState('Diesel');
  const [detectedPrice, setDetectedPrice] = useState(12.50);

  useEffect(() => {
    let finalTranscript = '';

    if (!isListening) return;

    // Utilize Web Speech API
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Voice recognition is not supported in this browser. Please use manual entry.");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'fr-FR'; // French helps pick up Moroccan numbering/fuels easily
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscription(finalTranscript || interimTranscript);
    };

    recognition.onend = async () => {
      setIsListening(false);
      const finalTextToProcess = finalTranscript || transcription;

      if (finalTextToProcess) {
        setIsProcessing(true);
        setTranscription(finalTextToProcess);

        try {
          const aiResult = await processVoiceReport(finalTextToProcess);
          if (aiResult) {
            if (aiResult.price) setDetectedPrice(parseFloat(aiResult.price));
            if (aiResult.fuelType) {
              const ft = aiResult.fuelType.toLowerCase();
              if (ft.includes('plomb') || ft.includes('essence')) setDetectedFuel('Sans Plomb');
              else if (ft.includes('premium')) setDetectedFuel('Premium');
              else setDetectedFuel('Diesel');
            }
          }
        } catch (err) {
          console.error("Failed to parse AI voice report", err);
        }
        setIsProcessing(false);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }

    return () => {
      recognition.stop();
    };
  }, [isListening]); // Re-run when listening gets toggled on again

  const adjustPrice = (amount: number) => {
    setDetectedPrice(prev => Math.max(0, parseFloat((prev + amount).toFixed(2))));
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-background-dark font-display text-slate-100 flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 pt-12 shrink-0 z-10 relative">
        <button onClick={onBack} className="text-white hover:text-primary transition-colors p-3 rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined !text-[28px]">close</span>
        </button>
        <h2 className="text-white text-lg font-black tracking-wide uppercase text-center flex-1">{t('voiceReport.title') || 'Voice Report'}</h2>
        <div className="w-12"></div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-md mx-auto px-6 overflow-y-auto no-scrollbar">
        {/* Instruction */}
        <div className="text-center mb-10 shrink-0">
          <h1 className="text-white text-4xl font-black mb-3 tracking-tight">
            {isListening ? (t('voiceReport.listening') || 'Listening...') : isProcessing ? 'Analyzing...' : (t('voiceReport.verifyResult') || 'Verify Details')}
          </h1>
          <p className="text-slate-400 text-base font-medium max-w-[280px] mx-auto leading-relaxed">
            {isListening || isProcessing
              ? <>{t('voiceReport.instruction') || 'Speak the fuel type and price clearly.'} <br /><span className="text-primary font-black text-xs uppercase mt-2 block opacity-60">{t('voiceReport.example') || 'e.g., "Diesel at 13.50"'}</span></>
              : (t('voiceReport.adjustManual') || 'Verify or adjust the AI extracted values below.')}
          </p>
        </div>

        {/* Visualizer */}
        <div className="relative size-48 flex items-center justify-center mb-10 shrink-0">
          {(isListening || isProcessing) && <div className="absolute inset-0 rounded-full border border-primary/20 scale-150 animate-pulse-slow"></div>}
          <div className={`size-36 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center relative border border-primary/30 shadow-[0_0_50px_rgba(59,130,246,0.1)] transition-all ${isProcessing ? 'animate-spin' : ''}`}>
            <div className="flex items-center justify-center gap-2 h-12">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ height: isListening ? `${40 + Math.random() * 60}%` : '20%', transition: 'height 0.2s ease' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Transcription */}
        <div className="w-full text-center h-16 flex items-center justify-center mb-8 shrink-0">
          <p className="text-2xl text-slate-200 font-bold italic opacity-80">{transcription || (isListening ? "..." : "")}</p>
        </div>

        {/* Confirmation Card with Manual Adjustments */}
        {!isListening && !isProcessing && (
          <div className="w-full bg-surface-dark border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-slide-up mb-10 shrink-0">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Manual Fuel Adjustment */}
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-left flex flex-col justify-between">
                <span className="text-slate-500 text-[9px] font-black uppercase mb-2 block tracking-widest">{t('voiceReport.fuelType') || 'Fuel Type'}</span>
                <div className="flex flex-col gap-2">
                  {['Diesel', 'Sans Plomb'].map(f => (
                    <button
                      key={f}
                      onClick={() => setDetectedFuel(f)}
                      className={`py-2 px-3 rounded-lg text-[10px] font-black uppercase transition-all border ${detectedFuel === f ? 'bg-primary text-background-dark border-primary' : 'bg-white/5 text-slate-400 border-white/5'}`}
                    >
                      {f === 'Diesel' ? t('station.diesel') : t('station.sansPlomb')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Price Adjustment */}
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-left flex flex-col justify-between">
                <span className="text-slate-500 text-[9px] font-black uppercase mb-2 block tracking-widest">{t('voiceReport.priceMad') || 'Price'}</span>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 w-full justify-between">
                    <button onClick={() => adjustPrice(-0.01)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-sm font-black">remove</span>
                    </button>
                    <div className="text-xl font-black text-white tabular-nums">{detectedPrice.toFixed(2)}</div>
                    <button onClick={() => adjustPrice(0.01)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-sm font-black">add</span>
                    </button>
                  </div>
                  <div className="text-[8px] font-black text-slate-600 uppercase">{t('voiceReport.tapToAdjust') || 'Tap to adjust'}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTranscription('');
                  setIsListening(true);
                }}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-black text-xs uppercase border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                {t('voiceReport.retake') || 'Retake'}
              </button>
              <button
                onClick={() => onComplete(detectedPrice, detectedFuel)}
                className="flex-1 py-4 rounded-2xl bg-primary text-background-dark font-black text-xs uppercase shadow-xl hover:bg-blue-400 active:scale-[0.98] transition-all"
              >
                {t('voiceReport.confirm') || 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};