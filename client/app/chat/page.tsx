"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSchemes } from "@/context/SchemeContext";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Send, ArrowLeft, LogOut } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { askAI, actionLoading } = useSchemes();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  if (redirectPath) {
    redirect(redirectPath);
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! Ask me any question about government schemes, document criteria, or eligibility guidelines.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setRedirectPath("/login");
    }
  }, [user, authLoading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading || actionLoading) return;
    
    const userMsg = textToSend;
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    const history = messages.slice(1);
    const reply = await askAI(userMsg, history);
    
    setLoading(false);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
  };

  const quickQuestions = [
    "Am I eligible for PM Kisan Samman Nidhi?",
    "What scholarship schemes are available for SC/ST students?",
    "What are the document requirements for Pudhumai Penn?",
    "Can a student apply for Startup India Seed Fund?"
  ];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-black animate-spin"></div>
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">Loading Chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-9 h-9 rounded bg-black text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
              SW
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 flex items-center">
                <span>Counselor Chat</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-zinc-900 block">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center space-y-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-2 self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden flex flex-col h-[550px] shadow-sm">
          <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
                SW
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center">
                  <span>SchemeWise Assistant</span>
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-200 border border-zinc-300 text-zinc-700">
                    <span>Standard Mode</span>
                  </span>
                </h3>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-md p-3.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-black text-white font-medium shadow-sm"
                      : "bg-zinc-50 border border-zinc-200 text-zinc-800"
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3.5 text-xs text-zinc-500 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="pl-1">Consulting guidelines...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-5 pb-3 bg-white">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-450 mb-2">
                Suggested Queries
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={loading || actionLoading}
                    className="text-left border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 bg-white text-zinc-650 hover:text-zinc-950 px-3 py-2 rounded text-[11px] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="border-t border-zinc-200 p-4 bg-white"
          >
            <div className="flex items-center bg-white border border-zinc-300 rounded px-3 py-2.5 focus-within:border-zinc-955 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || actionLoading}
                className="flex-1 bg-transparent text-xs text-zinc-900 focus:outline-none placeholder-zinc-400 disabled:opacity-50"
                placeholder="Ask a question about government schemes..."
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || actionLoading}
                className="text-zinc-800 hover:text-zinc-950 disabled:text-zinc-300 transition-colors ml-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
