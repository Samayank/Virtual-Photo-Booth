import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, Zap, X } from 'lucide-react';
import { Button } from './ui/button';
import { FilterSelector } from './FilterSelector';
import { CountdownTimer } from './CountdownTimer';
import { CapturedPhoto } from '../pages/Index';

interface CameraViewProps {
  onPhotoCaptured: (photo: CapturedPhoto) => void;
  onComplete: () => void;
  photoCount: number;
}

const TOTAL_PHOTOS = 3;

export const CameraView: React.FC<CameraViewProps> = ({
  onPhotoCaptured,
  onComplete,
  photoCount
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const switchCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply filter if selected
    if (selectedFilter !== 'none') {
      applyCanvasFilter(ctx, canvas.width, canvas.height, selectedFilter);
    }

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Create photo object
    const photo: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      filter: selectedFilter,
      timestamp: Date.now()
    };

    onPhotoCaptured(photo);
    setIsCapturing(false);
    setShowCountdown(false);

    // Check if we've captured all photos
    if (photoCount + 1 >= TOTAL_PHOTOS) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  const applyCanvasFilter = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filter: string
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    switch (filter) {
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        break;
      case 'vintage':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.2);
          data[i + 1] = Math.min(255, data[i + 1] * 0.9);
          data[i + 2] = Math.min(255, data[i + 2] * 0.8);
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getFilterStyle = (filter: string) => {
    switch (filter) {
      case 'sepia': return 'sepia(100%)';
      case 'grayscale': return 'grayscale(100%)';
      case 'vintage': return 'sepia(50%) contrast(120%) brightness(110%)';
      case 'cool': return 'hue-rotate(180deg) saturate(120%)';
      case 'warm': return 'sepia(30%) hue-rotate(10deg) saturate(130%)';
      default: return 'none';
    }
  };

  if (cameraError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Camera Access Required</h2>
          <p className="text-muted-foreground mb-6">{cameraError}</p>
          <Button onClick={startCamera} variant="outline" className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          filter: getFilterStyle(selectedFilter),
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
        }}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera overlay */}
      <div className="camera-overlay" />

      {/* Top UI */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-20"
      >
        <div className="flex items-center space-x-2">
          <div className="glass-subtle rounded-full px-3 py-1">
            <span className="text-sm font-medium">
              {photoCount + 1} / {TOTAL_PHOTOS}
            </span>
          </div>
        </div>
        
        <Button
          onClick={switchCamera}
          variant="ghost"
          size="sm"
          className="glass-subtle rounded-full w-10 h-10 p-0"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Filter selector */}
      <FilterSelector
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {/* Capture controls */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-0 inset-x-0 p-6 z-20"
      >
        <div className="flex justify-center">
          <Button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/50 hover:bg-white/30 transition-all duration-200"
          >
            {isCapturing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </Button>
        </div>
      </motion.div>

      {/* Countdown overlay */}
      <AnimatePresence>
        {showCountdown && (
          <CountdownTimer
            onComplete={handleCountdownComplete}
            onCancel={() => {
              setShowCountdown(false);
              setIsCapturing(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};