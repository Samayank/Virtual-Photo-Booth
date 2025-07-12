import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { HorizontalFilterSelector } from './HorizontalFilterSelector';
import { CapturedPhoto } from '../pages/Index';
import { camanFilterManager } from '../lib/camanFilters';

interface PhotoReorderAndFilterProps {
  photos: CapturedPhoto[];
  onComplete: (reorderedAndFilteredPhotos: CapturedPhoto[]) => void;
  onBack: () => void;
}

export const PhotoReorderAndFilter: React.FC<PhotoReorderAndFilterProps> = ({
  photos,
  onComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState<'reorder' | 'filter'>('reorder');
  const [reorderedPhotos, setReorderedPhotos] = useState<CapturedPhoto[]>(photos);
  const [originalPhotos] = useState<CapturedPhoto[]>(photos.map(photo => ({ ...photo, filter: 'none' })));
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const currentPhoto = reorderedPhotos[currentPhotoIndex];

  useEffect(() => {
    if (currentStep === 'filter' && currentPhoto && canvasRef.current) {
      loadImageToCanvas();
    }
  }, [currentPhotoIndex, currentPhoto, currentStep]);

  const loadImageToCanvas = () => {
    if (!canvasRef.current || !currentPhoto) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      if (currentPhoto.filter !== 'none') {
        handleFilterApplication(currentPhoto.filter, false);
      }
    };
    img.src = currentPhoto.dataUrl;
  };

  const handleFilterApplication = async (filterId: string, updatePhoto: boolean = true) => {
    if (!canvasRef.current || !currentPhoto) return;

    setIsApplyingFilter(true);

    try {
      if (filterId === 'none') {
        // Reset to original image
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          if (updatePhoto) {
            const newDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const updatedPhotos = [...reorderedPhotos];
            updatedPhotos[currentPhotoIndex] = {
              ...currentPhoto,
              dataUrl: newDataUrl,
              filter: filterId
            };
            setReorderedPhotos(updatedPhotos);
          }
          setIsApplyingFilter(false);
        };
        // Use original photo data for 'none' filter
        const originalPhoto = originalPhotos.find(p => p.id === currentPhoto.id);
        img.src = originalPhoto?.dataUrl || currentPhoto.dataUrl;
        return;
      } else {
        await camanFilterManager.applyFilter(canvasRef.current, filterId);
      }

      if (updatePhoto) {
        const newDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        const updatedPhotos = [...reorderedPhotos];
        updatedPhotos[currentPhotoIndex] = {
          ...currentPhoto,
          dataUrl: newDataUrl,
          filter: filterId
        };
        setReorderedPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      if (canvasRef.current) {
        const fallbackStyle = camanFilterManager.getBasicFilterStyle(filterId);
        canvasRef.current.style.filter = fallbackStyle;
      }
    } finally {
      setIsApplyingFilter(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPhotos = [...reorderedPhotos];
    const draggedPhoto = newPhotos[draggedIndex];
    
    // Remove from old position
    newPhotos.splice(draggedIndex, 1);
    
    // Insert at new position
    newPhotos.splice(dropIndex, 0, draggedPhoto);
    
    setReorderedPhotos(newPhotos);
    setDraggedIndex(null);
  };

  const movePhoto = (fromIndex: number, direction: 'left' | 'right') => {
    const newPhotos = [...reorderedPhotos];
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    
    if (toIndex < 0 || toIndex >= newPhotos.length) return;
    
    // Swap photos
    [newPhotos[fromIndex], newPhotos[toIndex]] = [newPhotos[toIndex], newPhotos[fromIndex]];
    setReorderedPhotos(newPhotos);
  };

  const proceedToFilters = () => {
    setCurrentStep('filter');
    setCurrentPhotoIndex(0);
  };

  const goToNextPhoto = () => {
    if (currentPhotoIndex < reorderedPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else {
      onComplete(reorderedPhotos);
    }
  };

  const goToPreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  if (currentStep === 'reorder') {
    return (
      <div className="min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Arrange Your Photos</h2>
            <p className="text-muted-foreground">
              Drag to reorder or use arrow buttons
            </p>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {reorderedPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Order indicator */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                
                {/* Drag handle */}
                <div className="absolute top-2 right-2 glass-subtle rounded p-1 cursor-move">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>
                
                {/* Move buttons */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="glass-subtle w-8 h-8 p-0"
                    onClick={() => movePhoto(index, 'left')}
                    disabled={index === 0}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="glass-subtle w-8 h-8 p-0"
                    onClick={() => movePhoto(index, 'right')}
                    disabled={index === reorderedPhotos.length - 1}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <Button
              onClick={proceedToFilters}
              className="w-full bg-gradient-primary hover:opacity-90 text-white btn-touch"
              size="lg"
            >
              Apply Filters
            </Button>
            
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full btn-touch"
            >
              Back
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="mt-8 flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step <= 3 ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Filter step
  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Apply Filters</h2>
          <p className="text-muted-foreground">
            Photo {currentPhotoIndex + 1} of {reorderedPhotos.length}
          </p>
        </div>

        {/* Photo Preview */}
        <div className="relative mb-6">
          <div className="glass rounded-xl p-4">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              {isApplyingFilter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"
                >
                  <div className="text-center text-white">
                    <div className="w-8 h-8 mx-auto mb-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm">Applying filter...</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Selector */}
        <div className="mb-6">
          <HorizontalFilterSelector
            selectedFilter={currentPhoto.filter}
            onFilterChange={handleFilterApplication}
            showLabel={true}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={goToPreviousPhoto}
            disabled={currentPhotoIndex === 0}
            variant="outline"
            className="flex-1 mr-2"
          >
            Previous
          </Button>
          
          <div className="flex space-x-1 mx-4">
            {reorderedPhotos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentPhotoIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={goToNextPhoto}
            disabled={isApplyingFilter}
            className="flex-1 ml-2 bg-gradient-primary hover:opacity-90 text-white"
          >
            {currentPhotoIndex === reorderedPhotos.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Done
              </>
            ) : (
              'Next'
            )}
          </Button>
        </div>

        {/* Back button */}
        <Button
          onClick={() => setCurrentStep('reorder')}
          variant="outline"
          className="w-full btn-touch"
        >
          Back to Reorder
        </Button>

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step <= 4 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};