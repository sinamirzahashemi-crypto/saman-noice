import React, { useState } from 'react';
import {
  Package,
  Terminal,
  Download,
  Copy,
  Check,
  Smartphone,
  GitBranch,
  ExternalLink,
  Cpu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/zipExporter';

interface ApkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGeneratorModal: React.FC<ApkGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cli' | 'github' | 'studio'>('cli');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0d121c] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Android APK Generation & Build Console</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-semibold">
                  SDK 35 Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Compile and install AcousticShield on any Android device (API 26+).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('cli')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'cli'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Method 1: Gradle CLI (Fastest)</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'github'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Method 2: GitHub Actions CI</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'studio'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Method 3: Android Studio GUI</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <p className="leading-relaxed">
                  Building a native Android APK with Jetpack Compose and Google Studio Sound ML requires compiling Kotlin bytecodes with the Android SDK. You can build the debug APK in under 30 seconds using the pre-configured Gradle wrapper:
                </p>
              </div>

              {/* Step 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>1. Extract the project and grant execution permissions:</span>
                  <button
                    onClick={() => handleCopy('chmod +x gradlew', 1)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                  >
                    {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-slate-300 border border-slate-800">
                  <code>chmod +x gradlew</code>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>2. Assemble the Debug APK:</span>
                  <button
                    onClick={() => handleCopy('./gradlew assembleDebug', 2)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                  >
                    {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 2 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-slate-300 border border-slate-800">
                  <code>./gradlew assembleDebug</code>
                </div>
                <p className="text-[11px] text-slate-400">
                  Generated APK output: <code className="text-emerald-400 font-mono">app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>3. Install APK onto connected Android phone via ADB:</span>
                  <button
                    onClick={() => handleCopy('adb install -r app/build/outputs/apk/debug/app-debug.apk', 3)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                  >
                    {copiedIndex === 3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 3 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-slate-300 border border-slate-800">
                  <code>adb install -r app/build/outputs/apk/debug/app-debug.apk</code>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Install Automated APK Cloud Build</span>
                </div>
                <p className="leading-relaxed">
                  We have bundled a complete GitHub Actions CI/CD pipeline at <code className="text-amber-400 font-mono">.github/workflows/build-apk.yml</code>. Whenever you push to your GitHub repository:
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>Push this project to any GitHub repository.</li>
                <li>GitHub automatically spins up an Ubuntu cloud runner with JDK 17 & Android SDK.</li>
                <li>It executes <code className="font-mono text-amber-400">./gradlew assembleDebug</code>.</li>
                <li>
                  Click the <strong>Actions</strong> tab in your repository, select the latest workflow run, and download the ready-to-install <strong className="text-emerald-400">AcousticShield-app-debug.apk</strong> artifact!
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-2">
                <p className="leading-relaxed">
                  To build with the official Android IDE:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Download and extract the project ZIP archive below.</li>
                  <li>Launch Android Studio (Ladybug 2024.2+ recommended).</li>
                  <li>Click <strong>Open Project</strong> and select the unzipped directory.</li>
                  <li>Wait for Gradle Sync to index dependencies.</li>
                  <li>
                    Navigate to the menu: <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                  </li>
                  <li>Click <strong>locate</strong> in the bottom right corner to get your APK file!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Package includes Gradle 8.7, Android SDK 35, Jetpack Compose BOM, and Studio Sound ML.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Packaging Project...' : 'Download Project ZIP for APK'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
