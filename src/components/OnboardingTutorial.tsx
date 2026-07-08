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
  UtensilsCrossed
} from 'lucide-react';

const steps = [
  {
    title: "Welcome to DineAI",
    description: "Your intelligent culinary companion. We don't just find food; we discover experiences tailored specifically to your soul.",
    icon: <ChefHat className="w-12 h-12" />,
  },
  {
    title: "Deep Personalization",
    description: "Our Profile Builder analyzes your preferences, history, and even 'vibes' to create a unique Taste Profile that evolves with you.",
    icon: <Sparkles className="w-12 h-12" />,
  },
  {
    title: "Visual Intelligence",
    description: "Got a photo of a dish you loved? Upload it. Our AI identifies ingredients and styles to find similar culinary gems nearby.",
    icon: <Camera className="w-12 h-12" />,
  },
  {
    title: "Trend-Aware Discovery",
    description: "We cross-reference local restaurant data with real-time Google Search trends to ensure your recommendations are always 'of the moment'.",
    icon: <TrendingUp className="w-12 h-12" />,
  },
  {
    title: "Ready to Explore?",
    description: "Tell us what you're craving, upload a photo, or just say hello. Your next favorite meal is one message away.",
    icon: <UtensilsCrossed className="w-12 h-12" />,
  }
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden glass-card shadow-[0_0_50px_-12px_rgba(212,175,55,0.2)]"
          >
            {/* Top Bar / Close */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
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
                  <div className="p-6 rounded-3xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] mb-8 shadow-xl border border-[var(--color-brand-primary)]/20">
                    {steps[currentStep].icon}
                  </div>
                  
                  <h2 className="text-4xl font-bold text-[var(--color-text-main)] mb-4 tracking-tight leading-tight font-serif">
                    {steps[currentStep].title}
                  </h2>
                  
                  <p className="text-lg text-[var(--color-text-muted)] mb-10 leading-relaxed px-4">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2.5 mb-10">
                {steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
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
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                    currentStep === 0 
                      ? 'opacity-0 cursor-default' 
                      : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-4 bg-[var(--color-brand-primary)] text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--color-brand-primary)]/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  {currentStep === steps.length - 1 ? "Let's Begin" : "Next Step"}
                  <ChevronRight className="w-4 h-4" />
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
