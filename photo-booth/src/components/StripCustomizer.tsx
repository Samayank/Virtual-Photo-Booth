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

    // Set dimensions based on layout
    if (selectedLayout === 'vertical') {
      canvas.width = 400;
      canvas.height = 1200;
    } else if (selectedLayout === 'horizontal') {
      canvas.width = 1200;
      canvas.height = 400;
    } else { // grid
      canvas.width = 800;
      canvas.height = 800;
    }

    // Get background color
    const bgColor = backgroundColors.find(bg => bg.id === selectedBackground)?.color || '#ffffff';
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw photos
    const imagePromises = photos.map(photo => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = photo.dataUrl;
      });
    });

    const images = await Promise.all(imagePromises);

    if (selectedLayout === 'vertical') {
      // Classic vertical photo strip layout
      const padding = 40;
      const photoWidth = canvas.width - (padding * 2);
      const photoHeight = 240;
      const photoSpacing = 30;
      const startY = 50;

      // Draw photos with white borders
      images.forEach((img, index) => {
        const y = startY + index * (photoHeight + photoSpacing);
        
        // Draw white border/frame
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(padding - 10, y - 10, photoWidth + 20, photoHeight + 20);
        
        // Draw photo
        ctx.drawImage(img, padding, y, photoWidth, photoHeight);
        
        // Add subtle inner border
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, y, photoWidth, photoHeight);
      });

      // Add text at bottom
      const textY = startY + 3 * (photoHeight + photoSpacing) + 40;
      ctx.fillStyle = selectedBackground === 'white' ? '#666666' : '#ffffff';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BOOTHLY', canvas.width / 2, textY);
      ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, textY + 25);
    } else if (selectedLayout === 'horizontal') {
      // Horizontal layout - photos side by side
      const padding = 40;
      const photoWidth = (canvas.width - (padding * 2) - (30 * 3)) / 4;
      const photoHeight = canvas.height - (padding * 2);
      const startX = padding;

      images.forEach((img, index) => {
        const x = startX + index * (photoWidth + 30);
        
        // Draw white border/frame
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 10, padding - 10, photoWidth + 20, photoHeight + 20);
        
        // Draw photo
        ctx.drawImage(img, x, padding, photoWidth, photoHeight);
        
        // Add subtle inner border
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, padding, photoWidth, photoHeight);
      });
    } else {
      // Grid layout - 2x2
      const padding = 40;
      const photoSize = (canvas.width - (padding * 2) - 30) / 2;
      const positions = [
        { x: padding, y: padding },
        { x: padding + photoSize + 30, y: padding },
        { x: padding, y: padding + photoSize + 30 },
        { x: padding + photoSize + 30, y: padding + photoSize + 30 }
      ];

      images.forEach((img, index) => {
        if (index < 4) {
          const pos = positions[index];
          
          // Draw white border/frame
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(pos.x - 10, pos.y - 10, photoSize + 20, photoSize + 20);
          
          // Draw photo
          ctx.drawImage(img, pos.x, pos.y, photoSize, photoSize);
          
          // Add subtle inner border
          ctx.strokeStyle = '#e5e5e5';
          ctx.lineWidth = 1;
          ctx.strokeRect(pos.x, pos.y, photoSize, photoSize);
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