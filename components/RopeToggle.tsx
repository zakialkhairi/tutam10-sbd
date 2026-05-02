'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RopeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [hasToggled, setHasToggled] = useState(false);
  
  const dragY = useMotionValue(0);
  const springY = useSpring(dragY, { stiffness: 300, damping: 20 });
  
  // Exponential stretch effect for the rope
  const ropeStretch = useTransform(springY, [0, 150], [0, 100]);
  const iconRotate = useTransform(springY, [0, 150], [0, 360]);

  const threshold = 60;

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    if (info.offset.y > threshold) {
      setHasToggled(true);
      toggleTheme();
      setTimeout(() => setHasToggled(false), 600);
    }
    dragY.set(0);
  };

  return (
    <div className="fixed top-0 right-12 z-50 flex flex-col items-center pointer-events-none">
      {/* The Rope */}
      <motion.div 
        className="w-[2px] bg-foreground/40 origin-top"
        style={{ 
          height: 100,
          scaleY: useTransform(springY, (latest) => 1 + (Math.pow(latest, 1.2) / 500))
        }}
      />
      
      {/* The Knob */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 150 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ y: dragY }}
        className={cn(
          "w-12 h-12 rounded-full border-2 border-foreground bg-background flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto shadow-lg transition-colors duration-300",
          isDragging && "scale-110"
        )}
      >
        <motion.div
          animate={hasToggled ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {theme === 'dark' ? (
            <Moon className="w-6 h-6 text-foreground" fill="currentColor" />
          ) : (
            <Sun className="w-6 h-6 text-foreground" />
          )}
        </motion.div>
      </motion.div>
      
      {/* Hint Text */}
      <AnimatePresence>
        {isDragging && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 whitespace-nowrap"
          >
            Pull to toggle
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
