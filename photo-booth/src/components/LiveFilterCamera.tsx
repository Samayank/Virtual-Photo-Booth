import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, Zap, X, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CountdownTimer } from './CountdownTimer';
import { HorizontalFilterSelector } from './HorizontalFilterSelector';
import { CapturedPhoto } from '../pages/Index';
import { camanFilterManager } from '../lib/camanFilters';

interface LiveFilterCameraProps {
  onPhotoCaptured: (photo: CapturedPhoto) => void;
  onComplete: () => void;
  photoCount: number;
}

interface CameraDevice {
  deviceId: string;
  label: string;
  displayName: string;
}

const TOTAL_PHOTOS = 3;

export const LiveFilterCamera: React.FC<LiveFilterCameraProps> = ({
  onPhotoCaptured,
  onComplete,
  photoCount
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [timerDuration, setTimerDuration] = useState(3);

  useEffect(() => {
    enumerateCameras();
  }, []);

  useEffect(() => {
    if (facingMode === 'environment' && availableCameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(availableCameras[0].deviceId);
    } else {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, selectedCameraId]);

  // Apply live filter to video
  useEffect(() => {
    if (videoRef.current && selectedFilter !== 'none') {
      const filterStyle = camanFilterManager.getBasicFilterStyle(selectedFilter);
      videoRef.current.style.filter = filterStyle;
    } else if (videoRef.current) {
      videoRef.current.style.filter = 'none';
    }
  }, [selectedFilter]);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      const rearCameras = videoDevices.filter(device => {
        const label = device.label.toLowerCase();
        return label.includes('back') || 
               label.includes('rear') || 
               label.includes('environment') ||
               label.includes('wide') ||
               label.includes('ultra');
      });

      const processedCameras: CameraDevice[] = rearCameras.map((device, index) => {
        let displayName = `Rear Camera ${index + 1}`;
        const label = device.label.toLowerCase();
        
        if (label.includes('ultra') && label.includes('wide')) {
          displayName = 'Ultrawide';
        } else if (label.includes('wide')) {
          displayName = 'Wide';
        } else if (label.includes('telephoto')) {
          displayName = 'Telephoto';
        }
        
        return {
          deviceId: device.deviceId,
          label: device.label,
          displayName
        };
      });

      setAvailableCameras(processedCameras);
      
      if (processedCameras.length > 0 && facingMode === 'environment') {
        setSelectedCameraId(processedCameras[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating cameras:', error);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: facingMode === 'environment' && selectedCameraId 
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCameraId(deviceId);
  };

  const switchCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (newFacingMode === 'environment' && availableCameras.length > 0) {
      setSelectedCameraId(availableCameras[0].deviceId);
    } else {
      setSelectedCameraId('');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    
    if (timerDuration > 0) {
      setShowCountdown(true);
    } else {
      // Capture immediately if timer is off
      handleCountdownComplete();
    }
  };

  const handleCountdownComplete = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply the selected filter to the captured image
    if (selectedFilter !== 'none') {
      const filterStyle = camanFilterManager.getBasicFilterStyle(selectedFilter);
      ctx.filter = filterStyle;
    }
    
    if (facingMode === 'user') {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    }

    // Reset filter for next capture
    ctx.filter = 'none';

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const photo: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      filter: selectedFilter,
      timestamp: Date.now()
    };

    onPhotoCaptured(photo);
    setIsCapturing(false);
    setShowCountdown(false);

    if (photoCount + 1 >= TOTAL_PHOTOS) {
      setTimeout(() => {
        onComplete();
      }, 1000);
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
    <div className="min-h-screen relative overflow-hidden bg-black flex flex-col">
      {/* Camera feed container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-4/5 max-w-sm aspect-[3/4] overflow-hidden rounded-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            style={{ 
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
            }}
          />
          
          {/* Grid lines overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30"></div>
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30"></div>
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30"></div>
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30"></div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

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
          
          {/* Timer selector */}
          <Select value={timerDuration.toString()} onValueChange={(value) => setTimerDuration(parseInt(value))}>
            <SelectTrigger className="glass-subtle border-white/20 text-white w-auto min-w-[80px]">
              <Timer className="w-4 h-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              <SelectItem value="0" className="text-white hover:bg-white/10 focus:bg-white/10">Off</SelectItem>
              <SelectItem value="3" className="text-white hover:bg-white/10 focus:bg-white/10">3s</SelectItem>
              <SelectItem value="5" className="text-white hover:bg-white/10 focus:bg-white/10">5s</SelectItem>
              <SelectItem value="10" className="text-white hover:bg-white/10 focus:bg-white/10">10s</SelectItem>
            </SelectContent>
          </Select>
          
          {facingMode === 'environment' && availableCameras.length > 1 && (
            <Select value={selectedCameraId} onValueChange={handleCameraChange}>
              <SelectTrigger className="glass-subtle border-white/20 text-white w-auto min-w-[100px]">
                <SelectValue placeholder="Camera" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                {availableCameras.map((camera) => (
                  <SelectItem 
                    key={camera.deviceId} 
                    value={camera.deviceId}
                    className="text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    {camera.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-24 inset-x-0 px-4 z-20"
      >
        <div className="glass-subtle rounded-xl p-4">
          <HorizontalFilterSelector
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            size="sm"
            showLabel={false}
          />
        </div>
      </motion.div>

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
            duration={timerDuration}
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