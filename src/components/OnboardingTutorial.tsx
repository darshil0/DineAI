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
  UtensilsCrossed
} from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: Step[] = [
  {
    title: "Welcome to DineAI",
    description: "Your intelligent culinary companion. We don't just find food; we discover experiences tailored specifically to your soul.",
    icon: <ChefHat className="w-12 h-12" />,
    color: "bg-orange-500"
  },
  {
    title: "Deep Personalization",
    description: "Our Profile Builder analyzes your preferences, history, and even 'vibes' to create a unique Taste Profile that evolves with you.",
    icon: <Sparkles className="w-12 h-12" />,
    color: "bg-purple-500"
  },
  {
    title: "Visual Intelligence",
    description: "Got a photo of a dish you loved? Upload it. Our AI identifies ingredients and styles to find similar culinary gems nearby.",
    icon: <Camera className="w-12 h-12" />,
    color: "bg-blue-500"
  },
  {
    title: "Trend-Aware Discovery",
    description: "We cross-reference local restaurant data with real-time Google Search trends to ensure your recommendations are always 'of the moment'.",
    icon: <TrendingUp className="w-12 h-12" />,
    color: "bg-emerald-500"
  },
  {
    title: "Ready to Explore?",
    description: "Tell us what you're craving, upload a photo, or just say hello. Your next favorite meal is one message away.",
    icon: <UtensilsCrossed className="w-12 h-12" />,
    color: "bg-orange-600"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden bg-white rounded-3xl shadow-2xl"
          >
            {/* Top Bar / Close */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors z-10"
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
                  <div className={`p-4 rounded-2xl ${steps[currentStep].color} text-white mb-6 shadow-lg shadow-${steps[currentStep].color.split('-')[1]}-200/50`}>
                    {steps[currentStep].icon}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-stone-900 mb-4 tracking-tight leading-tight">
                    {steps[currentStep].title}
                  </h2>
                  
                  <p className="text-lg text-stone-600 mb-8 leading-relaxed px-4">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
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
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${
                    currentStep === 0 
                      ? 'text-stone-300 cursor-not-allowed' 
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>

                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold shadow-xl shadow-stone-200 hover:bg-stone-800 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  {currentStep === steps.length - 1 ? "Let's Begin" : "Next Step"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className={`h-2 w-full transition-colors duration-500 ${steps[currentStep].color}`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
