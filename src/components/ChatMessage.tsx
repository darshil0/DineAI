import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';
import { cn } from '../lib/utils.js';

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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/20 border border-[var(--color-brand-primary)]/30">
          <Bot className="h-6 w-6 text-[var(--color-brand-primary)]" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%]',
          isUser ? 'bubble-user' : 'bubble-assistant'
        )}
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-800 border border-stone-700">
          <User className="h-6 w-6 text-stone-400" />
        </div>
      )}
    </div>
  );
};
