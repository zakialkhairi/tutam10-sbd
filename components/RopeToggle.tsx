'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const DRAG_THRESHOLD = 40; // px user must drag down to trigger toggle
const ROPE_REST_HEIGHT = 38;
const MAX_STRETCH = 60; // max additional stretch in px

export const RopeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const ropeControls = useAnimation();
  const knobControls = useAnimation();

  const isDark = theme === 'dark';

  // Calculate elastic stretch (diminishing returns as you pull further)
  const getElasticY = (rawY: number) => {
    const clamped = Math.max(0, rawY);
    return MAX_STRETCH * (1 - Math.exp(-clamped / 80));
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    startYRef.current = e.clientY;
    setDragY(0);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const rawDelta = e.clientY - startYRef.current;
    const elasticDelta = getElasticY(rawDelta);
    setDragY(elasticDelta);
  }, [isDragging]);

  const handlePointerUp = useCallback(async (e: React.PointerEvent) => {
    if (!isDragging) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);

    const rawDelta = e.clientY - startYRef.current;
    const didPassThreshold = rawDelta >= DRAG_THRESHOLD;

    // Snap rope back
    setDragY(0);

    if (didPassThreshold) {
      // Toggle theme
      toggleTheme();

      // Knob spin animation
      knobControls.start({
        rotate: [0, 360],
        transition: { duration: 0.5, ease: 'easeInOut' },
      });

      // Post-release swing
      try {
        await ropeControls.start({
          rotateZ: [0, 4, -3, 2, -1, 0],
          transition: { duration: 1, ease: 'easeOut' },
        });
      } catch {
        // interrupted
      }
    } else {
      // Snap back bounce (didn't reach threshold)
      try {
        await ropeControls.start({
          rotateZ: [0, 1.5, -1, 0.5, 0],
          transition: { duration: 0.6, ease: 'easeOut' },
        });
      } catch {
        // interrupted
      }
    }
  }, [isDragging, toggleTheme, knobControls, ropeControls]);

  // Cancel drag on pointer leave window
  useEffect(() => {
    const handleCancel = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragY(0);
      }
    };
    window.addEventListener('pointercancel', handleCancel);
    return () => window.removeEventListener('pointercancel', handleCancel);
  }, [isDragging]);

  const currentRopeHeight = ROPE_REST_HEIGHT + dragY;
  const stretchRatio = currentRopeHeight / ROPE_REST_HEIGHT;
  const thresholdReached = dragY >= getElasticY(DRAG_THRESHOLD) * 0.9;

  return (
    <div
      ref={containerRef}
      className="fixed top-0 right-12 z-50 flex flex-col items-center touch-none"
      style={{
        height: `${ROPE_REST_HEIGHT + 34 + dragY}px`,
        width: '36px',
        transition: isDragging ? 'none' : 'height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <motion.div
        animate={ropeControls}
        initial={{ rotateZ: 0 }}
        style={{ originY: 0, originX: '50%' }}
        className="flex flex-col items-center select-none"
      >
        {/* Rope line */}
        <div className="relative">
          <div
            className="w-[3px] rounded-full"
            style={{
              height: `${currentRopeHeight}px`,
              background: isDark
                ? `linear-gradient(180deg, rgba(255,252,204,${0.3 + stretchRatio * 0.1}) 0%, rgba(255,252,204,${0.6 + stretchRatio * 0.2}) 100%)`
                : `linear-gradient(180deg, rgba(0,0,0,${0.2 + stretchRatio * 0.1}) 0%, rgba(0,0,0,${0.5 + stretchRatio * 0.2}) 100%)`,
              transition: isDragging ? 'none' : 'height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.4s ease',
            }}
          />
          {/* Rope texture */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] rounded-full opacity-40"
            style={{
              height: `${currentRopeHeight}px`,
              background: isDark
                ? 'repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 5px)'
                : 'repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 5px)',
              transition: isDragging ? 'none' : 'height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </div>

        {/* Knob (drag handle) */}
        <motion.div
          animate={knobControls}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: '28px',
            height: '28px',
            cursor: isDragging ? 'grabbing' : 'grab',
            background: isDark ? '#FFFCCC' : '#000000',
            boxShadow: thresholdReached
              ? `0 0 24px rgba(255,252,204, 0.6), 0 4px 16px rgba(0,0,0,${isDark ? 0.4 : 0.15})`
              : `0 0 12px rgba(0,0,0, 0.3), 0 4px 12px rgba(0,0,0,${isDark ? 0.3 : 0.1})`,
            transition: isDragging ? 'box-shadow 0.2s ease' : 'background 0.4s ease, box-shadow 0.4s ease',
            transform: isDragging ? `scale(${1 + dragY * 0.003})` : 'scale(1)',
          }}
          role="button"
          aria-label={`Drag down to switch to ${isDark ? 'light' : 'dark'} mode`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTheme();
            }
          }}
        >
          {/* Sun icon */}
          <svg
            className="absolute"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDark ? '#000000' : '#ffffff'}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: isDark ? 0 : 1,
              transform: isDark ? 'scale(0.5)' : 'scale(1)',
              transition: 'opacity 0.3s, transform 0.3s',
            }}
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>

          {/* Moon icon */}
          <svg
            className="absolute"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDark ? '#000000' : '#ffffff'}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: isDark ? 1 : 0,
              transform: isDark ? 'scale(1)' : 'scale(0.5)',
              transition: 'opacity 0.3s, transform 0.3s',
            }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};
