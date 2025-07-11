import React from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Share, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface DownloadScreenProps {
  stripDataUrl: string;
  onRestart: () => void;
}

export const DownloadScreen: React.FC<DownloadScreenProps> = ({
  stripDataUrl,
  onRestart
}) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `photo-strip-${Date.now()}.jpg`;
    link.href = stripDataUrl;
    link.click();
  };

  const shareImage = async () => {
    console.log('Share button clicked');
    try {
      // Convert data URL to blob
      const response = await fetch(stripDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'photo-strip.jpg', { type: 'image/jpeg' });

      console.log('Navigator share available:', !!navigator.share);
      console.log('Can share files:', navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));

      // Try native share first (but only if it can handle files)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        console.log('Using native share');
        await navigator.share({
          title: 'My Photo Strip',
          text: `Check out my awesome photo strip! Create your own at ${window.location.origin}`,
          files: [file]
        });
      } else {
        console.log('Using WhatsApp fallback');
        // Fallback to WhatsApp with link only (since we can't share images directly)
        const whatsappText = encodeURIComponent(`Check out my awesome photo strip! 🎉 Create your own at ${window.location.origin}`);
        
        // Open WhatsApp with the message
        const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
        window.open(whatsappUrl, '_blank');
        
        // Also download the image so user can manually share it
        downloadImage();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to WhatsApp with just text and download
      const whatsappText = encodeURIComponent(`Check out my awesome photo strip! 🎉 Create your own at ${window.location.origin}`);
      const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
      window.open(whatsappUrl, '_blank');
      downloadImage();
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm mx-auto text-center"
      >
        {/* Success celebration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center glow-primary">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold mb-2"
        >
          Your Photo Strip is Ready!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          Download or share your amazing creation
        </motion.p>

        {/* Photo strip preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="glass rounded-xl p-4 photo-strip">
            <img
              src={stripDataUrl}
              alt="Your photo strip"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3 mb-8"
        >
          <Button
            onClick={downloadImage}
            className="w-full btn-touch bg-gradient-primary hover:opacity-90 text-white"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Photo Strip
          </Button>

          <Button
            onClick={shareImage}
            variant="outline"
            className="w-full btn-touch"
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>

          <Button
            onClick={onRestart}
            variant="ghost"
            className="w-full btn-touch"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Create Another Strip
          </Button>
        </motion.div>

        {/* Progress indicator - completed */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>

        {/* Fun message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-xs text-muted-foreground mt-6"
        >
          🎉 Thanks for using Boothly! Share with friends!
        </motion.p>
      </motion.div>
    </div>
  );
};