import React, { useCallback, useEffect, useRef } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

interface ConfettiProps {
  run: boolean;
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

const Confetti: React.FC<ConfettiProps> = ({ 
  run, 
  onComplete, 
  duration = 3000, 
  className = '' 
}) => {
  const refAnimationInstance = useRef<CreateTypes | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const getInstance = useCallback((instance: CreateTypes | null) => {
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
    refAnimationInstance.current.reset();
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
      refConfetti={getInstance}
      style={canvasStyles}
      className={className}
    />
  );
};

export default Confetti;