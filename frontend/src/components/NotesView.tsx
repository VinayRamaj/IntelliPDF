import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FaGraduationCap, FaCopy, FaCheck, FaDownload, FaSyncAlt } from "react-icons/fa";
import type { UploadedDoc } from "../types";
import { generateNotesApi, getErrorMessage } from "../services/api";
import Loader from "./Loader";

interface NotesViewProps {
  doc: UploadedDoc;
  notes: string;
  onNotesGenerated: (notes: string) => void;
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function NotesView({
  doc,
  notes,
  onNotesGenerated,
  onShowToast,
}: NotesViewProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateNotesApi(doc.doc_id, doc.text);
      onNotesGenerated(result);
      onShowToast("success", "Study notes generated successfully!");
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setCopied(true);
    onShowToast("success", "Notes copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!notes) return;
    const blob = new Blob([notes], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.filename.replace(".pdf", "")}_study_notes.md`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast("info", "Downloaded study notes as Markdown file.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800">
        <Loader
          message="Compiling High-Yield Study Notes..."
          subMessage="Formatting concepts, formulas, definitions, and exam checkpoints"
        />
      </div>
    );
  }

  if (!notes) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 mb-4">
          <FaGraduationCap size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">
          Exam-Ready Study Notes
        </h3>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
          Transform {doc.filename} into comprehensive, structured revision notes with high-yield exam takeaways and self-test questions.
        </p>
        <button
          onClick={handleGenerate}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
        >
          Generate Study Notes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Study & Exam Notes
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
            High Yield
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            title="Copy notes"
          >
            {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            title="Download notes"
          >
            <FaDownload />
            <span>Export</span>
          </button>

          <button
            onClick={handleGenerate}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Regenerate notes"
          >
            <FaSyncAlt size={12} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto markdown-body">
          <ReactMarkdown>{notes}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
