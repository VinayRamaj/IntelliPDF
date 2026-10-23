import { useState } from "react";
import {
  FaComments,
  FaFileAlt,
  FaGraduationCap,
  FaQuestionCircle,
  FaLayerGroup,
  FaGlobe,
  FaColumns,
  FaExclamationTriangle,
} from "react-icons/fa";
import type { ActiveTab, Flashcard, QuizQuestion, UploadedDoc } from "../types";
import PdfViewer from "./PdfViewer";
import ChatView from "./ChatView";
import SummaryView from "./SummaryView";
import NotesView from "./NotesView";
import QuizView from "./QuizView";
import FlashcardView from "./FlashcardView";
import TranslateView from "./TranslateView";

interface DocumentWorkspaceProps {
  doc: UploadedDoc;
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function DocumentWorkspace({ doc, onShowToast }: DocumentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [showPdf, setShowPdf] = useState(true);
  const [pdfExpanded, setPdfExpanded] = useState(false);

  // Cached state per document
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [translation, setTranslation] = useState("");

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "chat", label: "Chat AI", icon: <FaComments size={14} />, color: "text-indigo-400" },
    { id: "summary", label: "Summary", icon: <FaFileAlt size={13} />, color: "text-purple-400" },
    { id: "notes", label: "Study Notes", icon: <FaGraduationCap size={14} />, color: "text-amber-400" },
    { id: "quiz", label: "Quiz", icon: <FaQuestionCircle size={14} />, color: "text-emerald-400" },
    { id: "flashcards", label: "Flashcards", icon: <FaLayerGroup size={14} />, color: "text-cyan-400" },
    { id: "translate", label: "Translate", icon: <FaGlobe size={14} />, color: "text-pink-400" },
  ];

  return (
    <div className="flex-1 flex flex-col p-3 lg:p-6 max-w-[1700px] mx-auto w-full animate-fade-in">
      {/* Alert for Scanned PDF without text */}
      {doc.is_scanned && (
        <div className="mb-4 flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <FaExclamationTriangle className="text-amber-400 shrink-0 text-sm" />
          <span>
            <strong>Notice:</strong> This document appears to be scanned or contains image-only pages with minimal extractable text. AI responses may have limited context.
          </span>
        </div>
      )}

      {/* Main Workspace Grid (Split Screen) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-[calc(100vh-140px)]">
        {/* Left Column: Embedded PDF Viewer */}
        {showPdf && (
          <div
            className={`transition-all duration-300 ${
              pdfExpanded
                ? "lg:col-span-12 h-[calc(100vh-140px)]"
                : "lg:col-span-5 xl:col-span-6 h-[550px] lg:h-[calc(100vh-140px)]"
            }`}
          >
            <PdfViewer
              doc={doc}
              isExpanded={pdfExpanded}
              onToggleExpand={() => setPdfExpanded((prev) => !prev)}
            />
          </div>
        )}

        {/* Right Column: AI Assistant Suite */}
        {(!pdfExpanded || !showPdf) && (
          <div
            className={`flex flex-col h-[calc(100vh-140px)] transition-all duration-300 ${
              !showPdf
                ? "lg:col-span-12"
                : "lg:col-span-7 xl:col-span-6"
            }`}
          >
            {/* Navigation Tabs Bar */}
            <div className="flex items-center justify-between gap-2 mb-3 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-slate-800 text-white shadow-md border border-slate-700/80"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      <span className={isActive ? tab.color : "text-slate-400"}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Split-Screen Toggle Control */}
              <button
                onClick={() => setShowPdf((prev) => !prev)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors shrink-0"
                title={showPdf ? "Hide PDF pane" : "Show PDF pane"}
              >
                <FaColumns size={12} className={showPdf ? "text-indigo-400" : "text-slate-500"} />
                <span>{showPdf ? "Hide PDF" : "Split View"}</span>
              </button>
            </div>

            {/* Active Tab Panel */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "chat" && (
                <ChatView doc={doc} onShowToast={onShowToast} />
              )}
              {activeTab === "summary" && (
                <SummaryView
                  doc={doc}
                  summary={summary}
                  onSummaryGenerated={setSummary}
                  onShowToast={onShowToast}
                />
              )}
              {activeTab === "notes" && (
                <NotesView
                  doc={doc}
                  notes={notes}
                  onNotesGenerated={setNotes}
                  onShowToast={onShowToast}
                />
              )}
              {activeTab === "quiz" && (
                <QuizView
                  doc={doc}
                  quiz={quiz}
                  onQuizGenerated={setQuiz}
                  onShowToast={onShowToast}
                />
              )}
              {activeTab === "flashcards" && (
                <FlashcardView
                  doc={doc}
                  flashcards={flashcards}
                  onFlashcardsGenerated={setFlashcards}
                  onShowToast={onShowToast}
                />
              )}
              {activeTab === "translate" && (
                <TranslateView
                  doc={doc}
                  translation={translation}
                  onTranslationGenerated={(text) => setTranslation(text)}
                  onShowToast={onShowToast}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
