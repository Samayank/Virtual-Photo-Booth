import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { CameraView } from '../components/CameraView';
import { LiveFilterCamera } from '../components/LiveFilterCamera';
import { ImageUpload } from '../components/ImageUpload';
import { PhotoReview } from '../components/PhotoReview';
import { PhotoReorder } from '../components/PhotoReorder';
import { PhotoReorderAndFilter } from '../components/PhotoReorderAndFilter';
import { FilterApplication } from '../components/FilterApplication';
import { StripCustomizer } from '../components/StripCustomizer';
import { DownloadScreen } from '../components/DownloadScreen';

export type AppStep = 'welcome' | 'upload' | 'camera' | 'review' | 'reorder' | 'reorderAndFilter' | 'filters' | 'customize' | 'download';

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
  const [userChoice, setUserChoice] = useState<'camera' | 'upload' | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<AppStep[]>(['welcome']);

  // Initialize history state on mount
  useEffect(() => {
    // Set initial history state
    if (typeof window !== 'undefined') {
      history.replaceState({ step: 'welcome', historyIndex: 0 }, '', window.location.pathname);
    }
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.step) {
        const targetStep = event.state.step as AppStep;
        const historyIndex = event.state.historyIndex || 0;
        
        // Update current step without pushing new history
        setCurrentStep(targetStep);
        setNavigationHistory(prev => prev.slice(0, historyIndex + 1));
      } else {
        // Handle case where user is on first page and presses back
        if (currentStep === 'welcome') {
          const shouldExit = confirm("Do you want to exit the photo booth?");
          if (shouldExit) {
            window.close();
          } else {
            // Push current state back to prevent navigation
            history.pushState({ step: currentStep, historyIndex: 0 }, '', window.location.pathname);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStep]);

  const navigateToStep = (step: AppStep) => {
    // Update navigation history
    const newHistory = [...navigationHistory, step];
    setNavigationHistory(newHistory);
    
    // Push new state to browser history
    if (typeof window !== 'undefined') {
      history.pushState(
        { step, historyIndex: newHistory.length - 1 }, 
        '', 
        window.location.pathname
      );
    }
    
    setCurrentStep(step);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentStep(previousStep);
      
      // Update browser history
      if (typeof window !== 'undefined') {
        history.back();
      }
    }
  };

  const nextStep = () => {
    const steps: AppStep[] = ['welcome', 'upload', 'camera', 'review', 'reorder', 'reorderAndFilter', 'filters', 'customize', 'download'];
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
    setUserChoice(null);
    setNavigationHistory(['welcome']);
    
    // Reset browser history to initial state
    if (typeof window !== 'undefined') {
      history.replaceState({ step: 'welcome', historyIndex: 0 }, '', window.location.pathname);
    }
  };

  const addPhoto = (photo: CapturedPhoto) => {
    setCapturedPhotos(prev => [...prev, photo]);
  };

  const addPhotos = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(prev => [...prev, ...photos]);
  };

  const removePhoto = (photoId: string) => {
    setCapturedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const reorderPhotos = (reorderedPhotos: CapturedPhoto[]) => {
    setCapturedPhotos(reorderedPhotos);
  };

  const handleUploadComplete = (photos: CapturedPhoto[]) => {
    addPhotos(photos);
    setUserChoice('upload');
    if (capturedPhotos.length + photos.length >= 3) {
      navigateToStep('review');
    }
  };

  const handleCameraChoice = () => {
    setUserChoice('camera');
    navigateToStep('camera');
  };

  const handleCameraComplete = () => {
    // For camera photos, go directly to reorder (filters already applied)
    navigateToStep('reorder');
  };

  const handleReviewComplete = () => {
    // Both camera and upload photos go directly to reorder (no filters for uploads)
    navigateToStep('reorder');
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
            <WelcomeScreen onStart={() => navigateToStep('upload')} />
          </motion.div>
        )}

        {currentStep === 'upload' && (
          <motion.div
            key="upload"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <ImageUpload
              onPhotosUploaded={handleUploadComplete}
              onCameraMode={handleCameraChoice}
              currentPhotoCount={capturedPhotos.length}
            />
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
            <LiveFilterCamera
              onPhotoCaptured={addPhoto}
              onComplete={handleCameraComplete}
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
              onRetake={() => navigateToStep('upload')}
              onContinue={handleReviewComplete}
              onRemovePhoto={removePhoto}
            />
          </motion.div>
        )}

        {currentStep === 'reorder' && (
          <motion.div
            key="reorder"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <PhotoReorder
              photos={capturedPhotos}
              onReorder={reorderPhotos}
              onContinue={() => navigateToStep('customize')}
              onBack={goBack}
            />
          </motion.div>
        )}

        {currentStep === 'reorderAndFilter' && (
          <motion.div
            key="reorderAndFilter"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <PhotoReorderAndFilter
              photos={capturedPhotos}
              onComplete={(reorderedAndFilteredPhotos) => {
                setCapturedPhotos(reorderedAndFilteredPhotos);
                navigateToStep('customize');
              }}
              onBack={goBack}
            />
          </motion.div>
        )}

        {currentStep === 'filters' && (
          <motion.div
            key="filters"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <FilterApplication
              photos={capturedPhotos}
              onComplete={(filteredPhotos) => {
                setCapturedPhotos(filteredPhotos);
                navigateToStep('customize');
              }}
              onBack={goBack}
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
                navigateToStep('download');
              }}
              onBack={goBack}
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
