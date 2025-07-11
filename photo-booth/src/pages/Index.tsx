import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { CameraView } from '../components/CameraView';
import { PhotoReview } from '../components/PhotoReview';
import { StripCustomizer } from '../components/StripCustomizer';
import { DownloadScreen } from '../components/DownloadScreen';

export type AppStep = 'welcome' | 'camera' | 'review' | 'customize' | 'download';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  filter: string;
  timestamp: number;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [finalStrip, setFinalStrip] = useState<string | null>(null);

  const nextStep = () => {
    const steps: AppStep[] = ['welcome', 'camera', 'review', 'customize', 'download'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToStep = (step: AppStep) => {
    setCurrentStep(step);
  };

  const resetApp = () => {
    setCapturedPhotos([]);
    setFinalStrip(null);
    setCurrentStep('welcome');
  };

  const addPhoto = (photo: CapturedPhoto) => {
    setCapturedPhotos(prev => [...prev, photo]);
  };

  const removePhoto = (photoId: string) => {
    setCapturedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const stepVariants = {
    enter: { opacity: 0, x: 100 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && (
          <motion.div
            key="welcome"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen onStart={() => nextStep()} />
          </motion.div>
        )}

        {currentStep === 'camera' && (
          <motion.div
            key="camera"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <CameraView
              onPhotoCaptured={addPhoto}
              onComplete={() => nextStep()}
              photoCount={capturedPhotos.length}
            />
          </motion.div>
        )}

        {currentStep === 'review' && (
          <motion.div
            key="review"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <PhotoReview
              photos={capturedPhotos}
              onRetake={() => goToStep('camera')}
              onContinue={() => nextStep()}
              onRemovePhoto={removePhoto}
            />
          </motion.div>
        )}

        {currentStep === 'customize' && (
          <motion.div
            key="customize"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <StripCustomizer
              photos={capturedPhotos}
              onComplete={(stripDataUrl) => {
                setFinalStrip(stripDataUrl);
                nextStep();
              }}
              onBack={() => goToStep('review')}
            />
          </motion.div>
        )}

        {currentStep === 'download' && finalStrip && (
          <motion.div
            key="download"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <DownloadScreen
              stripDataUrl={finalStrip}
              onRestart={resetApp}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;