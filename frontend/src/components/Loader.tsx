import { FaBrain, FaCircleNotch } from "react-icons/fa";

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

export default function Loader({
  message = "Gemini AI is analyzing your document...",
  subMessage = "Extracting concepts, formatting insights, and compiling answers"
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
        
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900/80 border border-indigo-500/30 shadow-inner">
          <FaCircleNotch className="w-8 h-8 text-indigo-500 animate-spin" />
          <FaBrain className="w-4 h-4 text-indigo-300 absolute" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-100 tracking-wide">
        {message}
      </h3>
      {subMessage && (
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          {subMessage}
        </p>
      )}

      <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-1/2 rounded-full animate-pulse mx-auto" />
      </div>
    </div>
  );
}
