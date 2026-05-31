import React, { useState, useRef, useEffect } from "react";
import { getGuildmasterResponse } from "../utils/mockAi";
import { MessageSquare, Send, X, Compass } from "lucide-react";

interface Message {
  sender: "user" | "guildmaster";
  text: string;
  isStreaming?: boolean;
}

export const GuildmasterSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "guildmaster",
      text: "Hail, adventurer! I am the Guildmaster of this fine tavern. Grab a mug of sweet cider, tell me: what challenges or giants are we conquering on your questboard today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    // Append user message
    const userMsg: Message = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Create temporary streaming message for Guildmaster
    const guildmasterTempMsg: Message = {
      sender: "guildmaster",
      text: "",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, guildmasterTempMsg]);

    try {
      await getGuildmasterResponse(textToSend, (streamedText) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.sender === "guildmaster") {
            last.text = streamedText;
          }
          return updated;
        });
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.sender === "guildmaster") {
          last.text = "By the heavens, my crystal ball lost connection! Try asking again, friend.";
        }
        return updated;
      });
    } finally {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last) {
          delete last.isStreaming;
        }
        return updated;
      });
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-theme-primary text-theme-bg p-3.5 rounded-full shadow-lg border border-theme-border/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center animate-pulse-glow"
        title="Open Guildmaster AI Chat"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="ml-1.5 text-xs font-black uppercase tracking-wider hidden sm:inline">Ask Guildmaster</span>
      </button>
    );
  }

  return (
    <aside className="theme-transition fixed bottom-0 right-0 z-30 lg:top-[65px] lg:bottom-0 lg:left-auto lg:h-[calc(100vh-65px)] w-full lg:w-96 flex flex-col bg-theme-card/85 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-theme-border text-theme-text shadow-lg h-[450px]">
      
      {/* SIDEBAR HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-theme-border bg-theme-bg/30">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-theme-primary" />
          <div>
            <h3 className="font-bold text-sm tracking-wide">The Guildmaster</h3>
            <p className="text-[10px] text-emerald-500 font-bold flex items-center space-x-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span>
              <span>Cozy Tavern Companion</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-theme-muted hover:text-theme-primary transition-colors p-1"
          title="Minimize Chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CHAT BUBBLES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-theme-bg/10">
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";
          return (
            <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                  isUser
                    ? "bg-theme-primary text-theme-bg rounded-tr-none font-medium"
                    : "bg-theme-bg border border-theme-border/60 text-theme-text rounded-tl-none"
                }`}
              >
                {!isUser && (
                  <div className="text-[9px] font-extrabold uppercase text-theme-primary tracking-widest mb-0.5">
                    Guildmaster 🧙
                  </div>
                )}
                <span className="whitespace-pre-line">{msg.text}</span>
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 bg-theme-text animate-pulse">|</span>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && messages[messages.length - 1]?.sender === "user" && (
          <div className="flex justify-start">
            <div className="bg-theme-bg border border-theme-border/60 text-theme-text rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK BOOSTER PROMPTS */}
      <div className="px-3 py-2 border-t border-theme-border/40 bg-theme-bg/5 space-y-1.5">
        <span className="block text-[9px] font-black text-theme-muted uppercase tracking-widest">
          Tavern Banter Starters
        </span>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => handleQuickPrompt("Give me a daily motivational boost!")}
            className="bg-theme-bg hover:border-theme-primary border border-theme-border/60 text-theme-text text-[10px] font-semibold px-2 py-1 rounded transition-colors"
          >
            🔥 Get Motivation
          </button>
          <button
            onClick={() => handleQuickPrompt("How can I structure my quests today?")}
            className="bg-theme-bg hover:border-theme-primary border border-theme-border/60 text-theme-text text-[10px] font-semibold px-2 py-1 rounded transition-colors"
          >
            🗺️ Quest Planning
          </button>
          <button
            onClick={() => handleQuickPrompt("What are streak shields and shop rewards?")}
            className="bg-theme-bg hover:border-theme-primary border border-theme-border/60 text-theme-text text-[10px] font-semibold px-2 py-1 rounded transition-colors"
          >
            🛡️ Shop Help
          </button>
        </div>
      </div>

      {/* CHAT INPUT AREA */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 border-t border-theme-border flex items-center space-x-2 bg-theme-card"
      >
        <input
          type="text"
          placeholder="Ask for advice or tavern wisdom..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          className="flex-1 bg-theme-bg text-theme-text border border-theme-border rounded-md px-3 py-2 text-xs outline-none focus:border-theme-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-theme-primary text-theme-bg p-2 rounded-md hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:scale-100"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
