import React, { useEffect, useState } from 'react';

const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    // Create confetti particles
    const colors = [
      '#f44336', // red
      '#e91e63', // pink
      '#9c27b0', // purple
      '#673ab7', // deep purple
      '#3f51b5', // indigo
      '#2196f3', // blue
      '#03a9f4', // light blue
      '#00bcd4', // cyan
      '#009688', // teal
      '#4CAF50', // green
      '#8BC34A', // light green
      '#CDDC39', // lime
      '#FFEB3B', // yellow
      '#FFC107', // amber
      '#FF9800', // orange
      '#FF5722', // deep orange
    ];
    
    const newParticles: JSX.Element[] = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = Math.random() * 0.7 + 0.3; // Between 0.3rem and 1rem
      const color = colors[Math.floor(Math.random() * colors.length)];
      const animationDuration = Math.random() * 3 + 1; // Between 1s and 4s
      const animationDelay = Math.random() * 0.5; // Between 0s and 0.5s
      
      newParticles.push(
        <div
          key={i}
          style={{
            position: 'fixed',
            left: `${left}%`,
            top: `-5%`,
            width: `${size}rem`,
            height: `${size}rem`,
            backgroundColor: color,
            borderRadius: '50%',
            transform: 'rotate(0deg)',
            animation: `confetti-fall ${animationDuration}s ease-in ${animationDelay}s forwards, confetti-spin ${animationDuration * 0.5}s linear ${animationDelay}s infinite`
          }}
        />
      );
    }
    
    setParticles(newParticles);
    
    // Clean up
    return () => {
      setParticles([]);
    };
  }, []);
  
  return (
    <>
      <style>
        {`
          @keyframes confetti-fall {
            0% { top: -5%; }
            100% { top: 105%; }
          }
          
          @keyframes confetti-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      {particles}
    </>
  );
};

export default Confetti;