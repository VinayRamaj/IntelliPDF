import { useEffect, useState } from "react";
import { FaTimes, FaFilePdf, FaTrash, FaCheck, FaFolderOpen, FaClock } from "react-icons/fa";
import type { RecentDocSummary } from "../types";
import { fetchRecentDocuments, deleteDocumentById, getErrorMessage } from "../services/api";

interface RecentDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc: (docId: string) => void;
  currentDocId?: string;
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function RecentDocsModal({
  isOpen,
  onClose,
  onSelectDoc,
  currentDocId,
  onShowToast,
}: RecentDocsModalProps) {
  const [docs, setDocs] = useState<RecentDocSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocs();
    }
  }, [isOpen]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await fetchRecentDocuments();
      setDocs(data);
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    try {
      await deleteDocumentById(docId);
      setDocs((prev) => prev.filter((d) => d.doc_id !== docId));
      onShowToast("info", "Document removed from history.");
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FaFolderOpen />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Document Library</h3>
              <p className="text-xs text-slate-400">Select or manage previously uploaded PDFs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Loading library...
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-12">
              <FaFilePdf className="mx-auto text-4xl text-slate-600 mb-3" />
              <p className="text-slate-300 font-medium">No documents uploaded yet</p>
              <p className="text-xs text-slate-500 mt-1">Upload a PDF to get started!</p>
            </div>
          ) : (
            docs.map((doc) => {
              const isActive = doc.doc_id === currentDocId;
              const dateStr = doc.uploaded_at
                ? new Date(doc.uploaded_at * 1000).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recently";

              return (
                <div
                  key={doc.doc_id}
                  onClick={() => {
                    onSelectDoc(doc.doc_id);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer group ${
                    isActive
                      ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-100"
                      : "bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isActive ? "bg-indigo-600 text-white" : "bg-slate-800 text-rose-400 group-hover:bg-slate-700"
                      }`}
                    >
                      <FaFilePdf size={18} />
                    </div>

                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate" title={doc.filename}>
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>{doc.pages} {doc.pages === 1 ? "page" : "pages"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaClock size={10} />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                        <FaCheck size={10} /> Active
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, doc.doc_id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete document"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
