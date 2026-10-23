import { FaFilePdf, FaHistory, FaPlus, FaGithub } from "react-icons/fa";
import type { UploadedDoc } from "../types";

interface HeaderProps {
  currentDoc: UploadedDoc | null;
  onOpenRecent: () => void;
  onNewUpload: () => void;
}

export default function Header({ currentDoc, onOpenRecent, onNewUpload }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25">
            <FaFilePdf className="text-white text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                IntelliPDF
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI Study Assistant & Document Intelligence
            </p>
          </div>
        </div>

        {/* Active Doc Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentDoc && (
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <FaFilePdf className="text-rose-400 shrink-0" />
              <span className="font-medium max-w-[180px] truncate" title={currentDoc.filename}>
                {currentDoc.filename}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-indigo-400 font-semibold">{currentDoc.pages} pages</span>
            </div>
          )}

          <button
            onClick={onOpenRecent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all hover:border-indigo-500/50 shadow-sm"
            title="View recent uploaded documents"
          >
            <FaHistory className="text-indigo-400" />
            <span className="hidden sm:inline">Recent Docs</span>
          </button>

          {currentDoc && (
            <button
              onClick={onNewUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              title="Upload new document"
            >
              <FaPlus size={10} />
              <span>New PDF</span>
            </button>
          )}

          <a
            href="https://github.com/VinayRamaj/IntelliPDF"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="View on GitHub"
          >
            <FaGithub size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
