import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, RotateCcw, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/utils/cn";

const SUGGESTIONS = [
  "How to report an issue?",
  "Check ticket status",
  "What is Verification Gate?",
  "Emergency contacts & SLAs",
  "Wi-Fi & IT support",
];

function getCampusFallbackReply(query: string): string {
  const msg = query.toLowerCase().trim();
  if (msg.includes("how to report") || msg.includes("file") || msg.includes("new issue")) {
    return "To report an issue:\n1. Click the '+ Report' tab in the navbar.\n2. Enter a title & description (AI will categorize it automatically!).\n3. Pin the campus building/room on the interactive map.\n4. Attach a photo and submit!";
  }
  if (msg.includes("status") || msg.includes("track") || msg.includes("fmc-") || msg.includes("ticket")) {
    return "You can track real-time complaint status anytime on your Student Dashboard under 'My Complaints'. Each ticket displays live progress: Pending, In-Progress, or Pending Verification.";
  }
  if (msg.includes("verification") || msg.includes("gate") || msg.includes("verify") || msg.includes("still broken")) {
    return "FixMyCampus features a mandatory Student Verification Gate! Technicians cannot silently close tickets—you must verify the fix on campus. If it's still broken, you can reject and reopen the issue with 1 click.";
  }
  if (msg.includes("emergency") || msg.includes("fire") || msg.includes("shock") || msg.includes("gas") || msg.includes("danger")) {
    return "🚨 For life-safety emergencies (fire, electrical sparks, gas leak, trapped elevator), alert Campus Security immediately at the gate and lodge an Urgent issue. Dispatch SLA is under 1-2 hours.";
  }
  if (msg.includes("sla") || msg.includes("hours") || msg.includes("how long")) {
    return "Our resolution SLA targets:\n• Urgent (Life/Safety): 1-3 hrs\n• High (Water/Power/Mess): 4-12 hrs\n• Medium (Routine repairs): 18-24 hrs\n• Low (Cosmetic/Amenities): 48-72 hrs";
  }
  if (msg.includes("wifi") || msg.includes("internet") || msg.includes("network")) {
    return "IT & Network issues (Wi-Fi dead zones, eduroam, lab network) are routed directly to the Campus IT team (SLA: 6-18 hours). Make sure to state your floor and room number!";
  }
  if (msg.includes("water") || msg.includes("leak") || msg.includes("toilet") || msg.includes("sink")) {
    return "Plumbing and water complaints are assigned to the Civil & Plumbing maintenance division. Severe leaks or water shortages are treated as high priority.";
  }
  if (msg.includes("food") || msg.includes("mess") || msg.includes("canteen")) {
    return "Food quality and mess hygiene complaints are dispatched immediately to the Dining Safety team with a 1-4 hour rapid inspection SLA.";
  }
  return "I'm your FixMyCampus assistant! You can ask me how to report an issue, check complaint SLAs, track a ticket, or ask about campus maintenance facilities.";
}

export function AskAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
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
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");
      setQuery(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const sendQuery = async (text: string) => {
    const userMsg = text.trim();
    if (!userMsg) return;

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
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: data.reply }]);
        
        if (voiceMode && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.reply);
          window.speechSynthesis.speak(utterance);
        }
      } else {
        throw new Error("API responded with error");
      }
    } catch {
      // Intelligent fallback so chatbot is never broken
      const fallbackReply = getCampusFallbackReply(userMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: fallbackReply,
        },
      ]);
      
      if (voiceMode && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackReply);
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(query);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "1",
        role: "ai",
        text: "Conversation reset! What can I help you with across campus today?",
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex w-[350px] sm:w-[420px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 sm:h-[530px] h-[450px] transition-all duration-300 origin-bottom-right animate-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/60 px-4 py-3 dark:border-slate-800/60 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">FixMyCampus AI</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Campus Facilities Copilot</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceMode(!voiceMode)}
                title="Toggle Voice Mode"
                className={cn(
                  "rounded-full p-2 transition-colors",
                  voiceMode
                    ? "text-teal-600 bg-teal-50 hover:bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30 dark:hover:bg-teal-900/50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                )}
              >
                {voiceMode ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={handleClear}
                title="Restart chat"
                className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex items-end gap-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs",
                    m.role === "user" ? "bg-slate-800 dark:bg-slate-700" : "bg-teal-600 shadow-sm shadow-teal-500/20"
                  )}
                >
                  {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line",
                    m.role === "user"
                      ? "bg-slate-900 text-white dark:bg-teal-600 dark:text-white rounded-br-none shadow-sm"
                      : "bg-white text-slate-800 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/80 dark:text-slate-100 rounded-bl-none"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex max-w-[75%] items-center rounded-2xl rounded-bl-none border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <span className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30">
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => sendQuery(item)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-2xs"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t border-slate-200/60 bg-white/60 p-3 dark:border-slate-800/60 dark:bg-slate-800/60">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask about facilities, complaints, SLAs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-4 pr-20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 shadow-2xs"
              />
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                <button
                  type="button"
                  onClick={toggleListening}
                  title="Speak"
                  className={cn(
                    "rounded-full p-1.5 transition-colors",
                    isListening
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!query.trim() || isTyping}
                  className="rounded-full bg-teal-600 p-1.5 text-white transition-colors hover:bg-teal-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-2.5 opacity-80">
              <span className="text-[9px] font-mono tracking-wide text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-2.5 w-2.5 text-teal-500" />
                HYBRID AI ARCHITECTURE: GEMINI + GROQ
              </span>
            </div>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl shadow-teal-600/30 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
          isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
        style={{ transitionDuration: "300ms" }}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition-transform hover:scale-105 active:scale-95 animate-in zoom-in"
          aria-label="Close AI Assistant"
        >
          <X className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

