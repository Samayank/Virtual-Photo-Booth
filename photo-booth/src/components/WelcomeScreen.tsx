import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Image, Download } from 'lucide-react';
import { Button } from './ui/button';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const features = [
    {
      icon: Camera,
      title: "Capture or Upload",
      description: "Take photos or choose from gallery"
    },
    {
      icon: Sparkles,
      title: "Arrange & Filter",
      description: "Reorder and apply effects"
    },
    {
      icon: Image,
      title: "Customize",
      description: "Design your photo strip"
    },
    {
      icon: Download,
      title: "Download",
      description: "Save & share instantly"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-primary opacity-10" />
      
      {/* Floating orbs for visual interest */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-accent rounded-full blur-xl opacity-20"
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-24 h-24 bg-primary rounded-full blur-xl opacity-30"
        animate={{ y: [20, -20, 20] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-sm mx-auto text-center">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center glow-primary">
            <Camera className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent"
        >
          Boothly
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg text-muted-foreground mb-12"
        >
          Create amazing photo strips with real-time filters and effects
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              className="glass-subtle rounded-xl p-4 text-center"
            >
              <feature.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="w-full btn-touch bg-gradient-primary hover:opacity-90 glow-primary text-white font-semibold"
          >
            <Camera className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </motion.div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-xs text-muted-foreground mt-6"
        >
          🔒 Your photos stay private - nothing is uploaded to any server
        </motion.p>
      </div>
    </div>
  );
};