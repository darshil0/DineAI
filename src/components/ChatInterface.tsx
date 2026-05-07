import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Image as ImageIcon,
  X,
  ChefHat,
  Trash2,
  Mic,
  MicOff,
  MapPin,
  Filter,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from './ChatMessage.js';
import { RecommendationCard } from './RecommendationCard.js';
import { TasteProfileBadge } from './TasteProfileBadge.js';
import { FilterControls } from './FilterControls.js';
import { OnboardingTutorial } from './OnboardingTutorial.js';
import { Recommendation, UserTasteProfile } from '../schemas/index.js';
import { cn } from '../lib/utils.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  recommendations?: Recommendation[];
  profile?: UserTasteProfile;
  trends?: string;
}

interface Filters {
  cuisines: string[];
  prices: string[];
  neighborhoods: string[];
}

const STORAGE_KEY = 'dineai_chat_history';
const ONBOARDING_STORAGE_KEY = 'dineai_onboarding_completed';
const FAVORITES_STORAGE_KEY = 'dineai_favorites';

// Speech Recognition Types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    cuisines: [],
    prices: [],
    neighborhoods: [],
  });
  const [queuedFeedback, setQueuedFeedback] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [favorites, setFavorites] = useState<Recommendation[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const loadingTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  const setInitialMessage = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content:
          "Welcome to DineAI. I'm your private culinary concierge. Tell me your cravings, set a budget, or upload a photo of a dish that inspires you. I'll curate the perfect NYC dining experience just for you.",
      },
    ]);
  }, []);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!completed) {
      setShowOnboarding(true);
    }
    
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = (rec: Recommendation) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.name === rec.name);
      if (exists) {
        return prev.filter((f) => f.name !== rec.name);
      }
      return [rec, ...prev];
    });
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    return () => {
      loadingTimeoutsRef.current.forEach(clearTimeout);
      loadingTimeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition() as SpeechRecognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => {
          const newText = prev.trim() ? `${prev} ${transcript}` : transcript;
          return newText;
        });
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert('Voice recognition is not supported in this browser.');
        return;
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setInput((prev) => {
            const locStr = `[Near my current location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`;
            return prev.includes('[Near my current location') ? prev : `${prev} ${locStr}`.trim();
          });
        } catch (err) {
          console.error('Error getting neighborhood info:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
      },
    );
  };

  const handleRecommendationFeedback = (name: string, type: 'like' | 'dislike') => {
    const feedbackText =
      type === 'like' ? `(Feedback: I loved ${name})` : `(Feedback: I wasn't a fan of ${name})`;

    setQueuedFeedback((prev) => [...prev, feedbackText]);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved history', e);
        setInitialMessage();
      }
    } else {
      setInitialMessage();
    }
  }, [setInitialMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      const historyToSave = messages.slice(-30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyToSave));
    }
  }, [messages]);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      localStorage.removeItem(STORAGE_KEY);
      setInitialMessage();
      setInput('');
      setSelectedImage(null);
      setImagePreview(null);
      setFilters({ cuisines: [], prices: [], neighborhoods: [] });
      setQueuedFeedback([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, loadingStep]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
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

  const submitMessage = async () => {
    const fullMessage =
      queuedFeedback.length > 0 ? `${input} ${queuedFeedback.join(' ')}`.trim() : input.trim();

    if (!fullMessage && !selectedImage) return;

    const finalContent =
      !fullMessage && selectedImage ? 'Identify these dishes and find similar restaurants' : fullMessage;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalContent,
      image: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = finalContent;
    const currentImage = selectedImage;

    setInput('');
    setQueuedFeedback([]);
    setSelectedImage(null);
    setImagePreview(null);
    setFilters({ cuisines: [], prices: [], neighborhoods: [] });
    setIsLoading(true);
    setLoadingStep('Analyzing taste profile...');

    try {
      const formData = new FormData();
      formData.append('message', currentInput);
      formData.append(
        'history',
        JSON.stringify(messages.map((m) => ({ role: m.role, content: m.content }))),
      );

      const lastProfileMessage = [...messages].reverse().find((m) => m.profile);
      if (lastProfileMessage?.profile) {
        formData.append('currentProfile', JSON.stringify(lastProfileMessage.profile));
      }

      if (currentImage) {
        formData.append('image', currentImage);
      }

      loadingTimeoutsRef.current.push(
        setTimeout(() => setLoadingStep('Retrieving candidate restaurants...'), 2000),
      );
      loadingTimeoutsRef.current.push(
        setTimeout(() => setLoadingStep('Analyzing current food trends...'), 4000),
      );
      loadingTimeoutsRef.current.push(
        setTimeout(() => setLoadingStep('Finalizing recommendations...'), 6000),
      );

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
        content: 'I have curated these selections based on your evolving taste profile and real-time culinary trends in the city:',
        recommendations: data.recommendations,
        profile: data.profile,
        trends: data.trends,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ **Service Interruption:** ${error.message || 'Something went wrong while processing your request.'}`,
        },
      ]);
    } finally {
      loadingTimeoutsRef.current.forEach(clearTimeout);
      loadingTimeoutsRef.current = [];
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage();
  };

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col overflow-hidden bg-[var(--color-bg-deep)] shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)]">
      {showOnboarding && <OnboardingTutorial onComplete={handleOnboardingComplete} />}
      
      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-2xl px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] p-2.5 shadow-lg shadow-[var(--color-brand-primary)]/20">
            <ChefHat className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-main)] font-serif tracking-tight">DineAI</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-muted)] uppercase">Concierge Service</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-all',
              showFavorites
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'
            )}
          >
            <Heart className={cn('h-4 w-4', showFavorites && 'fill-current')} />
            <span className="hidden sm:inline">
              {showFavorites ? 'Back' : `Saved (${favorites.length})`}
            </span>
          </button>
          <button
            onClick={clearHistory}
            className="rounded-xl p-2.5 text-[var(--color-text-muted)] transition-all hover:bg-rose-500/10 hover:text-rose-500"
            title="Clear History"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
        {showFavorites ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)] font-serif">Your Culinary Collection</h2>
              <p className="text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase">{favorites.length} Saved</p>
            </div>

            {favorites.length === 0 ? (
              <div className="flex h-80 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                <Heart className="mb-6 h-16 w-16 text-white/5" />
                <h3 className="text-xl font-bold text-[var(--color-text-main)] font-serif">Empty Collection</h3>
                <p className="mt-3 max-w-xs text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Bookmark the restaurants you love to build your personalized NYC dining map.
                </p>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="mt-8 text-[11px] font-black text-[var(--color-brand-primary)] uppercase tracking-[0.2em] hover:brightness-125"
                >
                  Start Discovery
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {favorites.map((rec) => (
                  <RecommendationCard
                    key={`fav-${rec.name}`}
                    recommendation={rec}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto w-full">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                  {msg.role === 'user' && msg.image && (
                    <div className="mb-4 flex justify-end">
                      <img
                        src={msg.image}
                        alt="Culinary inspiration"
                        className="max-w-xs rounded-2xl border border-white/10 object-cover shadow-2xl"
                      />
                    </div>
                  )}

                  <ChatMessage role={msg.role} content={msg.content} />

                  {msg.role === 'assistant' && msg.profile && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 mb-8"
                    >
                      <TasteProfileBadge profile={msg.profile} />
                    </motion.div>
                  )}

                  {msg.role === 'assistant' && msg.recommendations && (
                    <div className="space-y-6 mt-8">
                      {msg.id === messages[messages.length - 1]?.id && (
                        <FilterControls
                          recommendations={msg.recommendations}
                          filters={filters}
                          onFilterChange={setFilters}
                        />
                      )}

                      {msg.recommendations
                        .filter((r) => {
                          const matchCuisine =
                            filters.cuisines.length === 0 ||
                            (r.cuisine && filters.cuisines.includes(r.cuisine));
                          const matchPrice =
                            filters.prices.length === 0 ||
                            (r.price_level && filters.prices.includes(r.price_level));
                          const matchNeighborhood =
                            filters.neighborhoods.length === 0 ||
                            (r.neighborhood && filters.neighborhoods.includes(r.neighborhood));
                          return matchCuisine && matchPrice && matchNeighborhood;
                        })
                        .map((rec) => (
                          <motion.div
                            key={`${msg.id}-${rec.name}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <RecommendationCard
                              recommendation={rec}
                              isFavorite={favorites.some((f) => f.name === rec.name)}
                              onFeedback={handleRecommendationFeedback}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          </motion.div>
                        ))}

                      {msg.recommendations.filter((r) => {
                        const matchCuisine = filters.cuisines.length === 0 || (r.cuisine && filters.cuisines.includes(r.cuisine));
                        const matchPrice = filters.prices.length === 0 || (r.price_level && filters.prices.includes(r.price_level));
                        const matchNeighborhood = filters.neighborhoods.length === 0 || (r.neighborhood && filters.neighborhoods.includes(r.neighborhood));
                        return matchCuisine && matchPrice && matchNeighborhood;
                      }).length === 0 && (
                        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                          <Filter className="mx-auto mb-4 h-10 w-10 text-white/5" />
                          <p className="text-sm text-[var(--color-text-muted)]">No selections match your current refinement.</p>
                          <button
                            onClick={() => setFilters({ cuisines: [], prices: [], neighborhoods: [] })}
                            className="mt-4 text-[10px] font-black text-[var(--color-brand-primary)] uppercase tracking-widest hover:underline"
                          >
                            Reset Refinements
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
                <ChatMessage role="assistant" content={loadingStep} isLoading={true} />
                <div className="space-y-8 mt-6">
                  <TasteProfileBadge loading={true} />
                  <div className="space-y-6">
                    <RecommendationCard loading={true} />
                    <RecommendationCard loading={true} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 bg-black/60 backdrop-blur-3xl p-6 shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.5)]">
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="relative mb-5 inline-block group"
            >
              <img
                src={imagePreview}
                alt="Inspiration preview"
                className="h-24 rounded-2xl border border-white/10 object-cover shadow-2xl"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 rounded-full bg-black border border-white/20 p-1.5 text-white shadow-xl transition-all hover:scale-110"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-3xl mx-auto">
          <div className="flex flex-1 flex-col rounded-[2rem] border border-white/10 bg-white/5 p-2 transition-all focus-within:border-[var(--color-brand-primary)]/50 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_30px_-5px_rgba(212,175,55,0.1)]">
            {queuedFeedback.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 pt-3 pb-2">
                {queuedFeedback.map((fb, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 px-2.5 py-1 text-[9px] font-bold text-[var(--color-brand-primary)] uppercase tracking-wider"
                  >
                    {fb}
                    <button
                      type="button"
                      onClick={() => setQueuedFeedback((prev) => prev.filter((_, i) => i !== idx))}
                      className="hover:text-white"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-end">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                'relative rounded-2xl p-4 transition-all',
                isListening
                  ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  : 'text-white/20 hover:text-[var(--color-brand-primary)] hover:bg-white/5'
              )}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {isListening && (
                <span className="absolute top-3 right-3 h-2 w-2 animate-ping rounded-full bg-rose-500" />
              )}
            </button>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className={cn(
                'rounded-2xl p-4 transition-all',
                isLocating
                  ? 'text-[var(--color-brand-primary)] animate-pulse'
                  : 'text-white/20 hover:text-[var(--color-brand-primary)] hover:bg-white/5'
              )}
            >
              <MapPin className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl p-4 text-white/20 transition-all hover:text-[var(--color-brand-primary)] hover:bg-white/5"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitMessage();
                }
              }}
              placeholder="Tell me what you're craving..."
              className="max-h-40 min-h-[56px] flex-1 resize-none border-none bg-transparent px-4 py-4 text-sm text-[var(--color-text-main)] placeholder-white/20 outline-none focus:ring-0 leading-relaxed"
              rows={1}
            />
          </div>
        </div>
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="flex-shrink-0 rounded-[2rem] bg-[var(--color-brand-primary)] p-5 text-black shadow-xl shadow-[var(--color-brand-primary)]/20 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
