import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isLoading }) => {
  const isUser = role === 'user';

  return (
    <div className={`mb-6 flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
          <Bot className="h-6 w-6 text-indigo-600" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? 'rounded-br-none bg-stone-900 text-white'
            : 'rounded-bl-none border border-stone-200 bg-white text-stone-800 shadow-sm'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-stone-500">
            <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400" />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-stone-400"
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-stone-400"
              style={{ animationDelay: '0.4s' }}
            />
            <span className="ml-2 text-sm italic">{content}</span>
          </div>
        ) : (
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-200">
          <User className="h-6 w-6 text-stone-600" />
        </div>
      )}
    </div>
  );
};
