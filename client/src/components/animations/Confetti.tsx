import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 5000 }) => {
  const [particles, setParticles] = useState<JSX.Element[]>([]);
  const [isActive, setIsActive] = useState(active);

  // Generate confetti particles
  useEffect(() => {
    if (!active) {
      setIsActive(false);
      return;
    }

    setIsActive(true);
    
    // Create confetti particles
    const colors = ['#FFC700', '#FF0066', '#2EC4B6', '#011627', '#FDFFFC', '#5BC0EB', '#9BC53D'];
    const shapes = ['circle', 'square', 'triangle'];
    
    const newParticles: JSX.Element[] = [];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      const size = `${Math.random() * 1 + 0.5}rem`;
      const animationDuration = `${Math.random() * 3 + 2}s`;
      const animationDelay = `${Math.random() * 0.5}s`;
      const rotation = `${Math.random() * 360}deg`;
      
      let shapeElement;
      if (shape === 'circle') {
        shapeElement = (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: '50%',
              transform: `rotate(${rotation})`,
              animation: `fall ${animationDuration} ease-in forwards`,
              animationDelay,
              opacity: 0,
            }}
          />
        );
      } else if (shape === 'square') {
        shapeElement = (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: size,
              height: size,
              backgroundColor: color,
              transform: `rotate(${rotation})`,
              animation: `fall ${animationDuration} ease-in forwards`,
              animationDelay,
              opacity: 0,
            }}
          />
        );
      } else {
        shapeElement = (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: 0,
              height: 0,
              borderLeft: size,
              borderRight: size,
              borderBottom: size,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: color,
              transform: `rotate(${rotation})`,
              animation: `fall ${animationDuration} ease-in forwards`,
              animationDelay,
              opacity: 0,
            }}
          />
        );
      }
      
      newParticles.push(shapeElement);
    }
    
    setParticles(newParticles);
    
    // Auto-cleanup after duration
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [active, duration]);
  
  if (!isActive) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-10vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
      {particles}
    </div>
  );
};

export default Confetti;