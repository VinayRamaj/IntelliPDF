import { useState, useEffect } from "react";
import Header from "../components/Header";
import DropzoneBox from "../components/DropzoneBox";
import DocumentWorkspace from "../components/DocumentWorkspace";
import RecentDocsModal from "../components/RecentDocsModal";
import { ToastContainer } from "../components/Toast";
import type { ToastMessage } from "../components/Toast";
import type { RecentDocSummary, UploadedDoc } from "../types";
import { fetchRecentDocuments, fetchDocumentById, getErrorMessage } from "../services/api";

export default function Home() {
  const [currentDoc, setCurrentDoc] = useState<UploadedDoc | null>(null);
  const [recentDocs, setRecentDocs] = useState<RecentDocSummary[]>([]);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load recent documents on mount
  useEffect(() => {
    loadRecentDocs();
  }, []);

  const loadRecentDocs = async () => {
    try {
      const data = await fetchRecentDocuments();
      setRecentDocs(data);
    } catch {
      // Non-blocking in case backend is starting
    }
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDocLoaded = (doc: UploadedDoc) => {
    setCurrentDoc(doc);
    loadRecentDocs();
  };

  const handleSelectRecentDoc = async (docId: string) => {
    try {
      const doc = await fetchDocumentById(docId);
      setCurrentDoc(doc);
      showToast("info", `Opened "${doc.filename}"`);
    } catch (err) {
      showToast("error", getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Top Application Header */}
      <Header
        currentDoc={currentDoc}
        onOpenRecent={() => setIsRecentOpen(true)}
        onNewUpload={() => setCurrentDoc(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {!currentDoc ? (
          <DropzoneBox
            onDocLoaded={handleDocLoaded}
            recentDocs={recentDocs}
            onShowToast={showToast}
          />
        ) : (
          <DocumentWorkspace
            doc={currentDoc}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Recent Documents Library Modal */}
      <RecentDocsModal
        isOpen={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
        onSelectDoc={handleSelectRecentDoc}
        currentDocId={currentDoc?.doc_id}
        onShowToast={showToast}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}