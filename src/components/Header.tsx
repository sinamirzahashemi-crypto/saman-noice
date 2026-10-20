import React from 'react';
import { Package } from 'lucide-react';

interface HeaderProps {
  activeTab: 'emulator' | 'code' | 'docs';
  onTabChange: (tab: 'emulator' | 'code' | 'docs') => void;
  onOpenApkModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onOpenApkModal }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-[#090d15]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a href="/" className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
        AcousticShield
      </a>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onTabChange('emulator')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'emulator' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Live Workstation
        </button>
        <button
          onClick={() => onTabChange('code')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'code' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Kotlin Codebase
        </button>
        <button
          onClick={onOpenApkModal}
          className="hover:text-amber-400 text-slate-300 font-medium transition-colors whitespace-nowrap shrink-0"
        >
          Generate APK
        </button>
        <button
          onClick={() => onTabChange('docs')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'docs' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Architecture Guide
        </button>
        <a
          href="https://developers.google.com/android/reference/packages"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Studio Sound Docs
        </a>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenApkModal}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Generate APK</span>
        </button>
      </div>
    </header>
  );
};
