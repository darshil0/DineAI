import React, { useState, useEffect } from 'react';
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

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: Step[] = [
  {
    title: 'Welcome to DineAI',
    description:
      "Your intelligent culinary companion. We don't just find food; we discover experiences tailored specifically to your soul.",
    icon: <ChefHat className="h-12 w-12" />,
    color: 'bg-orange-500',
  },
  {
    title: 'Deep Personalization',
    description:
      "Our Profile Builder analyzes your preferences, history, and even 'vibes' to create a unique Taste Profile that evolves with you.",
    icon: <Sparkles className="h-12 w-12" />,
    color: 'bg-purple-500',
  },
  {
    title: 'Visual Intelligence',
    description:
      'Got a photo of a dish you loved? Upload it. Our AI identifies ingredients and styles to find similar culinary gems nearby.',
    icon: <Camera className="h-12 w-12" />,
    color: 'bg-blue-500',
  },
  {
    title: 'Trend-Aware Discovery',
    description:
      "We cross-reference local restaurant data with real-time Google Search trends to ensure your recommendations are always 'of the moment'.",
    icon: <TrendingUp className="h-12 w-12" />,
    color: 'bg-emerald-500',
  },
  {
    title: 'Ready to Explore?',
    description:
      "Tell us what you're craving, upload a photo, or just say hello. Your next favorite meal is one message away.",
    icon: <UtensilsCrossed className="h-12 w-12" />,
    color: 'bg-orange-600',
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Top Bar / Close */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-10 rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
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
                  <div
                    className={`rounded-2xl p-4 ${steps[currentStep].color} mb-6 text-white shadow-lg shadow-${steps[currentStep].color.split('-')[1]}-200/50`}
                  >
                    {steps[currentStep].icon}
                  </div>

                  <h2 className="mb-4 text-3xl leading-tight font-bold tracking-tight text-stone-900">
                    {steps[currentStep].title}
                  </h2>

                  <p className="mb-8 px-4 text-lg leading-relaxed text-stone-600">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="mb-8 flex justify-center gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? 'w-8 bg-stone-800' : 'w-2 bg-stone-200'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-medium transition-all ${
                    currentStep === 0
                      ? 'cursor-not-allowed text-stone-300'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>

                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-2xl bg-stone-900 px-8 py-4 font-semibold text-white shadow-xl shadow-stone-200 transition-all hover:-translate-y-0.5 hover:bg-stone-800 active:translate-y-0"
                >
                  {currentStep === steps.length - 1 ? "Let's Begin" : 'Next Step'}
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Bottom Accent */}
            <div
              className={`h-2 w-full transition-colors duration-500 ${steps[currentStep].color}`}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
