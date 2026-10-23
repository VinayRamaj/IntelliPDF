import { useState } from "react";
import confetti from "canvas-confetti";
import { FaQuestionCircle, FaCheck, FaTimes, FaTrophy, FaRedo, FaSyncAlt, FaArrowRight } from "react-icons/fa";
import type { QuizQuestion, UploadedDoc } from "../types";
import { generateQuizApi, getErrorMessage } from "../services/api";
import Loader from "./Loader";

interface QuizViewProps {
  doc: UploadedDoc;
  quiz: QuizQuestion[];
  onQuizGenerated: (quiz: QuizQuestion[]) => void;
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function QuizView({
  doc,
  quiz,
  onQuizGenerated,
  onShowToast,
}: QuizViewProps) {
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const questions = await generateQuizApi(5, doc.doc_id, doc.text);
      onQuizGenerated(questions);
      setSelectedAnswers({});
      setCurrentIndex(0);
      setIsCompleted(false);
      onShowToast("success", "Interactive quiz generated!");
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return;

    const updated = { ...selectedAnswers, [currentIndex]: optionIndex };
    setSelectedAnswers(updated);

    if (currentIndex === quiz.length - 1) {
      calculateAndFinish(updated);
    }
  };

  const calculateAndFinish = (answers: Record<number, number>) => {
    setIsCompleted(true);
    let correctCount = 0;
    quiz.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / quiz.length) * 100;
    if (percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      calculateAndFinish(selectedAnswers);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800">
        <Loader
          message="Generating Interactive Quiz..."
          subMessage="Crafting challenging questions, options, and conceptual explanations"
        />
      </div>
    );
  }

  if (quiz.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center">
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4">
          <FaQuestionCircle size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">
          Knowledge Check & Quiz
        </h3>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
          Test your understanding of {doc.filename} with interactive multiple choice questions and instant explanations.
        </p>
        <button
          onClick={handleGenerate}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
        >
          Generate 5-Question Quiz
        </button>
      </div>
    );
  }

  if (isCompleted) {
    const correctCount = quiz.reduce(
      (acc, q, idx) => (selectedAnswers[idx] === q.correct_answer ? acc + 1 : acc),
      0
    );
    const scorePct = Math.round((correctCount / quiz.length) * 100);

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[450px] bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 mb-5 shadow-xl shadow-amber-500/20">
          <FaTrophy size={36} />
        </div>

        <h3 className="text-2xl font-bold text-slate-100">Quiz Completed!</h3>
        <p className="text-sm text-slate-400 mt-1">
          Here is your performance on {doc.filename}
        </p>

        <div className="my-6 p-6 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-sm w-full">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            {scorePct}%
          </div>
          <p className="text-sm text-slate-300 mt-1">
            You got <span className="font-bold text-emerald-400">{correctCount}</span> out of{" "}
            <span className="font-bold text-slate-100">{quiz.length}</span> correct
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRetake}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            <FaRedo size={12} />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <FaSyncAlt size={12} />
            <span>New Questions</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quiz[currentIndex];
  const hasAnswered = selectedAnswers[currentIndex] !== undefined;
  const userAnswer = selectedAnswers[currentIndex];
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Question {currentIndex + 1} of {quiz.length}
          </span>
          {currentQ.difficulty && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              {currentQ.difficulty}
            </span>
          )}
        </div>

        <button
          onClick={handleGenerate}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Generate fresh questions"
        >
          <FaSyncAlt size={11} />
          <span>Regenerate</span>
        </button>
      </div>

      <div className="w-full bg-slate-800 h-1">
        <div
          className="bg-emerald-500 h-1 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col justify-between max-w-3xl mx-auto w-full">
        <div>
          <h4 className="text-lg font-bold text-slate-100 leading-relaxed mb-6">
            {currentQ.question}
          </h4>

          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = userAnswer === optIdx;
              const isCorrect = optIdx === currentQ.correct_answer;

              let btnStyle = "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200";

              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-200 font-medium";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-950/40 border-rose-500 text-rose-200";
                } else {
                  btnStyle = "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={hasAnswered}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all duration-200 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        hasAnswered && isCorrect
                          ? "bg-emerald-600 text-white"
                          : hasAnswered && isSelected && !isCorrect
                          ? "bg-rose-600 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {optionLetters[optIdx]}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {hasAnswered && (
                    <div className="shrink-0 ml-2">
                      {isCorrect && <FaCheck className="text-emerald-400" />}
                      {isSelected && !isCorrect && <FaTimes className="text-rose-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 animate-fade-in">
              <p className="text-xs font-bold text-indigo-400 mb-1">💡 Explanation</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {hasAnswered && (
          <div className="pt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <span>{currentIndex < quiz.length - 1 ? "Next Question" : "View Results"}</span>
              <FaArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
