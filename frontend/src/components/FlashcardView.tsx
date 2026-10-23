import { useState } from "react";
import { FaLayerGroup, FaSyncAlt, FaArrowLeft, FaArrowRight, FaCheckCircle, FaRandom, FaUndo } from "react-icons/fa";
import type { Flashcard, UploadedDoc } from "../types";
import { generateFlashcardsApi, getErrorMessage } from "../services/api";
import Loader from "./Loader";

interface FlashcardViewProps {
  doc: UploadedDoc;
  flashcards: Flashcard[];
  onFlashcardsGenerated: (cards: Flashcard[]) => void;
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function FlashcardView({
  doc,
  flashcards,
  onFlashcardsGenerated,
  onShowToast,
}: FlashcardViewProps) {
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const cards = await generateFlashcardsApi(8, doc.doc_id, doc.text);
      onFlashcardsGenerated(cards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds(new Set());
      onShowToast("success", "Study flashcards generated!");
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    onFlashcardsGenerated(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    onShowToast("info", "Flashcard deck shuffled!");
  };

  const toggleMastered = (cardId: number) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800">
        <Loader
          message="Creating Flashcards Deck..."
          subMessage="Extracting core concepts, formulas, and high-yield definitions"
        />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center">
        <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4">
          <FaLayerGroup size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">
          Smart Active-Recall Flashcards
        </h3>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
          Master the concepts in {doc.filename} through 3D interactive flip cards designed for active recall and revision.
        </p>
        <button
          onClick={handleGenerate}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
        >
          Generate Flashcard Deck
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const isMastered = masteredIds.has(currentCard.id);

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
            Mastered: {masteredIds.size} / {flashcards.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            title="Shuffle deck"
          >
            <FaRandom size={11} />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={handleGenerate}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Regenerate flashcards"
          >
            <FaSyncAlt size={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8">
        <div
          onClick={handleFlip}
          className="perspective-1000 w-full max-w-lg h-72 cursor-pointer select-none group"
        >
          <div
            className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-3xl ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            <div className="absolute inset-0 backface-hidden w-full h-full p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-700/80 shadow-2xl flex flex-col justify-between group-hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentCard.category || "Concept Prompt"}
                </span>
                <span className="text-xs text-slate-500">Click to flip</span>
              </div>

              <div className="my-auto text-center">
                <p className="text-lg lg:text-xl font-bold text-slate-100 leading-relaxed">
                  {currentCard.front}
                </p>
              </div>

              <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                <FaUndo size={10} />
                <span>Tap anywhere to reveal answer</span>
              </div>
            </div>

            <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/50 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Definition & Explanation
                </span>
                <span className="text-xs text-indigo-300">Answer</span>
              </div>

              <div className="my-auto overflow-y-auto max-h-44 pr-1">
                <p className="text-sm lg:text-base text-slate-200 leading-relaxed font-normal">
                  {currentCard.back}
                </p>
              </div>

              <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <FaUndo size={10} />
                <span>Tap to flip back</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full max-w-lg mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
          >
            <FaArrowLeft size={10} />
            <span>Previous</span>
          </button>

          <button
            onClick={() => toggleMastered(currentCard.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isMastered
                ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-300"
                : "bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            <FaCheckCircle className={isMastered ? "text-emerald-400" : "text-slate-500"} />
            <span>{isMastered ? "Mastered" : "Mark Mastered"}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
          >
            <span>Next</span>
            <FaArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
