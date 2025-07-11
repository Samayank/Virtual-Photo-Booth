import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { CapturedPhoto } from '../pages/Index';
import { FilterSelector } from './FilterSelector';
import { camanFilterManager } from '../lib/camanFilters';

interface FilterApplicationProps {
  photos: CapturedPhoto[];
  onComplete: (filteredPhotos: CapturedPhoto[]) => void;
  onBack: () => void;
}

export const FilterApplication: React.FC<FilterApplicationProps> = ({
  photos,
  onComplete,
  onBack
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isApplying, setIsApplying] = useState(false);
  const [filteredPhotos, setFilteredPhotos] = useState<CapturedPhoto[]>(photos);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPhoto = filteredPhotos[currentPhotoIndex];

  useEffect(() => {
    if (currentPhoto && canvasRef.current) {
      loadImageToCanvas();
    }
  }, [currentPhotoIndex, currentPhoto]);

  const loadImageToCanvas = () => {
    if (!canvasRef.current || !currentPhoto) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Clear canvas and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Apply current filter if not 'none'
      if (currentPhoto.filter !== 'none') {
        handleFilterApplication(currentPhoto.filter, false);
      }
    };
    img.src = currentPhoto.dataUrl;
  };

  const handleFilterApplication = async (filterId: string, updatePhoto: boolean = true) => {
    if (!canvasRef.current || !currentPhoto) return;

    setIsApplying(true);
    setSelectedFilter(filterId);

    try {
      if (filterId === 'none') {
        // Just reload the original image
        loadImageToCanvas();
      } else {
        // Apply CamanJS filter
        await camanFilterManager.applyFilter(canvasRef.current, filterId);
      }

      if (updatePhoto) {
        // Update photo with new filter and data
        const newDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        const updatedPhotos = [...filteredPhotos];
        updatedPhotos[currentPhotoIndex] = {
          ...currentPhoto,
          dataUrl: newDataUrl,
          filter: filterId
        };
        setFilteredPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      // Fallback to CSS filter style
      if (canvasRef.current) {
        const fallbackStyle = camanFilterManager.getBasicFilterStyle(filterId);
        canvasRef.current.style.filter = fallbackStyle;
      }
    } finally {
      setIsApplying(false);
    }
  };

  const goToNextPhoto = () => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      setSelectedFilter(filteredPhotos[currentPhotoIndex + 1].filter);
    } else {
      onComplete(filteredPhotos);
    }
  };

  const goToPreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      setSelectedFilter(filteredPhotos[currentPhotoIndex - 1].filter);
    }
  };

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
            Photo {currentPhotoIndex + 1} of {filteredPhotos.length}
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
              
              {/* Loading overlay */}
              {isApplying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"
                >
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">Applying filter...</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Filter Selector */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <FilterSelector
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterApplication}
            />
          </div>
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
            {filteredPhotos.map((_, index) => (
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
            disabled={isApplying}
            className="flex-1 ml-2 bg-gradient-primary hover:opacity-90 text-white"
          >
            {currentPhotoIndex === filteredPhotos.length - 1 ? (
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
          onClick={onBack}
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