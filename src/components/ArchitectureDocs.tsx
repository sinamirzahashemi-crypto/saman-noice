import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Layers,
  Activity,
  HardDrive,
  Volume2,
  FileCheck,
  CheckCircle,
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-500" />
          <span>AcousticShield Engineering Specifications</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Detailed technical reference on implementing real-time on-device machine learning noise suppression
          for harsh industrial environments (mechanic shops, car washes, metal fab) on Android with Kotlin and Jetpack Compose.
        </p>
      </div>

      {/* Mandatory Safety Regulation Note */}
      <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>OSHA Hearing Conservation Standard (29 CFR 1910.95)</span>
        </div>
        <p className="text-xs text-amber-100/90 leading-relaxed">
          Pneumatic impact guns (102 dB), car wash blowers (98 dB), and angle grinders (105 dB) exceed OSHA's 85 dBA 8-hour Time-Weighted Average (TWA) permissible exposure limit. Software noise suppression clarifies speech communication but cannot reduce physical sound pressure arriving at the eardrum. Personnel MUST always wear certified high-NRR physical hearing protection (earmuffs or foam plugs).
        </p>
      </div>

      {/* Audio Engine Pipeline Diagram */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>End-to-End Audio Pipeline Architecture</span>
        </h3>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{`┌────────────────────────────────────────────────────────────────────────┐
│                        ANDROID AUDIO HAL (HARDWARE)                    │
│ Microphone -> ADC -> 16-bit PCM @ 48,000 Hz, Mono Channel               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  AudioRecord (LOW-LATENCY CHUNKING)                    │
│ Buffer Frame Size: 512 samples (~10.6 ms at 48 kHz)                    │
│ Circular Ring Buffer to avoid GC pressure and UI jitter                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             GOOGLE STUDIO SOUND ML ENGINE (PRIMARY PIPELINE)           │
│ API: com.google.android.gms.media.effect.studiosound                   │
│ - On-device ML speech-noise separation neural network                  │
│ - Preserves 300 Hz - 3.4 kHz human vocal formants                      │
│ - Attenuates non-stationary mechanic clatter & continuous spray        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (If Play Services ML is unavailable)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           ANDROID NoiseSuppressor (HARDWARE DSP FALLBACK)              │
│ API: android.media.audiofx.NoiseSuppressor                             │
│ - Attached directly to AudioRecord.audioSessionId                      │
│ - Lowers hardware noise floor at the audio DSP chip level              │
│ - Supplemented by software speech bandpass filter                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   AudioTrack (FASTTRACK LOW-LATENCY)                   │
│ AudioAttributes: USAGE_MEDIA, CONTENT_TYPE_SPEECH                      │
│ Performance Mode: PERFORMANCE_MODE_LOW_LATENCY                        │
│ Output: Wired headphones or Bluetooth LE Audio headset                 │
└────────────────────────────────────────────────────────────────────────┘`}</pre>
        </div>
      </div>

      {/* Key Implementation Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>PCM Buffer Sizing & Latency</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard Android audio buffers can introduce 80–120ms of acoustic delay, causing distracting speech echo. AcousticShield achieves ultra-low latency (&lt;20ms) by configuring 512-sample buffer chunks with AudioTrack's <code className="text-amber-400">FLAG_LOW_LATENCY</code> FastPath and executing DSP loops on a dedicated Kotlin Coroutine <code className="text-amber-400">Dispatchers.IO</code> thread.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Background Foreground Service</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mechanics and car wash operators cannot leave their phone screen on while working under vehicles or holding high-pressure wands. AcousticShield implements an Android <code className="text-amber-400">ForegroundService</code> with <code className="text-amber-400">FOREGROUND_SERVICE_MICROPHONE</code> type, maintaining uninterrupted processing in the pocket.
          </p>
        </div>
      </div>
    </div>
  );
};
