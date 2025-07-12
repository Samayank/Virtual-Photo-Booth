import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { CapturedPhoto } from '../pages/Index';
import heic2any from 'heic2any';

interface ImageUploadProps {
  onPhotosUploaded: (photos: CapturedPhoto[]) => void;
  onCameraMode: () => void;
  currentPhotoCount: number;
  maxPhotos?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onPhotosUploaded,
  onCameraMode,
  currentPhotoCount,
  maxPhotos = 3
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const remainingSlots = maxPhotos - currentPhotoCount;

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const validFiles = files
      .filter(file => file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif'))
      .slice(0, remainingSlots);

    const newPhotos: CapturedPhoto[] = [];
    const previews: string[] = [];

    for (const file of validFiles) {
      try {
        let processedFile = file;
        
        // Convert HEIC/HEIF to JPEG
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
          try {
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.8
            }) as Blob;
            processedFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
              type: 'image/jpeg'
            });
          } catch (heicError) {
            console.error('Error converting HEIC file:', heicError);
            continue; // Skip this file if conversion fails
          }
        }
        
        const dataUrl = await fileToDataUrl(processedFile);
        const photo: CapturedPhoto = {
          id: Date.now().toString() + Math.random(),
          dataUrl,
          filter: 'none',
          timestamp: Date.now()
        };
        newPhotos.push(photo);
        previews.push(dataUrl);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }

    setUploadedPreviews(previews);
    
    // Add delay for visual feedback
    setTimeout(() => {
      onPhotosUploaded(newPhotos);
      setIsUploading(false);
      setUploadedPreviews([]);
    }, 1000);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center"
          >
            <ImageIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Add Your Photos</h1>
          <p className="text-muted-foreground">
            {currentPhotoCount > 0 
              ? `Add ${remainingSlots} more photo${remainingSlots !== 1 ? 's' : ''}`
              : 'Choose how to add your photos'
            }
          </p>
        </div>

        {/* Upload previews */}
        {uploadedPreviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="grid grid-cols-3 gap-2">
              {uploadedPreviews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-[3/4] rounded-lg overflow-hidden"
                >
                  <img
                    src={preview}
                    alt={`Upload preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upload options */}
        <div className="space-y-4 mb-8">
          <Button
            onClick={handleFileSelect}
            disabled={remainingSlots === 0 || isUploading}
            className="w-full btn-touch glass hover:bg-white/20 text-white border-white/20"
            size="lg"
          >
            {isUploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="w-5 h-5 mr-2" />
              </motion.div>
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {isUploading ? 'Processing...' : `Choose from Gallery (${remainingSlots} left)`}
          </Button>

          <div className="flex items-center space-x-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <Button
            onClick={onCameraMode}
            variant="outline"
            className="w-full btn-touch"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Use Camera
          </Button>
        </div>

        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step <= 1 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};