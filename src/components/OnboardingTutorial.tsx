import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChefHat,
  Camera,
  TrendingUp,
  X,
  ChevronRight,
  ChevronLeft,
  UtensilsCrossed,
} from 'lucide-react';

const steps = [
  {
    title: 'Welcome to DineAI',
    description:
      "Your intelligent culinary companion. We don't just find food; we discover experiences tailored specifically to your soul.",
    icon: <ChefHat className="h-12 w-12" />,
  },
  {
    title: 'Deep Personalization',
    description:
      "Our Profile Builder analyzes your preferences, history, and even 'vibes' to create a unique Taste Profile that evolves with you.",
    icon: <Sparkles className="h-12 w-12" />,
  },
  {
    title: 'Visual Intelligence',
    description:
      'Got a photo of a dish you loved? Upload it. Our AI identifies ingredients and styles to find similar culinary gems nearby.',
    icon: <Camera className="h-12 w-12" />,
  },
  {
    title: 'Trend-Aware Discovery',
    description:
      "We cross-reference local restaurant data with real-time Google Search trends to ensure your recommendations are always 'of the moment'.",
    icon: <TrendingUp className="h-12 w-12" />,
  },
  {
    title: 'Ready to Explore?',
    description:
      "Tell us what you're craving, upload a photo, or just say hello. Your next favorite meal is one message away.",
    icon: <UtensilsCrossed className="h-12 w-12" />,
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card relative w-full max-w-lg overflow-hidden shadow-[0_0_50px_-12px_rgba(212,175,55,0.2)]"
          >
            {/* Top Bar / Close */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-10 rounded-full p-2 text-white/20 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content Area */}
            <div className="p-8 pt-12 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-8 rounded-3xl border border-[var(--color-brand-primary)]/20 bg-[var(--color-brand-primary)]/10 p-6 text-[var(--color-brand-primary)] shadow-xl">
                    {steps[currentStep].icon}
                  </div>

                  <h2 className="mb-4 font-serif text-4xl leading-tight font-bold tracking-tight text-[var(--color-text-main)]">
                    {steps[currentStep].title}
                  </h2>

                  <p className="mb-10 px-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="mb-10 flex justify-center gap-2.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? 'w-10 bg-[var(--color-brand-primary)]' : 'w-2 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-[11px] font-bold tracking-widest uppercase transition-all ${
                    currentStep === 0
                      ? 'cursor-default opacity-0'
                      : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-2xl bg-[var(--color-brand-primary)] px-8 py-4 text-xs font-black tracking-widest text-black uppercase shadow-[var(--color-brand-primary)]/20 shadow-xl transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                >
                  {currentStep === steps.length - 1 ? "Let's Begin" : 'Next Step'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--color-brand-primary)] to-transparent opacity-20" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
