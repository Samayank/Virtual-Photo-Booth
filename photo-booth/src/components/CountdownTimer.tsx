import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface CountdownTimerProps {
  onComplete: () => void;
  onCancel: () => void;
  duration?: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  onComplete,
  onCancel,
  duration = 3
}) => {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="text-center">
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-bold text-white mb-4 animate-countdown-pulse"
        >
          {count || '📸'}
        </motion.div>
        
        <p className="text-white text-lg">Get ready!</p>
      </div>
    </motion.div>
  );
};