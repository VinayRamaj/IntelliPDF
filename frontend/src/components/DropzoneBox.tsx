import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaFilePdf, FaClock, FaBolt, FaGraduationCap, FaLayerGroup, FaComments } from "react-icons/fa";
import type { RecentDocSummary, UploadedDoc } from "../types";
import { uploadPdfFile, getErrorMessage, fetchDocumentById } from "../services/api";
import Loader from "./Loader";

interface DropzoneBoxProps {
  onDocLoaded: (doc: UploadedDoc) => void;
  recentDocs: RecentDocSummary[];
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function DropzoneBox({
  onDocLoaded,
  recentDocs,
  onShowToast,
}: DropzoneBoxProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        onShowToast("error", "Please upload a valid PDF document (.pdf).");
        return;
      }

      setUploading(true);

      try {
        const doc = await uploadPdfFile(file);
        onDocLoaded(doc);
        onShowToast("success", `"${file.name}" uploaded successfully!`);
      } catch (err) {
        onShowToast("error", getErrorMessage(err));
      } finally {
        setUploading(false);
      }
    },
    [onDocLoaded, onShowToast]
  );

  const handleSelectRecent = async (docId: string) => {
    setUploading(true);
    try {
      const doc = await fetchDocumentById(docId);
      onDocLoaded(doc);
      onShowToast("info", `Opened "${doc.filename}"`);
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-14 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
          <FaBolt className="text-indigo-400" />
          <span>Next-Gen Document Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
          Study Smarter with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            IntelliPDF
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Upload any PDF to unlock split-screen reading, conversational document chat, exam-ready study notes, interactive quizzes, and 3D flashcards.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <FaFilePdf className="text-rose-400" /> Split-Screen Viewer
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <FaComments className="text-indigo-400" /> Conversational Chat
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <FaGraduationCap className="text-amber-400" /> Interactive Quizzes
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <FaLayerGroup className="text-cyan-400" /> 3D Flashcards
          </span>
        </div>
      </div>

      {/* Upload Box or Loader */}
      {uploading ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-indigo-500/30 backdrop-blur-md shadow-2xl">
          <Loader
            message="Processing and parsing PDF..."
            subMessage="Extracting text layers, counting pages, and preparing AI workspace"
          />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`relative group rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 backdrop-blur-md shadow-2xl ${
            isDragActive
              ? "border-indigo-400 bg-indigo-950/30 scale-[1.01]"
              : "border-slate-700/80 hover:border-indigo-500/60 bg-slate-900/40 hover:bg-slate-900/70"
          }`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/40 transition-all" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all shadow-inner">
                <FaCloudUploadAlt size={42} />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
              {isDragActive ? "Drop your PDF right here" : "Drag & Drop your PDF here"}
            </h3>

            <p className="text-sm text-slate-400 mb-5">
              or <span className="text-indigo-400 font-semibold underline underline-offset-4">browse files</span> from your computer
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>PDF format</span>
              <span>•</span>
              <span>Up to 25 MB</span>
              <span>•</span>
              <span>Instant AI processing</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Launch: Recent Documents */}
      {recentDocs.length > 0 && !uploading && (
        <div className="mt-10">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FaClock size={12} />
            <span>Or continue with recently uploaded documents</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentDocs.slice(0, 3).map((d) => (
              <button
                key={d.doc_id}
                onClick={() => handleSelectRecent(d.doc_id)}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors shrink-0">
                  <FaFilePdf size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors" title={d.filename}>
                    {d.filename}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {d.pages} {d.pages === 1 ? "page" : "pages"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
