import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  isLoading,
}) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-4 mb-6 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6 text-indigo-600" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? "bg-stone-900 text-white rounded-br-none"
            : "bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-sm"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-stone-500">
            <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" />
            <div
              className="w-2 h-2 rounded-full bg-stone-400 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-stone-400 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <span className="ml-2 text-sm italic">{content}</span>
          </div>
        ) : (
          <div
            className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""}`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
          <User className="w-6 h-6 text-stone-600" />
        </div>
      )}
    </div>
  );
};
