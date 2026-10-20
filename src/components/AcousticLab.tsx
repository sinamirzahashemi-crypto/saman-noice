import React, { useRef, useEffect } from 'react';
import {
  Wrench,
  Droplets,
  Disc,
  Truck,
  Mic,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Headphones,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { EnvironmentPreset, AudioTelemetry, dspEngine } from '../audio/dspEngine';

interface AcousticLabProps {
  isListening: boolean;
  telemetry: AudioTelemetry;
  selectedPreset: EnvironmentPreset;
  useMic: boolean;
  isBypassed: boolean;
  speakerMonitoring: boolean;
  onPresetChange: (preset: EnvironmentPreset) => void;
  onToggleMic: (useMic: boolean) => void;
  onToggleBypass: () => void;
  onToggleMonitoring: () => void;
}

export const AcousticLab: React.FC<AcousticLabProps> = ({
  isListening,
  telemetry,
  selectedPreset,
  useMic,
  isBypassed,
  speakerMonitoring,
  onPresetChange,
  onToggleMic,
  onToggleBypass,
  onToggleMonitoring,
}) => {
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 60 FPS Canvas Spectrum Visualizer
  useEffect(() => {
    let animId: number;

    const drawSpectrums = () => {
      // 1. Draw Raw Input Spectrum
      if (inputCanvasRef.current && dspEngine.inputAnalyser) {
        const canvas = inputCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bufferLength = dspEngine.inputAnalyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          dspEngine.inputAnalyser.getByteFrequencyData(dataArray);

          ctx.fillStyle = '#080d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid lines
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          for (let y = 20; y < canvas.height; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          const barWidth = (canvas.width / bufferLength) * 2.2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            // High noise colors: Amber / Red
            ctx.fillStyle = i < 30 ? '#ef4444' : i < 90 ? '#f59e0b' : '#06b6d4';
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          }
        }
      }

      // 2. Draw Suppressed Output Spectrum
      if (outputCanvasRef.current && dspEngine.outputAnalyser) {
        const canvas = outputCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bufferLength = dspEngine.outputAnalyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          dspEngine.outputAnalyser.getByteFrequencyData(dataArray);

          ctx.fillStyle = '#080d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid lines
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          for (let y = 20; y < canvas.height; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          const barWidth = (canvas.width / bufferLength) * 2.2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            // Clean vocal corridor: Signal Green
            ctx.fillStyle = '#10b981';
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          }
        }
      }

      animId = requestAnimationFrame(drawSpectrums);
    };

    animId = requestAnimationFrame(drawSpectrums);
    return () => cancelAnimationFrame(animId);
  }, [isListening]);

  return (
    <div className="flex-1 space-y-5">
      {/* Test Bench Header & Source Selector */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <span>Harsh Acoustic Environment Test Bench</span>
            </h2>
            <p className="text-xs text-slate-400">
              Simulate high-decibel shop machinery or feed live microphone audio to test ML speech separation.
            </p>
          </div>

          {/* Real Mic vs Simulator Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleMic(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !useMic
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Industrial Simulator</span>
            </button>
            <button
              onClick={() => onToggleMic(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                useMic
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Live Microphone</span>
            </button>
          </div>
        </div>

        {/* Industrial Noise Environment Presets */}
        {!useMic && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Acoustic Presets</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onPresetChange('mechanic_impact')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedPreset === 'mechanic_impact'
                    ? 'bg-slate-800 border-amber-500/80 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-200">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Impact Wrench</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Pneumatic pulses ~102 dB</p>
              </button>

              <button
                onClick={() => onPresetChange('carwash_spray')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedPreset === 'carwash_spray'
                    ? 'bg-slate-800 border-amber-500/80 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-200">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Car Wash Spray</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">High-PSI turbulent water</p>
              </button>

              <button
                onClick={() => onPresetChange('industrial_grinder')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedPreset === 'industrial_grinder'
                    ? 'bg-slate-800 border-amber-500/80 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-200">
                  <Disc className="w-3.5 h-3.5 text-rose-400" />
                  <span>Metal Grinder</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Abrasive screech 4-6 kHz</p>
              </button>

              <button
                onClick={() => onPresetChange('diesel_engine')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedPreset === 'diesel_engine'
                    ? 'bg-slate-800 border-amber-500/80 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-200">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Diesel Rumble</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Low sub-rumble 16-30 Hz</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dual FFT Frequency Spectrum Waterfall */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Raw Spectrum */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Raw Input Frequency Spectrum (0 - 12 kHz)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {Math.round(telemetry.inputDb)} dB SPL
            </span>
          </div>
          <canvas
            ref={inputCanvasRef}
            width={340}
            height={110}
            className="w-full h-28 rounded-xl bg-slate-950 border border-slate-800 block"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>60 Hz</span>
            <span>500 Hz</span>
            <span>2.5 kHz</span>
            <span>8 kHz</span>
            <span>12 kHz</span>
          </div>
        </div>

        {/* Suppressed Spectrum */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              AI Studio Sound Isolated Speech Corridor
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              {Math.round(telemetry.outputDb)} dB SPL
            </span>
          </div>
          <canvas
            ref={outputCanvasRef}
            width={340}
            height={110}
            className="w-full h-28 rounded-xl bg-slate-950 border border-slate-800 block"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Sub Cut</span>
            <span className="text-emerald-400 font-semibold">Speech Formants (300Hz-3.4kHz)</span>
            <span>Hiss Filter</span>
          </div>
        </div>
      </div>

      {/* Audio Playback & Compare Workstation */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBypass}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
              isBypassed
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isBypassed ? 'A/B: Bypassed (Raw Noise)' : 'A/B: AI Suppressed Active'}</span>
          </button>

          <button
            onClick={onToggleMonitoring}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
              speakerMonitoring
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {speakerMonitoring ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Headphone Audio: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Headphone Audio: MUTED</span>
              </>
            )}
          </button>
        </div>

        {/* Protection Note */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 max-w-sm">
          <Headphones className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {speakerMonitoring
              ? 'Monitoring enabled. Wear headphones to prevent mic feedback loops.'
              : 'Speaker monitoring is muted by default to eliminate feedback loops.'}
          </span>
        </div>
      </div>
    </div>
  );
};
