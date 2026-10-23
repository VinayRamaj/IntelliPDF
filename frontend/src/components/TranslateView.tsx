import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FaGlobe, FaCopy, FaCheck, FaDownload } from "react-icons/fa";
import type { UploadedDoc } from "../types";
import { translatePdfApi, getErrorMessage } from "../services/api";
import Loader from "./Loader";

interface TranslateViewProps {
  doc: UploadedDoc;
  translation: string;
  onTranslationGenerated: (text: string, lang: string) => void;
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { name: "Hindi", code: "Hindi", flag: "🇮🇳" },
  { name: "Marathi", code: "Marathi", flag: "🇮🇳" },
  { name: "Spanish", code: "Spanish", flag: "🇪🇸" },
  { name: "French", code: "French", flag: "🇫🇷" },
  { name: "German", code: "German", flag: "🇩🇪" },
  { name: "Japanese", code: "Japanese", flag: "🇯🇵" },
  { name: "Chinese (Simplified)", code: "Chinese", flag: "🇨🇳" },
  { name: "Arabic", code: "Arabic", flag: "🇸🇦" },
  { name: "Russian", code: "Russian", flag: "🇷🇺" },
  { name: "Portuguese", code: "Portuguese", flag: "🇧🇷" },
];

export default function TranslateView({
  doc,
  translation,
  onTranslationGenerated,
  onShowToast,
}: TranslateViewProps) {
  const [language, setLanguage] = useState("Hindi");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const result = await translatePdfApi(language, doc.doc_id, doc.text);
      onTranslationGenerated(result, language);
      onShowToast("success", `Translated into ${language}!`);
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation);
    setCopied(true);
    onShowToast("success", "Translation copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!translation) return;
    const blob = new Blob([translation], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.filename.replace(".pdf", "")}_${language}.md`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast("info", `Downloaded ${language} translation.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800">
        <Loader
          message={`Translating into ${language}...`}
          subMessage="Preserving document context, formatting, headings, and nuance"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <FaGlobe className="text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">
            Document Translation
          </span>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleTranslate}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {translation ? "Translate Again" : "Translate"}
          </button>
        </div>

        {translation && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              title="Copy translation"
            >
              {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              title="Download translated markdown"
            >
              <FaDownload />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {!translation ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
            <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4">
              <FaGlobe size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              Multilingual Translation
            </h3>
            <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
              Translate {doc.filename} into Hindi, Marathi, Spanish, German, French, and more while maintaining document structure.
            </p>
            <button
              onClick={handleTranslate}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              Translate into {language}
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto markdown-body">
            <ReactMarkdown>{translation}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
