import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  AlertTriangle,
  Volume2,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Radio,
  Sparkles,
} from 'lucide-react';
import { ProcessingMode, AudioTelemetry } from '../audio/dspEngine';

interface AndroidEmulatorProps {
  isListening: boolean;
  telemetry: AudioTelemetry;
  suppressionLevel: number;
  mode: ProcessingMode;
  isUsingStudioSound: boolean;
  onToggleListening: () => void;
  onSuppressionChange: (val: number) => void;
  onModeChange: (mode: ProcessingMode) => void;
  onEngineToggle: (isStudioSound: boolean) => void;
}

export const AndroidEmulator: React.FC<AndroidEmulatorProps> = ({
  isListening,
  telemetry,
  suppressionLevel,
  mode,
  isUsingStudioSound,
  onToggleListening,
  onSuppressionChange,
  onModeChange,
  onEngineToggle,
}) => {
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const hrs = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const inputDb = isListening ? telemetry.inputDb : 0;
  const outputDb = isListening ? telemetry.outputDb : 0;
  const reductionDb = isListening ? telemetry.reductionDb : 0;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Phone Hardware Frame */}
      <div className="relative w-full max-w-[370px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800">
        {/* Speaker / Front Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full flex items-center justify-center gap-3 z-30 border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700/60" />
          <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Screen Bezel & Display */}
        <div className="w-full bg-[#0d121c] rounded-[34px] overflow-hidden flex flex-col min-h-[660px] text-slate-100 border border-slate-800/80">
          {/* Android Status Bar */}
          <div className="h-10 px-6 pt-3 flex items-center justify-between text-xs text-slate-400 select-none">
            <span className="font-semibold text-slate-300 font-mono">{currentTime}</span>
            <div className="flex items-center gap-2">
              {isListening && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  MIC
                </span>
              )}
              <span className="text-[11px] font-mono">5G</span>
              <span className="text-[11px] font-mono">92%</span>
            </div>
          </div>

          {/* App Bar (Material 3 Style) */}
          <div className="px-5 py-3 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">AcousticShield</h1>
                <p className="text-[10px] text-slate-400">Industrial Audio Protection</p>
              </div>
            </div>
            <button
              onClick={() => onEngineToggle(!isUsingStudioSound)}
              title="Toggle between Google Studio Sound ML and Android NoiseSuppressor"
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>{isUsingStudioSound ? 'Studio Sound' : 'Hardware NS'}</span>
            </button>
          </div>

          {/* Screen Content Body */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto text-xs">
            {/* MANDATORY PROMPT REQUIREMENT: Prominent Hearing Protection Warning */}
            <div className="rounded-xl bg-amber-950/40 border border-amber-500/40 p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="font-extrabold text-[11px] tracking-wide uppercase text-amber-300">
                  HEARING PROTECTION ADVISORY
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-100/90 font-medium">
                This app is a noise suppression tool, not a substitute for physical hearing protection. In extremely loud environments, always wear certified earplugs or earmuffs to prevent hearing damage.
              </p>
            </div>

            {/* AI Engine Status Banner */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 font-medium">Active AI ML Pipeline</span>
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  isUsingStudioSound ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {isUsingStudioSound ? 'Google Studio Sound ML' : 'Android NoiseSuppressor'}
              </span>
            </div>

            {/* Visual Level Meters (AudioLevelMeter Composable) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Live Acoustic Meters</span>
                {isListening && (
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    -{Math.round(reductionDb)} dB Cut
                  </span>
                )}
              </div>

              {/* Raw Input Mic Level Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Raw Input Mic</span>
                  <span className="font-mono text-slate-300">{Math.round(inputDb)} dB SPL</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      inputDb > 85 ? 'bg-rose-500' : inputDb > 75 ? 'bg-amber-400' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, (inputDb / 115) * 100)}%` }}
                  />
                </div>
                {inputDb > 85 && (
                  <p className="text-[9px] text-rose-400 font-medium flex items-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    Industrial hazard level (&gt;85 dB) - certified NRR ear protection required!
                  </p>
                )}
              </div>

              {/* Processed Output Audio Level Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Suppressed Output</span>
                  <span className="font-mono text-emerald-400">{Math.round(outputDb)} dB SPL</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                    style={{ width: `${Math.min(100, (outputDb / 115) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Profile Mode Selector */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="font-semibold text-slate-200 block">Processing Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onModeChange('speech_enhancement')}
                  className={`py-2 px-2.5 rounded-lg text-center transition-all font-medium border ${
                    mode === 'speech_enhancement'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Speech Boost
                </button>
                <button
                  onClick={() => onModeChange('noise_reduction')}
                  className={`py-2 px-2.5 rounded-lg text-center transition-all font-medium border ${
                    mode === 'noise_reduction'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Noise Gate
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {mode === 'speech_enhancement'
                  ? 'Boosts human voice band (300Hz-3.4kHz) while suppressing shop machinery'
                  : 'Aggressive multi-band attenuation for steady air hiss and water jets'}
              </p>
            </div>

            {/* Noise Reduction Intensity Slider */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Suppression Level</span>
                <span className="font-mono font-bold text-amber-400 text-xs">
                  {Math.round(suppressionLevel * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={suppressionLevel}
                onChange={(e) => onSuppressionChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% Ambient</span>
                <span>50% Balanced</span>
                <span>100% Maximum</span>
              </div>
            </div>

            {/* Large Start / Stop Listening Button */}
            <button
              onClick={onToggleListening}
              className={`w-full py-4 px-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>STOP LISTENING</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span>START LISTENING</span>
                </>
              )}
            </button>
          </div>

          {/* Android Navigation Bar */}
          <div className="h-6 flex items-center justify-center pb-2 bg-slate-950">
            <div className="w-28 h-1 bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
