import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaPaperPlane, FaRobot, FaUser, FaCopy, FaCheck, FaTrash, FaLightbulb } from "react-icons/fa";
import type { ChatMessage, UploadedDoc } from "../types";
import { askPdfApi, getErrorMessage } from "../services/api";

interface ChatViewProps {
  doc: UploadedDoc;
  onShowToast: (type: "success" | "error" | "info", msg: string) => void;
}

const PRESET_PROMPTS = [
  "Summarize key formulas & principles",
  "Explain the core thesis in simple terms",
  "What are 3 critical exam questions?",
  "List the most important definitions",
];

export default function ChatView({ doc, onShowToast }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content: `Hello! I have analyzed **${doc.filename}** (${doc.pages} pages). Ask me anything about this document, request explanations, or click any suggested prompt below!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const answer = await askPdfApi(q, historyPayload, doc.doc_id, doc.text);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      onShowToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast("success", "Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content: `Chat history cleared. What else would you like to explore in **${doc.filename}**?`,
        timestamp: new Date(),
      },
    ]);
    onShowToast("info", "Chat history cleared.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      {/* Chat Sub-header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            IntelliPDF Chat Assistant
          </span>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Clear conversation history"
        >
          <FaTrash size={11} />
          <span>Clear</span>
        </button>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <FaLightbulb className="text-amber-400 shrink-0 text-xs" />
        <span className="text-[11px] font-medium text-slate-400 shrink-0">Suggestions:</span>
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700/60 text-slate-300 hover:text-indigo-200 whitespace-nowrap transition-all text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20"
                }`}
              >
                {isUser ? <FaUser size={12} /> : <FaRobot size={14} />}
              </div>

              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none font-normal"
                    : "bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/60"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}

                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white transition-opacity"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <FaCheck size={12} className="text-emerald-400" />
                    ) : (
                      <FaCopy size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs">
              <FaRobot size={14} />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-300">Searching document & thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-950/60 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this PDF..."
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
            title="Send question"
          >
            <FaPaperPlane size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
