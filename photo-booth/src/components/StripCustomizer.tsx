import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { CapturedPhoto } from '../pages/Index';

interface StripCustomizerProps {
  photos: CapturedPhoto[];
  onComplete: (stripDataUrl: string) => void;
  onBack: () => void;
}

const layouts = [
  { id: 'vertical', name: 'Classic', aspect: '3:4' },
  { id: 'horizontal', name: 'Wide', aspect: '4:3' },
  { id: 'grid', name: 'Grid', aspect: '1:1' }
];

const backgroundColors = [
  { id: 'white', name: 'White', color: '#ffffff' },
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'primary', name: 'Primary', color: 'hsl(251 86% 67%)' },
  { id: 'accent', name: 'Accent', color: 'hsl(189 94% 42%)' }
];

export const StripCustomizer: React.FC<StripCustomizerProps> = ({
  photos,
  onComplete,
  onBack
}) => {
  const [selectedLayout, setSelectedLayout] = useState('vertical');
  const [selectedBackground, setSelectedBackground] = useState('white');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateStrip();
  }, [selectedLayout, selectedBackground, photos]);

  const generateStrip = async () => {
    if (!canvasRef.current || photos.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load images first to get their natural dimensions
    const imagePromises = photos.map(photo => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = photo.dataUrl;
      });
    });

    const images = await Promise.all(imagePromises);
    if (images.length === 0) return;

    // Calculate canvas dimensions based on original image aspect ratios
    const firstImage = images[0];
    const imageAspectRatio = firstImage.width / firstImage.height;
    
    // Set canvas dimensions based on layout and preserve aspect ratios
    if (selectedLayout === 'vertical') {
      // Vertical layout: stack images preserving their aspect ratio
      const stripWidth = 400;
      const imageWidth = stripWidth - 80; // padding
      const imageHeight = imageWidth / imageAspectRatio;
      const padding = 40;
      const spacing = 30;
      const textHeight = 80;
      
      canvas.width = stripWidth;
      canvas.height = padding + (images.length * imageHeight) + ((images.length - 1) * spacing) + textHeight + padding;
    } else if (selectedLayout === 'horizontal') {
      // Horizontal layout: place images side by side
      const stripHeight = 400;
      const imageHeight = stripHeight - 80; // padding
      const imageWidth = imageHeight * imageAspectRatio;
      const padding = 40;
      const spacing = 30;
      
      canvas.width = padding + (images.length * imageWidth) + ((images.length - 1) * spacing) + padding;
      canvas.height = stripHeight;
    } else { // grid
      const stripSize = 800;
      const padding = 40;
      const spacing = 30;
      const imageSize = (stripSize - (padding * 2) - spacing) / 2;
      
      canvas.width = stripSize;
      canvas.height = stripSize;
    }

    // Get background color
    const bgColor = backgroundColors.find(bg => bg.id === selectedBackground)?.color || '#ffffff';
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw photos based on layout preserving aspect ratios
    if (selectedLayout === 'vertical') {
      // Vertical layout: stack images preserving their aspect ratio
      const padding = 40;
      const imageWidth = canvas.width - (padding * 2);
      const imageAspectRatio = images[0].width / images[0].height;
      const imageHeight = imageWidth / imageAspectRatio;
      const spacing = 30;

      // Draw photos with white borders
      images.forEach((img, index) => {
        const y = padding + index * (imageHeight + spacing);
        
        // Draw white border/frame
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(padding - 10, y - 10, imageWidth + 20, imageHeight + 20);
        
        // Draw photo at original aspect ratio
        ctx.drawImage(img, padding, y, imageWidth, imageHeight);
        
        // Add subtle inner border
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, y, imageWidth, imageHeight);
      });

      // Add text at bottom
      const textY = canvas.height - 50;
      ctx.fillStyle = selectedBackground === 'white' ? '#666666' : '#ffffff';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BOOTHLY', canvas.width / 2, textY);
      ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, textY + 25);
    } else if (selectedLayout === 'horizontal') {
      // Horizontal layout: place images side by side preserving aspect ratio
      const padding = 40;
      const imageHeight = canvas.height - (padding * 2);
      const imageAspectRatio = images[0].width / images[0].height;
      const imageWidth = imageHeight * imageAspectRatio;
      const spacing = 30;

      images.forEach((img, index) => {
        const x = padding + index * (imageWidth + spacing);
        
        // Draw white border/frame
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 10, padding - 10, imageWidth + 20, imageHeight + 20);
        
        // Draw photo at original aspect ratio
        ctx.drawImage(img, x, padding, imageWidth, imageHeight);
        
        // Add subtle inner border
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, padding, imageWidth, imageHeight);
      });
    } else {
      // Grid layout - preserve aspect ratio with object-fit contain behavior
      const padding = 40;
      const spacing = 30;
      const cellSize = (canvas.width - (padding * 2) - spacing) / 2;
      const positions = [
        { x: padding, y: padding },
        { x: padding + cellSize + spacing, y: padding },
        { x: padding, y: padding + cellSize + spacing },
        { x: padding + cellSize + spacing, y: padding + cellSize + spacing }
      ];

      images.forEach((img, index) => {
        if (index < 4) {
          const pos = positions[index];
          
          // Calculate dimensions to fit image in cell while preserving aspect ratio
          const imageAspectRatio = img.width / img.height;
          let drawWidth = cellSize;
          let drawHeight = cellSize / imageAspectRatio;
          
          if (drawHeight > cellSize) {
            drawHeight = cellSize;
            drawWidth = cellSize * imageAspectRatio;
          }
          
          // Center the image in the cell
          const offsetX = (cellSize - drawWidth) / 2;
          const offsetY = (cellSize - drawHeight) / 2;
          
          // Draw white border/frame
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(pos.x - 10, pos.y - 10, cellSize + 20, cellSize + 20);
          
          // Draw photo centered and aspect-ratio preserved
          ctx.drawImage(img, pos.x + offsetX, pos.y + offsetY, drawWidth, drawHeight);
          
          // Add subtle inner border
          ctx.strokeStyle = '#e5e5e5';
          ctx.lineWidth = 1;
          ctx.strokeRect(pos.x, pos.y, cellSize, cellSize);
        }
      });
    }

    // Add outer border
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  };

  const handleComplete = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    onComplete(dataUrl);
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button onClick={onBack} variant="ghost" size="sm" className="mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Customize Strip</h2>
            <p className="text-sm text-muted-foreground">Choose your style</p>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-8">
          <div className="glass rounded-xl p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg border"
              style={{ maxHeight: '300px' }}
            />
          </div>
        </div>

        {/* Layout options */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Layout
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {layouts.map((layout) => (
              <Button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                variant={selectedLayout === layout.id ? "default" : "outline"}
                className="btn-touch text-sm"
              >
                {layout.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Background options */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">Background</h3>
          <div className="grid grid-cols-4 gap-2">
            {backgroundColors.map((bg) => (
              <Button
                key={bg.id}
                onClick={() => setSelectedBackground(bg.id)}
                variant="outline"
                className={`btn-touch h-12 ${
                  selectedBackground === bg.id ? 'ring-2 ring-primary' : ''
                }`}
                style={{ backgroundColor: bg.color }}
              >
                <span className="sr-only">{bg.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Complete button */}
        <Button
          onClick={handleComplete}
          className="w-full btn-touch bg-gradient-primary hover:opacity-90 text-white"
        >
          <Download className="w-5 h-5 mr-2" />
          Create Photo Strip
        </Button>

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