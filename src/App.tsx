/**
 * AcousticShield: AI Noise Suppression for Industrial Environments
 * Native Android App & Live Audio DSP Workstation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { AndroidEmulator } from './components/AndroidEmulator';
import { AcousticLab } from './components/AcousticLab';
import { KotlinCodeViewer } from './components/KotlinCodeViewer';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { ApkGeneratorModal } from './components/ApkGeneratorModal';
import {
  dspEngine,
  AudioTelemetry,
  ProcessingMode,
  EnvironmentPreset,
} from './audio/dspEngine';
import {
  Radio,
  Sparkles,
  Layers,
  Wrench,
  ShieldAlert,
  Download,
  Activity,
  Terminal,
  Package,
} from 'lucide-react';
import { downloadAndroidProjectZip } from './utils/zipExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'emulator' | 'code' | 'docs'>('emulator');
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [telemetry, setTelemetry] = useState<AudioTelemetry>({
    inputDb: 0,
    outputDb: 0,
    reductionDb: 0,
    isClipping: false,
    snrEstimate: 0,
  });
  const [suppressionLevel, setSuppressionLevel] = useState(0.85);
  const [mode, setMode] = useState<ProcessingMode>('speech_enhancement');
  const [isUsingStudioSound, setIsUsingStudioSound] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<EnvironmentPreset>('mechanic_impact');
  const [useMic, setUseMic] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);
  const [speakerMonitoring, setSpeakerMonitoring] = useState(false);

  useEffect(() => {
    dspEngine.setTelemetryListener((tel) => {
      setTelemetry(tel);
    });

    return () => {
      dspEngine.stopListening();
    };
  }, []);

  const handleToggleListening = useCallback(async () => {
    if (isListening) {
      dspEngine.stopListening();
      setIsListening(false);
      setTelemetry({
        inputDb: 0,
        outputDb: 0,
        reductionDb: 0,
        isClipping: false,
        snrEstimate: 0,
      });
    } else {
      const ok = await dspEngine.startListening(useMic);
      if (ok) {
        setIsListening(true);
        dspEngine.setSuppressionLevel(suppressionLevel);
        dspEngine.setMode(mode);
        dspEngine.setPreset(selectedPreset);
        dspEngine.setBypass(isBypassed);
        dspEngine.setSpeakerMonitoring(speakerMonitoring);
      }
    }
  }, [isListening, useMic, suppressionLevel, mode, selectedPreset, isBypassed, speakerMonitoring]);

  const handleSuppressionChange = useCallback((val: number) => {
    setSuppressionLevel(val);
    dspEngine.setSuppressionLevel(val);
  }, []);

  const handleModeChange = useCallback((newMode: ProcessingMode) => {
    setMode(newMode);
    dspEngine.setMode(newMode);
  }, []);

  const handleEngineToggle = useCallback((usingStudioSound: boolean) => {
    setIsUsingStudioSound(usingStudioSound);
    // If switched to Hardware NS, adjust slightly for standard DSP behavior
    if (!usingStudioSound) {
      dspEngine.setSuppressionLevel(Math.min(suppressionLevel, 0.75));
    }
  }, [suppressionLevel]);

  const handlePresetChange = useCallback((preset: EnvironmentPreset) => {
    setSelectedPreset(preset);
    dspEngine.setPreset(preset);
  }, []);

  const handleToggleMic = useCallback(async (enableMic: boolean) => {
    setUseMic(enableMic);
    if (isListening) {
      dspEngine.stopListening();
      const ok = await dspEngine.startListening(enableMic);
      setIsListening(ok);
    }
  }, [isListening]);

  const handleToggleBypass = useCallback(() => {
    const nextBypass = !isBypassed;
    setIsBypassed(nextBypass);
    dspEngine.setBypass(nextBypass);
  }, [isBypassed]);

  const handleToggleMonitoring = useCallback(() => {
    const nextMonitoring = !speakerMonitoring;
    setSpeakerMonitoring(nextMonitoring);
    dspEngine.setSpeakerMonitoring(nextMonitoring);
  }, [speakerMonitoring]);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Universal 3-Zone Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Workspace Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Platform:</span>
            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              Android 8.0+ (API 26-35)
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Jetpack Compose & Google Studio Sound</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Generate APK</span>
            </button>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveTab('emulator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'emulator'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Interactive Workstation
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'code'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kotlin Codebase
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'docs'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Architecture & OSHA
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Live Interactive Android Emulator & Test Bench */}
        {activeTab === 'emulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Pixel-perfect Android Emulator running Jetpack Compose UI */}
            <div className="lg:col-span-5 flex justify-center">
              <AndroidEmulator
                isListening={isListening}
                telemetry={telemetry}
                suppressionLevel={suppressionLevel}
                mode={mode}
                isUsingStudioSound={isUsingStudioSound}
                onToggleListening={handleToggleListening}
                onSuppressionChange={handleSuppressionChange}
                onModeChange={handleModeChange}
                onEngineToggle={handleEngineToggle}
              />
            </div>

            {/* Right: Acoustic Lab Test Bench & Dual Spectrum FFT */}
            <div className="lg:col-span-7">
              <AcousticLab
                isListening={isListening}
                telemetry={telemetry}
                selectedPreset={selectedPreset}
                useMic={useMic}
                isBypassed={isBypassed}
                speakerMonitoring={speakerMonitoring}
                onPresetChange={handlePresetChange}
                onToggleMic={handleToggleMic}
                onToggleBypass={handleToggleBypass}
                onToggleMonitoring={handleToggleMonitoring}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Native Android Kotlin Project Viewer & Exporter */}
        {activeTab === 'code' && <KotlinCodeViewer />}

        {/* Tab 3: Technical Architecture & OSHA Regulatory Guide */}
        {activeTab === 'docs' && <ArchitectureDocs />}
      </main>

      {/* APK Generator Modal */}
      <ApkGeneratorModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Industrial Footer */}
      <footer className="border-t border-slate-800/80 bg-[#06090e] py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p>© 2026 AcousticShield Engineering · Designed for High-Decibel Industrial Environments</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Google Play Services Studio Sound API</span>
            <span aria-hidden="true">·</span>
            <span>Jetpack Compose</span>
            <span aria-hidden="true">·</span>
            <span>AudioRecord FastTrack</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
