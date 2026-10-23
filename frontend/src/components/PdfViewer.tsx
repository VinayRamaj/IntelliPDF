import { useState } from "react";
import { FaFilePdf, FaExternalLinkAlt, FaDownload, FaExpandAlt, FaCompressAlt } from "react-icons/fa";
import type { UploadedDoc } from "../types";

interface PdfViewerProps {
  doc: UploadedDoc;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function PdfViewer({ doc, isExpanded, onToggleExpand }: PdfViewerProps) {
  const [iframeError, setIframeError] = useState(false);
  const pdfFullUrl = doc.url.startsWith("http")
    ? doc.url
    : `http://127.0.0.1:8000${doc.url}`;

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Viewer Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
            <FaFilePdf size={16} />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate" title={doc.filename}>
              {doc.filename}
            </h4>
            <p className="text-[11px] text-slate-400">
              {doc.pages} {doc.pages === 1 ? "page" : "pages"} • {(doc.characters / 1000).toFixed(1)}k chars
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={pdfFullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            title="Open PDF in new browser tab"
          >
            <FaExternalLinkAlt size={12} />
            <span className="hidden sm:inline">New Tab</span>
          </a>

          <a
            href={pdfFullUrl}
            download={doc.filename}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            title="Download PDF"
          >
            <FaDownload size={12} />
          </a>

          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
            title={isExpanded ? "Restore split view" : "Maximize PDF view"}
          >
            {isExpanded ? <FaCompressAlt size={12} /> : <FaExpandAlt size={12} />}
          </button>
        </div>
      </div>

      {/* Embedded PDF Frame */}
      <div className="relative flex-1 w-full bg-slate-950 min-h-[500px]">
        {iframeError ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <FaFilePdf className="text-4xl text-rose-500/50 mb-3" />
            <p className="text-slate-300 font-medium text-sm">Inline preview unavailable</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Your browser may block embedding this PDF file directly.
            </p>
            <a
              href={pdfFullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
            >
              Open PDF in New Window
            </a>
          </div>
        ) : (
          <iframe
            src={`${pdfFullUrl}#toolbar=1&navpanes=0`}
            title={doc.filename}
            className="w-full h-full border-0"
            onError={() => setIframeError(true)}
          />
        )}
      </div>
    </div>
  );
}
