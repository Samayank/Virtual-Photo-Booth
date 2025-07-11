import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { CapturedPhoto } from '../pages/Index';

interface PhotoReorderProps {
  photos: CapturedPhoto[];
  onReorder: (reorderedPhotos: CapturedPhoto[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const PhotoReorder: React.FC<PhotoReorderProps> = ({
  photos,
  onReorder,
  onContinue,
  onBack
}) => {
  const [orderedPhotos, setOrderedPhotos] = useState<CapturedPhoto[]>(photos);

  const handleReorder = (newOrder: CapturedPhoto[]) => {
    setOrderedPhotos(newOrder);
    onReorder(newOrder);
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...orderedPhotos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      handleReorder(newOrder);
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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Arrange Your Photos</h2>
          <p className="text-muted-foreground">
            Drag to reorder or use the arrow buttons
          </p>
        </div>

        {/* Strip Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 glass rounded-xl"
        >
          <div className="text-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">Strip Preview</span>
          </div>
          <div className="space-y-2">
            {orderedPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                layout
                className="w-full aspect-[3/4] rounded-lg overflow-hidden border-2 border-white/20"
              >
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Reorderable Photo List */}
        <Reorder.Group
          axis="y"
          values={orderedPhotos}
          onReorder={handleReorder}
          className="space-y-4 mb-8"
        >
          {orderedPhotos.map((photo, index) => (
            <Reorder.Item
              key={photo.id}
              value={photo}
              className="glass rounded-xl p-3 cursor-grab active:cursor-grabbing"
              whileDrag={{ scale: 1.05, zIndex: 1000 }}
            >
              <div className="flex items-center space-x-3">
                {/* Drag handle */}
                <div className="flex-shrink-0">
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Photo thumbnail */}
                <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Photo info */}
                <div className="flex-1">
                  <div className="font-medium">Photo {index + 1}</div>
                  <div className="text-sm text-muted-foreground">
                    {photo.filter !== 'none' ? `Filter: ${photo.filter}` : 'No filter'}
                  </div>
                </div>

                {/* Move buttons */}
                <div className="flex flex-col space-y-1">
                  <Button
                    onClick={() => movePhoto(index, 'up')}
                    disabled={index === 0}
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-90" />
                  </Button>
                  <Button
                    onClick={() => movePhoto(index, 'down')}
                    disabled={index === orderedPhotos.length - 1}
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </Button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onContinue}
            className="w-full btn-touch bg-gradient-primary hover:opacity-90 text-white"
          >
            <ArrowDown className="w-5 h-5 mr-2" />
            Arrange & Filter
          </Button>
          
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full btn-touch"
          >
            Back to Review
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
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
};