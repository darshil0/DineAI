import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-surface-variant/30">
          <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? "bg-primary text-on-primary rounded-br-none"
            : "bg-surface-container-low border border-surface-variant/30 text-on-surface rounded-bl-none shadow-sm"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <span className="ml-2 text-sm italic font-label uppercase tracking-widest">{content}</span>
          </div>
        ) : (
          <div
            className={`prose prose-sm max-w-none ${isUser ? "text-on-primary" : "text-on-surface"}`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center shrink-0 border border-surface-variant/30">
          <span className="material-symbols-outlined text-on-surface text-xl">person</span>
        </div>
      )}
    </div>
  );
};
