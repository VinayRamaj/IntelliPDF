import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FaCopy, FaCheck, FaDownload, FaSyncAlt, FaFileAlt } from "react-icons/fa";
import type { UploadedDoc } from "../types";
import { generateSummaryApi, getErrorMessage } from "../services/api";
import Loader from "./Loader";

interface SummaryViewProps {
  doc: UploadedDoc;
  summary: string;
  onSummaryGenerated: (summary: string) => void;
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function SummaryView({
  doc,
  summary,
  onSummaryGenerated,
  onShowToast,
}: SummaryViewProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateSummaryApi(doc.doc_id, doc.text);
      onSummaryGenerated(result);
      onShowToast("success", "Summary generated successfully!");
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    onShowToast("success", "Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.filename.replace(".pdf", "")}_summary.md`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast("info", "Downloaded summary as Markdown file.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800">
        <Loader
          message="Synthesizing Executive Summary..."
          subMessage="Extracting core themes, methodology, and key takeaways"
        />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center">
        <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
          <FaFileAlt size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">
          Executive Document Summary
        </h3>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
          Generate an intelligent summary highlighting the thesis, key takeaways, core findings, and conclusions of {doc.filename}.
        </p>
        <button
          onClick={handleGenerate}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
        >
          Generate AI Summary
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
            Document Summary
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
            Gemini Powered
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            title="Copy summary"
          >
            {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            title="Download as Markdown"
          >
            <FaDownload />
            <span>Export</span>
          </button>

          <button
            onClick={handleGenerate}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Regenerate summary"
          >
            <FaSyncAlt size={12} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto markdown-body">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
