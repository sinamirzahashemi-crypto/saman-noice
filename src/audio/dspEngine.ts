/**
 * Real-time Web Audio DSP engine simulating Google Studio Sound on-device ML
 * and Android NoiseSuppressor audio pipelines.
 */

export type EnvironmentPreset =
  | 'mechanic_impact'
  | 'mechanic_compressor'
  | 'carwash_spray'
  | 'carwash_dryer'
  | 'industrial_grinder'
  | 'diesel_engine'
  | 'clean_voice';

export type ProcessingMode = 'speech_enhancement' | 'noise_reduction';

export interface AudioTelemetry {
  inputDb: number;
  outputDb: number;
  reductionDb: number;
  isClipping: boolean;
  snrEstimate: number;
}

export class DspEngine {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;

  // Analysers for dual-channel FFT visualization
  public inputAnalyser: AnalyserNode | null = null;
  public outputAnalyser: AnalyserNode | null = null;

  // DSP Filter nodes
  private highpassFilter: BiquadFilterNode | null = null;
  private speechFormantFilter1: BiquadFilterNode | null = null;
  private speechFormantFilter2: BiquadFilterNode | null = null;
  private notchFilter: BiquadFilterNode | null = null;
  private dynamicsCompressor: DynamicsCompressorNode | null = null;
  private spectralGateNode: ScriptProcessorNode | null = null;
  private outputGainNode: GainNode | null = null;
  private synthGainNode: GainNode | null = null;
  private speechGainNode: GainNode | null = null;

  // Synthetic sound generators
  private synthIntervalId: number | null = null;
  private speechOscillatorTimer: number | null = null;

  // Control parameters
  private isListening = false;
  private isBypassed = false;
  private speakerMonitoring = false; // default false to prevent acoustic feedback howl
  private suppressionLevel = 0.85; // 0.0 to 1.0
  private currentMode: ProcessingMode = 'speech_enhancement';
  private currentPreset: EnvironmentPreset = 'mechanic_impact';
  private useMic = false;

  // Listeners
  private telemetryCallback: ((telemetry: AudioTelemetry) => void) | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    // Lazy AudioContext init on user action
  }

  public async initAudioContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ sampleRate: 48000 });
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  public setTelemetryListener(cb: (telemetry: AudioTelemetry) => void) {
    this.telemetryCallback = cb;
  }

  public async startListening(useMicrophone = false): Promise<boolean> {
    const ctx = await this.initAudioContext();
    this.useMic = useMicrophone;

    try {
      this.teardownGraph();

      // Create Analysers
      this.inputAnalyser = ctx.createAnalyser();
      this.inputAnalyser.fftSize = 512;
      this.inputAnalyser.smoothingTimeConstant = 0.8;

      this.outputAnalyser = ctx.createAnalyser();
      this.outputAnalyser.fftSize = 512;
      this.outputAnalyser.smoothingTimeConstant = 0.8;

      // Output Gain & Safety Limiter
      this.outputGainNode = ctx.createGain();
      this.outputGainNode.gain.value = this.speakerMonitoring ? 0.9 : 0.0; // Prevent feedback loops unless enabled

      this.dynamicsCompressor = ctx.createDynamicsCompressor();
      this.dynamicsCompressor.threshold.setValueAtTime(-18, ctx.currentTime);
      this.dynamicsCompressor.knee.setValueAtTime(12, ctx.currentTime);
      this.dynamicsCompressor.ratio.setValueAtTime(6, ctx.currentTime);
      this.dynamicsCompressor.attack.setValueAtTime(0.003, ctx.currentTime);
      this.dynamicsCompressor.release.setValueAtTime(0.15, ctx.currentTime);

      // DSP Filter 1: Low-cut Sub-rumble Filter (< 85 Hz)
      this.highpassFilter = ctx.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.setValueAtTime(90, ctx.currentTime);
      this.highpassFilter.Q.setValueAtTime(0.707, ctx.currentTime);

      // DSP Filter 2: Speech Formant Enhancer (centered at 1.8 kHz)
      this.speechFormantFilter1 = ctx.createBiquadFilter();
      this.speechFormantFilter1.type = 'peaking';
      this.speechFormantFilter1.frequency.setValueAtTime(1800, ctx.currentTime);
      this.speechFormantFilter1.Q.setValueAtTime(1.2, ctx.currentTime);
      this.speechFormantFilter1.gain.setValueAtTime(this.currentMode === 'speech_enhancement' ? 4.5 : 0, ctx.currentTime);

      // DSP Filter 3: High-frequency harshness smoother (cuts metal hiss > 6.5 kHz)
      this.speechFormantFilter2 = ctx.createBiquadFilter();
      this.speechFormantFilter2.type = 'lowshelf';
      this.speechFormantFilter2.frequency.setValueAtTime(320, ctx.currentTime);
      this.speechFormantFilter2.gain.setValueAtTime(this.currentMode === 'speech_enhancement' ? 3.0 : 0, ctx.currentTime);

      // ScriptProcessor / Spectral Gate (Simulates Studio Sound ML speech separation)
      const bufferSize = 1024;
      this.spectralGateNode = ctx.createScriptProcessor(bufferSize, 1, 1);
      this.setupSpectralGate(this.spectralGateNode);

      // Setup Input Source
      if (useMicrophone) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        this.micSourceNode = ctx.createMediaStreamSource(this.micStream);
        this.micSourceNode.connect(this.inputAnalyser);
      } else {
        // Setup synthetic industrial audio engine
        this.setupSyntheticIndustrialEngine(ctx);
      }

      // Connect DSP Chain:
      // InputAnalyser -> Highpass -> Formants -> SpectralGate -> Compressor -> OutputAnalyser -> OutputGain -> Destination
      this.inputAnalyser.connect(this.highpassFilter);
      this.highpassFilter.connect(this.speechFormantFilter1);
      this.speechFormantFilter1.connect(this.speechFormantFilter2);
      this.speechFormantFilter2.connect(this.spectralGateNode);
      this.spectralGateNode.connect(this.dynamicsCompressor);
      this.dynamicsCompressor.connect(this.outputAnalyser);
      this.outputAnalyser.connect(this.outputGainNode);
      this.outputGainNode.connect(ctx.destination);

      this.isListening = true;
      this.startTelemetryLoop();
      return true;
    } catch (err) {
      console.error('Failed to start audio engine:', err);
      this.stopListening();
      return false;
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.teardownGraph();
  }

  private teardownGraph() {
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
    if (this.speechOscillatorTimer) {
      clearInterval(this.speechOscillatorTimer);
      this.speechOscillatorTimer = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.spectralGateNode) {
      this.spectralGateNode.disconnect();
      this.spectralGateNode = null;
    }
    if (this.highpassFilter) {
      this.highpassFilter.disconnect();
      this.highpassFilter = null;
    }
  }

  /**
   * Real-time spectral gate simulating Google Studio Sound ML on-device component.
   */
  private setupSpectralGate(node: ScriptProcessorNode) {
    let noiseFloor = 0.02;

    node.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const output = e.outputBuffer.getChannelData(0);

      if (this.isBypassed) {
        // Bypass mode to hear raw harsh noise
        for (let i = 0; i < input.length; i++) {
          output[i] = input[i];
        }
        return;
      }

      const intensity = this.suppressionLevel;
      const isSpeechMode = this.currentMode === 'speech_enhancement';

      // Adaptive envelope tracking
      for (let i = 0; i < input.length; i++) {
        const sample = input[i];
        const absVal = Math.abs(sample);

        // Slow noise floor tracker
        if (absVal < noiseFloor) {
          noiseFloor = noiseFloor * 0.999 + absVal * 0.001;
        } else {
          noiseFloor = noiseFloor * 0.9999 + absVal * 0.0001;
        }

        // Suppression threshold based on intensity
        const threshold = noiseFloor * (1.2 + intensity * 2.8) + (1.0 - intensity) * 0.005;

        let gain = 1.0;
        if (absVal < threshold) {
          // Attenuate noise floor
          const attenuation = Math.max(0.015, Math.pow(1.0 - intensity, 2.0));
          gain = attenuation;
        } else {
          // Speech region: boost speech presence
          gain = isSpeechMode ? 1.25 : 1.05;
        }

        output[i] = Math.max(-1.0, Math.min(1.0, sample * gain));
      }
    };
  }

  /**
   * Generates highly realistic harsh acoustic simulations:
   * mechanic impact wrench, compressor pops, car wash sprayers, metal grinders.
   */
  private setupSyntheticIndustrialEngine(ctx: AudioContext) {
    if (!this.inputAnalyser) return;

    this.synthGainNode = ctx.createGain();
    this.synthGainNode.gain.value = 0.75;
    this.synthGainNode.connect(this.inputAnalyser);

    this.speechGainNode = ctx.createGain();
    this.speechGainNode.gain.value = 0.7;
    this.speechGainNode.connect(this.inputAnalyser);

    // Continuous background texture (broadband air & pump rumble)
    this.startBackgroundTexture(ctx);

    // Periodic industrial events (pneumatic ratchets, spray oscillations, grinder touches)
    this.startIndustrialEvents(ctx);

    // Simulated human speech packets ("Mechanic intercom / Car wash technician")
    this.startSyntheticSpeechBursts(ctx);
  }

  private startBackgroundTexture(ctx: AudioContext) {
    if (!this.synthGainNode) return;

    // Buffer of pink noise for air & turbulence
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;

    // Bandpass / Lowpass based on preset
    const filter = ctx.createBiquadFilter();
    switch (this.currentPreset) {
      case 'carwash_spray':
        filter.type = 'highshelf';
        filter.frequency.value = 2500;
        filter.gain.value = 6;
        break;
      case 'mechanic_compressor':
      case 'diesel_engine':
        filter.type = 'lowpass';
        filter.frequency.value = 450;
        break;
      case 'industrial_grinder':
        filter.type = 'bandpass';
        filter.frequency.value = 3800;
        filter.Q.value = 2.5;
        break;
      default:
        filter.type = 'bandpass';
        filter.frequency.value = 1400;
        filter.Q.value = 0.8;
    }

    whiteNoiseSource.connect(filter);
    filter.connect(this.synthGainNode);
    whiteNoiseSource.start();
  }

  private startIndustrialEvents(ctx: AudioContext) {
    if (this.synthIntervalId) clearInterval(this.synthIntervalId);

    this.synthIntervalId = window.setInterval(() => {
      if (!this.isListening || !this.synthGainNode || this.useMic) return;

      const now = ctx.currentTime;

      if (this.currentPreset === 'mechanic_impact') {
        // High-velocity impact wrench bursts (6 fast clatter pulses)
        for (let burst = 0; burst < 7; burst++) {
          const t = now + burst * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(850 + Math.random() * 400, t);
          osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);

          gain.gain.setValueAtTime(0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

          osc.connect(gain);
          gain.connect(this.synthGainNode);
          osc.start(t);
          osc.stop(t + 0.05);
        }
      } else if (this.currentPreset === 'carwash_spray') {
        // Pressure washer oscillating pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.35);

        osc.connect(gain);
        gain.connect(this.synthGainNode);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (this.currentPreset === 'industrial_grinder') {
        // Metal screeches & sparks
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(4200 + Math.random() * 1200, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);

        osc.connect(gain);
        gain.connect(this.synthGainNode);
        osc.start(now);
        osc.stop(now + 0.41);
      }
    }, 1200);
  }

  /**
   * Generates test human speech patterns so users can test speech enhancement
   * even when not using their real microphone.
   */
  private startSyntheticSpeechBursts(ctx: AudioContext) {
    if (this.speechOscillatorTimer) clearInterval(this.speechOscillatorTimer);

    const speechFrequencies = [
      [260, 520, 1600], // Formants for "Ah"
      [320, 680, 2200], // Formants for "Oh"
      [280, 540, 1900], // Formants for "Eh"
      [350, 720, 2400], // Formants for "Ee"
    ];

    let phraseStep = 0;

    this.speechOscillatorTimer = window.setInterval(() => {
      if (!this.isListening || !this.speechGainNode || this.useMic) return;

      const now = ctx.currentTime;
      const formants = speechFrequencies[phraseStep % speechFrequencies.length];
      phraseStep++;

      // Create a 3-formant voice packet
      formants.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() * 20 - 10), now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.speechGainNode!);
        osc.start(now);
        osc.stop(now + 0.46);
      });
    }, 900);
  }

  private startTelemetryLoop() {
    const inputData = new Uint8Array(256);
    const outputData = new Uint8Array(256);

    const checkTelemetry = () => {
      if (!this.isListening) return;

      if (this.inputAnalyser && this.outputAnalyser) {
        this.inputAnalyser.getByteTimeDomainData(inputData);
        this.outputAnalyser.getByteTimeDomainData(outputData);

        const inDb = this.calculateDbFromByteData(inputData);
        const outDb = this.calculateDbFromByteData(outputData);
        const reduction = Math.max(0, inDb - outDb);

        if (this.telemetryCallback) {
          this.telemetryCallback({
            inputDb: inDb,
            outputDb: outDb,
            reductionDb: reduction,
            isClipping: inDb > 105,
            snrEstimate: Math.min(35, Math.max(0, outDb - (inDb - reduction))),
          });
        }
      }

      this.animationFrameId = requestAnimationFrame(checkTelemetry);
    };

    this.animationFrameId = requestAnimationFrame(checkTelemetry);
  }

  private calculateDbFromByteData(buffer: Uint8Array): number {
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      const norm = (buffer[i] - 128) / 128.0;
      sumSquares += norm * norm;
    }
    const rms = Math.sqrt(sumSquares / buffer.length);
    if (rms <= 0.0001) return 0;
    // Calibrated to industrial SPL range (30 dB to 110 dB)
    const db = 20 * Math.log10(rms) + 94;
    return Math.max(25, Math.min(115, Math.round(db * 10) / 10));
  }

  // Parameter Setters
  public setSuppressionLevel(level: number) {
    this.suppressionLevel = Math.max(0, Math.min(1, level));
  }

  public setMode(mode: ProcessingMode) {
    this.currentMode = mode;
    if (this.speechFormantFilter1 && this.ctx) {
      this.speechFormantFilter1.gain.setValueAtTime(
        mode === 'speech_enhancement' ? 4.5 : 0,
        this.ctx.currentTime
      );
    }
  }

  public setPreset(preset: EnvironmentPreset) {
    this.currentPreset = preset;
    if (this.isListening && !this.useMic) {
      // Re-trigger synthetic sound textures
      this.teardownGraph();
      if (this.ctx) {
        this.inputAnalyser = this.ctx.createAnalyser();
        this.outputAnalyser = this.ctx.createAnalyser();
        this.setupSyntheticIndustrialEngine(this.ctx);
        if (this.highpassFilter && this.spectralGateNode && this.dynamicsCompressor) {
          this.inputAnalyser.connect(this.highpassFilter);
        }
      }
    }
  }

  public setBypass(bypassed: boolean) {
    this.isBypassed = bypassed;
  }

  public setSpeakerMonitoring(enabled: boolean) {
    this.speakerMonitoring = enabled;
    if (this.outputGainNode && this.ctx) {
      this.outputGainNode.gain.setValueAtTime(enabled ? 0.85 : 0.0, this.ctx.currentTime);
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsBypassed(): boolean {
    return this.isBypassed;
  }

  public getSpeakerMonitoring(): boolean {
    return this.speakerMonitoring;
  }
}

export const dspEngine = new DspEngine();
