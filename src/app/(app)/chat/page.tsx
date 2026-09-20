'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Compass, 
  AlertCircle,
  Bot,
  User
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: 'assistant',
    content: "Hello! I'm Plan Assist, your educational guide for the NH-766 Wayanad mountain corridor. I can help answer questions about hazard types, mountain driving safety tips, emergency contacts, or how the app works. For live, verified road conditions, please check the Trip Planner. What would you like to know?"
  }
];

const SUGGESTED_PROMPTS = [
  "What safety tips should I follow on ghat roads?",
  "Is the road to Wayanad safe right now?",
  "What's the emergency number for landslides?"
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply || "I'm sorry, I couldn't generate a response. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Unable to reach Plan Assist right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-300 fill-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Plan Assist
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  AI Guide
                </span>
              </div>
              <p className="text-xs text-slate-500">
                General corridor knowledge, safety guidelines, and emergency directory
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trip Planner</span>
          </Link>
        </div>

        {/* Safety Boundary Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between gap-2">
          <span>
            <strong>Safety Notice:</strong> Plan Assist answers general questions. For verified live road safety recommendations, always consult the{' '}
            <Link href="/dashboard" className="text-slate-900 font-bold underline">
              Trip Planner
            </Link>.
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Plan Assist is typing...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips */}
      <div className="pt-2 pb-3 shrink-0 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-full transition shadow-2xs text-left truncate max-w-full disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="pt-2 border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white rounded-2xl border border-slate-300 p-1.5 shadow-xs focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition"
        >
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about hazard signs, safety tips, or emergency helplines..."
            disabled={loading}
            className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition disabled:opacity-40 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
