import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User } from "lucide-react";
import { cn } from "@/utils/cn";

export function AskAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ id: string; role: "user" | "ai"; text: string }[]>([
    {
      id: "1",
      role: "ai",
      text: "Hi! I'm your FixMyCampus AI assistant. You can ask me about campus facilities, the status of your complaints, or how to report an issue.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query.trim();
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: userMsg }]);
    setQuery("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", text: data.reply }]);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (err) {
      // Fallback if backend is unreachable
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          text: "I'm having trouble connecting to the campus brain right now. Please try again later!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:h-[500px] h-[400px] transition-all duration-300 origin-bottom-right animate-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/20 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">FixMyCampus AI</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Always ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-700/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex items-end gap-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                    m.role === "user" ? "bg-slate-800 dark:bg-slate-600" : "bg-teal-600"
                  )}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    m.role === "user"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-br-none"
                      : "bg-white text-slate-700 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-bl-none"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex max-w-[75%] items-center rounded-2xl rounded-bl-none border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-white/20 bg-white/40 p-3 dark:border-white/10 dark:bg-slate-800/50">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!query.trim() || isTyping}
                className="absolute right-1.5 top-1.5 rounded-full bg-teal-600 p-1.5 text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
          isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
        style={{ transitionDuration: "300ms" }}
      >
        <Sparkles className="h-6 w-6" />
      </button>
      
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 animate-in zoom-in"
        >
          <X className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
