import React, { useState, useRef, useEffect } from 'react';
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
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from './ChatMessage.js';
import { RecommendationCard } from './RecommendationCard.js';
import { TasteProfileBadge } from './TasteProfileBadge.js';
import { FilterControls } from './FilterControls.js';
import { OnboardingTutorial } from './OnboardingTutorial.js';
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

interface Filters {
  cuisines: string[];
  prices: string[];
  neighborhoods: string[];
}

const STORAGE_KEY = 'dineai_chat_history';
const ONBOARDING_STORAGE_KEY = 'dineai_onboarding_completed';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const loadingTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Check onboarding status
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  // Focus management
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  // Clean up timeouts on unmount or error
  useEffect(() => {
    return () => {
      loadingTimeoutsRef.current.forEach(clearTimeout);
      loadingTimeoutsRef.current = [];
    };
  }, []);

  // Initialize Speech Recognition
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
          // Provide coordinates to message for LLM context
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
    console.log(`Feedback queued for ${name}: ${type}`);
  };

  // Load history on mount
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
  }, []);

  // Save history on change (with limit)
  useEffect(() => {
    if (messages.length > 0) {
      // Keep last 30 messages to avoid localStorage bloat
      const historyToSave = messages.slice(-30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyToSave));
    }
  }, [messages]);

  const setInitialMessage = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content:
          "Hi! I'm DineAI, your personal restaurant recommendation agent. Tell me what you're craving, your budget, or upload a photo of a dish you love, and I'll find the perfect spot for you in NYC!",
      },
    ]);
  };

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
      // Limit image size to 5MB
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

    // Ensure there is some text context if sending an image, or prompt builder might struggle
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
    const currentPreview = imagePreview;

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

      // Simulate step updates for better UX
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
        content: 'Here are my top recommendations based on your taste profile and current trends:',
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
          content: `Sorry, I encountered an error: ${error.message}`,
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
    <div className="mx-auto flex h-screen max-w-4xl flex-col overflow-hidden bg-stone-50 shadow-2xl">
      {showOnboarding && <OnboardingTutorial onComplete={handleOnboardingComplete} />}
      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-100 p-2">
            <ChefHat className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">DineAI</h1>
            <p className="text-sm text-stone-500">Multi-Agent Restaurant Recommender</p>
          </div>
        </div>
        <button
          onClick={clearHistory}
          className="rounded-lg p-2 text-stone-400 transition-all hover:bg-red-50 hover:text-red-500"
          title="Clear History"
          aria-label="Clear conversation history"
        >
          <Trash2 className="h-5 w-5" />
        </button>
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
                <div className="mb-2 flex justify-end">
                  <img
                    src={msg.image}
                    alt="Uploaded food"
                    className="max-w-xs rounded-2xl border border-stone-200 object-cover shadow-sm"
                  />
                </div>
              )}

              <ChatMessage role={msg.role} content={msg.content} />

              {msg.role === 'assistant' && msg.profile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pr-4 pl-14"
                >
                  <TasteProfileBadge profile={msg.profile} />
                </motion.div>
              )}

              {msg.role === 'assistant' && msg.recommendations && (
                <div className="space-y-4 pr-4 pl-14">
                  {/* Advanced Multi-select filters */}
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
                          onFeedback={handleRecommendationFeedback}
                        />
                      </motion.div>
                    ))}

                  {msg.recommendations &&
                    msg.recommendations.length > 0 &&
                    msg.recommendations.filter((r) => {
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
                    }).length === 0 && (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-100 p-8 text-center">
                        <Filter className="mx-auto mb-2 h-8 w-8 text-stone-300" />
                        <p className="text-sm text-stone-500">No matches for current filters.</p>
                        <button
                          onClick={() =>
                            setFilters({ cuisines: [], prices: [], neighborhoods: [] })
                          }
                          className="mt-2 text-xs font-bold text-orange-600 uppercase hover:underline"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <ChatMessage role="assistant" content={loadingStep} isLoading={true} />

            <div className="space-y-6 pr-4 pl-14">
              <TasteProfileBadge loading={true} />

              <div className="space-y-4">
                <RecommendationCard loading={true} />
                <RecommendationCard loading={true} />
                <RecommendationCard loading={true} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-stone-200 bg-white p-4">
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="relative mb-3 inline-block"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 rounded-lg border border-stone-200 object-cover shadow-sm"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 rounded-full bg-stone-800 p-1 text-white shadow-sm transition-colors hover:bg-stone-700"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex flex-1 flex-col rounded-2xl border border-stone-200 bg-stone-100 p-1 transition-all focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
            {queuedFeedback.length > 0 && (
              <div className="flex flex-wrap gap-1 px-2 pt-2 pb-1">
                {queuedFeedback.map((fb, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-stone-200 px-1.5 py-0.5 text-[10px] font-medium text-stone-600"
                  >
                    {fb}
                    <button
                      type="button"
                      onClick={() =>
                        setQueuedFeedback((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="hover:text-stone-900"
                    >
                      <X className="h-2 w-2" />
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
              className={`relative rounded-xl p-3 transition-colors ${
                isListening
                  ? 'animate-pulse bg-red-50 text-red-500'
                  : 'text-stone-400 hover:text-orange-500'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice to text'}
              aria-label={isListening ? 'Stop listening' : 'Start voice to text'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {isListening && (
                <span className="absolute top-2 right-2 h-2 w-2 animate-ping rounded-full bg-red-500" />
              )}
            </button>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className={`rounded-xl p-3 transition-colors ${
                isLocating
                  ? 'animate-pulse text-orange-500'
                  : 'text-stone-400 hover:text-orange-500'
              }`}
              title="Detect current neighborhood"
              aria-label="Detect current neighborhood"
            >
              <MapPin className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-3 text-stone-400 transition-colors hover:text-orange-500"
              title="Upload image"
              aria-label="Upload image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitMessage();
                }
              }}
              placeholder="I'm looking for a cozy Italian spot for a date night..."
              className="max-h-32 min-h-[44px] flex-1 resize-none border-none bg-transparent px-2 py-3 text-stone-800 placeholder-stone-400 outline-none focus:ring-0"
              rows={1}
            />
          </div>
        </div>
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="flex-shrink-0 rounded-2xl bg-orange-600 p-4 text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
