# AcousticShield: AI Noise Suppression for Industrial Environments

A native Android application (Kotlin + Jetpack Compose) engineered for harsh, high-decibel environments (mechanic shops, car washes, industrial fabrication) powered by Google Studio Sound ML Audio Separation API with standard Android `NoiseSuppressor` fallback, accompanied by an interactive browser-based audio DSP test bench and Android device simulator.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction and testing experience have been aligned with user feedback.

- **Confirmed Experience Mode**: Dual-layer architecture featuring an interactive Android emulator with live microphone DSP filtering, simulated harsh environment acoustic generator, and an exportable production Kotlin + Jetpack Compose codebase.
- **Confirmed Harsh Noise Presets**: Full support for Mechanic Shop (impact wrench, pneumatic ratchet, air compressor cycle, lift hydraulics), Car Wash (high-pressure spray nozzles, dryer blower turbines), and Industrial Fabrication (metal grinding, diesel generator).
- **Confirmed Audio Pipeline**: Primary Google Play Services Studio Sound API (`com.google.android.gms.media.effect.studiosound`) running raw 16-bit PCM streaming buffers over `AudioRecord` with fallback to `android.media.audiofx.NoiseSuppressor` and `DynamicsProcessing`.
- **Mandatory Safety Protocol**: Persistent, high-contrast industrial hearing protection advisory complying with OSHA guidelines (not a substitute for certified NRR earplugs/earmuffs).

---

## 1. Overview & Core Concept

Mechanic shops and car washes operate at dangerous continuous decibel levels (85–115 dB SPL). While physical ear protection remains mandatory to prevent sensorineural hearing loss, communication among mechanics, technicians, and car wash operators is severely degraded.

**AcousticShield** captures raw microphone audio via low-latency PCM streaming, applies real-time on-device machine learning speech isolation using Google's Studio Sound API, and dynamically falls back to Android's hardware `NoiseSuppressor` when Play Services ML components are offline.

In this preview workspace, the application delivers:
1. **Interactive Android Live Audio Workstation**: Real-time Web Audio API DSP pipeline simulating the exact frequency responses, spectral gating, and dynamic compression of Studio Sound, testable with live user microphone and industrial sound synthesizers.
2. **Native Android Device Emulator**: Pixel-perfect Jetpack Compose UI with real-time level metering, OSHA hearing safety banner, Noise Reduction level slider (0–100%), and Speech Enhancement vs. Noise Suppression mode switcher.
3. **Complete Production Android Project**: Full Kotlin code viewer with 1-click file copy and complete ZIP export containing `MainActivity.kt`, `SoundProcessingService.kt`, `StudioSoundProcessor.kt`, `AudioBufferManager.kt`, Compose screens, `AndroidManifest.xml`, and Gradle build scripts.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Initial Safety & Permission Check**:
   - The user opens the app and is greeted by the prominent safety warning: *"This app is a noise suppression tool, not a substitute for physical hearing protection. In extremely loud environments, always wear certified earplugs or earmuffs to prevent hearing damage."*
   - Clear grant permission request for `RECORD_AUDIO`.
2. **Live Suppression Activation**:
   - User taps the large **Start Listening** toggle.
   - Dual real-time audio meters display **Input SPL (dB)** vs **Suppressed Output SPL (dB)**, visual spectrum waterfall, and real-time noise reduction efficiency (e.g. `-24 dB noise cut`).
3. **Tuning & Mode Selection**:
   - Mode Toggle:
     - **Speech Enhancement Mode**: Prioritizes vocal harmonics (300 Hz – 3.4 kHz bandpass, dynamic expansion for human voice isolation).
     - **Noise Reduction Mode**: Aggressive broad-spectrum gating to attenuate steady air hiss, compressor rumbles, and water jets.
   - **Noise Reduction Level**: 0% to 100% fine-resolution slider controlling attenuation depth.
4. **Harsh Environment Test Bench**:
   - Instant acoustic generator with real synthesized mechanic shop impact tools, pneumatic wrenches, and car wash pressure washers to verify suppression in real time.
5. **Codebase Inspection & Export**:
   - Dedicated tab/drawer to inspect complete, commented Kotlin source files with copy buttons and ZIP bundle download.

### Visual Identity & Theme

- **Palette**: Deep Industrial Slate (`#0B0E14`), Machinery Amber (`#F59E0B`), Safety Alert Yellow (`#EAB308`), Crisp Phosphor Cyan (`#06B6D4`), and Signal Green (`#10B981`).
- **Typography**: Display: *Plus Jakarta Sans* / *DM Sans*; Telemetry and dB meters: *JetBrains Mono / tabular-nums*.
- **Layout**: Asymmetric split console on desktop (Android phone emulator on left / live frequency telemetry & acoustic lab in center / Kotlin project inspector on right) that gracefully shifts on mobile.

---

## 3. Key Product Decisions & Trade-Offs

- **Real Audio DSP in Browser Preview**:
  - *Chosen Approach*: Web Audio API `AudioWorklet` / `ScriptProcessor` + Biquad filters, dynamics compressor, and spectral noise gate simulating Studio Sound ML.
  - *Why*: Allows immediate, tactile verification using the user's real mic and speaker in the AI Studio preview without needing a physical Android device.
- **Production-Ready Android Kotlin Codebase**:
  - *Chosen Approach*: Deliver authentic, compilable Kotlin files implementing `AudioRecord`, `AudioTrack`, `com.google.android.gms.media.effect.studiosound`, and `android.media.audiofx.NoiseSuppressor`.
  - *Why*: Directly satisfies the prompt deliverable requirement while maintaining 100% fidelity with Google's on-device ML audio recommendations.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AcousticShield Ecosystem                        │
├──────────────────────────────────┬─────────────────────────────────────┤
│   Android Native Implementation  │     Browser Audio Test Bench &      │
│     (Kotlin / Jetpack Compose)   │        Interactive Simulator        │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 1. MainActivity.kt               │ 1. Real-Time Web Audio DSP Graph    │
│    - Jetpack Compose Scaffold    │    - Live Mic Stream (getUserMedia) │
│    - Runtime RECORD_AUDIO flow   │    - Synthetic Noise Generator      │
│    - OSHA Safety Banner UI       │    - Spectral Gate & Vocal Isolator │
│ 2. StudioSoundProcessor.kt       │ 2. Dual Fast Fourier Transform HUD  │
│    - Google Play Services ML     │    - Raw Input Spectrum Waterfall   │
│    - Buffer chunking & sync      │    - Processed Output Spectrum      │
│ 3. NoiseSuppressorFallback.kt    │ 3. Calibrated SPL / dB VU Meters    │
│    - android.media.audiofx       │    - Input dB vs Output dB Delta    │
│ 4. SoundProcessingService.kt     │ 4. Native Kotlin Code Inspector     │
│    - Low-latency AudioRecord     │    - Syntax-highlighted viewer      │
│    - AudioTrack PCM 16-bit 48kHz │    - 1-Click Android Studio Export  │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### Android Native Code Structure

- `app/src/main/AndroidManifest.xml`: Permissions (`RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `FOREGROUND_SERVICE_MICROPHONE`).
- `app/src/main/java/com/acousticshield/app/MainActivity.kt`: Compose UI with safety warning, VU meters, suppression slider, and mode selector.
- `app/src/main/java/com/acousticshield/app/audio/StudioSoundProcessor.kt`: Encapsulates Google Studio Sound API with fallback to `android.media.audiofx.NoiseSuppressor`.
- `app/src/main/java/com/acousticshield/app/audio/AudioEngine.kt`: Manages `AudioRecord` (16-bit PCM, 48kHz or 16kHz mono), buffer ring queue, and low-latency `AudioTrack` playback.
- `app/src/main/java/com/acousticshield/app/ui/theme/Theme.kt`: Modern Dark Material 3 theme.
- `app/build.gradle.kts`: Dependencies for Google Play Services Studio Sound, Jetpack Compose, Coroutines.

### Browser Live Audio Graph

- **Input Node**: `navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })` or Synthetic Noise Generators.
- **DSP Filter Bank**:
  - Highpass filter (cuts sub-rumble < 80 Hz).
  - Speech Isolator Bandpass (300 Hz - 3.4 kHz formant enhancement).
  - Dynamic spectral gate (threshold scaled by Noise Reduction Slider).
  - Lookahead limiter & AGC.
- **Visualizer**: Dual WebGL/Canvas 60fps spectrum analyzers and peak RMS dB meters.
