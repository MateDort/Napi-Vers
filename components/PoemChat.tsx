"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function PoemChat({
  poemName,
  authorName,
  poemText,
}: {
  poemName: string;
  authorName: string;
  poemText: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);

    try {
      const response = await fetch("/api/chat/poem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poemName,
          authorName,
          poemText,
          question: userMessage,
          conversationHistory: newMessages.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error chatting:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Hiba történt a válasz generálása során.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <p className="text-lg md:text-xl text-gray-800 font-medium">
        Mit szeretnél még tudni erről a versről?
      </p>

      {/* Messages Display - as paragraphs */}
      {messages.length > 0 && (
        <div className="space-y-6" ref={messagesEndRef}>
          {messages.map((msg, idx) => {
            if (msg.role === "user") return null; // Don't show user messages
            return (
              <div key={idx} className="text-gray-800">
                {msg.content.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx} className="mb-4 text-justify">
                    {para}
                  </p>
                ))}
              </div>
            );
          })}
          {isLoading && (
            <div className="text-gray-600">
              <p>Válasz generálása...</p>
            </div>
          )}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Írj ide..."
          className="flex-1 px-4 py-3 rounded-lg bg-beige-light border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </form>

      {/* Close Button */}
      <button
        onClick={() => window.history.back()}
        className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
      >
        Bezár
      </button>
    </div>
  );
}

