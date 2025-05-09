import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

interface ConfettiProps {
  run: boolean;
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

type CreateConfetti = (options: {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: {
    x?: number;
    y?: number;
  };
  colors?: string[];
  shapes?: string[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
  [key: string]: any;
}) => void;

const Confetti: React.FC<ConfettiProps> = ({ 
  run, 
  onComplete, 
  duration = 3000, 
  className = '' 
}) => {
  const refAnimationInstance = useRef<CreateConfetti | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const getInstance = useCallback((instance: CreateConfetti | null) => {
    refAnimationInstance.current = instance;
  }, []);

  // Start animation when run prop changes to true
  useEffect(() => {
    if (!run || isAnimating) return;
    
    if (refAnimationInstance.current) {
      setIsAnimating(true);
      fire();
      
      // Set a timeout to stop the animation
      const timer = setTimeout(() => {
        stop();
        setIsAnimating(false);
        if (onComplete) onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [run, duration, onComplete, isAnimating]);

  const fire = useCallback(() => {
    if (!refAnimationInstance.current) return;
    
    refAnimationInstance.current({
      spread: 70,
      startVelocity: 30,
      particleCount: 150,
      origin: { y: 0.6 }
    });

    // Add continuous animation
    const interval = setInterval(() => {
      if (!refAnimationInstance.current) {
        clearInterval(interval);
        return;
      }
      
      refAnimationInstance.current({
        spread: 70,
        startVelocity: 30,
        particleCount: 50,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }, 400);

    // Clear interval after duration
    setTimeout(() => clearInterval(interval), duration - 500);
  }, [duration]);

  const stop = useCallback(() => {
    if (!refAnimationInstance.current) return;
    // Using any here because reset is not properly typed but exists in the library
    (refAnimationInstance.current as any).reset();
  }, []);

  // Custom canvas styles
  const canvasStyles: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 999
  };

  return (
    <ReactCanvasConfetti
      // @ts-ignore - refConfetti exists in the library but has type issues
      refConfetti={getInstance}
      style={canvasStyles}
      className={className}
    />
  );
};

export default Confetti;