import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  FolderTree,
  ExternalLink,
  Info,
  Terminal,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';
import { downloadAndroidProjectZip } from '../utils/zipExporter';

export const KotlinCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error('Failed to export zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Native Android (Kotlin & Jetpack Compose) Codebase</span>
          </h3>
          <p className="text-xs text-slate-400">
            Production-ready implementation with Google Studio Sound ML and Android NoiseSuppressor fallback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating ZIP...' : 'Export Android Studio Project'}</span>
          </button>
        </div>
      </div>

      {/* Main Code View Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File Tree Navigation */}
        <div className="lg:col-span-1 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <FolderTree className="w-3.5 h-3.5 text-amber-500" />
            <span>Project Tree</span>
          </div>

          <div className="space-y-1">
            {ANDROID_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium transition-all flex flex-col ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-semibold truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Window */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          {/* Editor Header */}
          <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-amber-400 font-semibold">{selectedFile.name}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{selectedFile.path}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {selectedFile.language}
            </span>
          </div>

          {/* Architecture Rationale Callout */}
          <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{selectedFile.description}</p>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="p-4 overflow-x-auto max-h-[580px] font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
