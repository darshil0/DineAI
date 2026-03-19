import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from './ChatMessage.js';
import { RecommendationCard } from './RecommendationCard.js';
import { TasteProfileBadge } from './TasteProfileBadge.js';
import { Recommendation, UserTasteProfile } from '../schemas/index.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  recommendations?: Recommendation[];
  profile?: UserTasteProfile;
  trends?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm DineAI, your personal restaurant recommendation agent. Tell me what you're craving, your budget, or upload a photo of a dish you love, and I'll find the perfect spot for you in NYC!"
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, loadingStep]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);
    setLoadingStep('Analyzing taste profile...');

    try {
      const formData = new FormData();
      formData.append('message', input);
      formData.append('history', JSON.stringify(messages.map(m => ({ role: m.role, content: m.content }))));
      
      const lastProfileMessage = [...messages].reverse().find(m => m.profile);
      if (lastProfileMessage?.profile) {
        formData.append('currentProfile', JSON.stringify(lastProfileMessage.profile));
      }

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // Simulate step updates for better UX
      setTimeout(() => setLoadingStep('Retrieving candidate restaurants...'), 2000);
      setTimeout(() => setLoadingStep('Analyzing current food trends...'), 4000);
      setTimeout(() => setLoadingStep('Finalizing recommendations...'), 6000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Here are my top recommendations based on your taste profile and current trends:",
        recommendations: data.recommendations,
        profile: data.profile,
        trends: data.trends,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-stone-50 shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3 z-10">
        <div className="bg-orange-100 p-2 rounded-xl">
          <ChefHat className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">DineAI</h1>
          <p className="text-sm text-stone-500">Multi-Agent Restaurant Recommender</p>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              {msg.role === 'user' && msg.image && (
                <div className="flex justify-end mb-2">
                  <img src={msg.image} alt="Uploaded food" className="max-w-xs rounded-2xl object-cover shadow-sm border border-stone-200" />
                </div>
              )}
              
              <ChatMessage role={msg.role} content={msg.content} />

              {msg.role === 'assistant' && msg.profile && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pl-14 pr-4"
                >
                  <TasteProfileBadge profile={msg.profile} />
                </motion.div>
              )}

              {msg.role === 'assistant' && msg.recommendations && (
                <div className="pl-14 pr-4 space-y-4">
                  {msg.recommendations.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                    >
                      <RecommendationCard recommendation={rec} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChatMessage role="assistant" content={loadingStep} isLoading={true} />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-stone-200 p-4">
        <AnimatePresence>
          {imagePreview && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="mb-3 relative inline-block"
            >
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover border border-stone-200 shadow-sm" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-stone-800 text-white rounded-full p-1 hover:bg-stone-700 transition-colors shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 bg-stone-100 rounded-2xl border border-stone-200 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all flex items-end p-1">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-stone-400 hover:text-orange-500 transition-colors rounded-xl"
              title="Upload image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="I'm looking for a cozy Italian spot for a date night..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-2 text-stone-800 placeholder-stone-400 outline-none"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="bg-orange-600 text-white p-4 rounded-2xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
