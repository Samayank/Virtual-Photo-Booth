import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trash2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { CapturedPhoto } from '../pages/Index';

interface PhotoReviewProps {
  photos: CapturedPhoto[];
  onRetake: () => void;
  onContinue: () => void;
  onRemovePhoto: (photoId: string) => void;
}

export const PhotoReview: React.FC<PhotoReviewProps> = ({
  photos,
  onRetake,
  onContinue,
  onRemovePhoto
}) => {
  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Review Your Photos</h2>
          <p className="text-muted-foreground">
            {photos.length < 3 
              ? `You have ${photos.length} photo${photos.length !== 1 ? 's' : ''}. Add ${3 - photos.length} more or continue.`
              : 'Perfect! Ready to arrange them?'
            }
          </p>
        </div>

        {/* Photo grid */}
        <div className="space-y-4 mb-8">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="glass rounded-xl p-2">
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full aspect-[3/4] object-cover rounded-lg"
                />
                
                {/* Photo controls */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => onRemovePhoto(photo.id)}
                    variant="destructive"
                    size="sm"
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Photo number */}
                <div className="absolute bottom-4 left-4">
                  <div className="glass-subtle rounded-full px-2 py-1">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onContinue}
            className="w-full btn-touch bg-gradient-primary hover:opacity-90 text-white"
            disabled={photos.length === 0}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            {photos.length >= 3 ? 'Arrange Photos' : 'Continue'}
          </Button>
          
          <Button
            onClick={onRetake}
            variant="outline"
            className="w-full btn-touch"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Add More Photos
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step <= 2 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};