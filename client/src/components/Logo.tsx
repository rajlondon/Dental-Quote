import React from 'react';

const Logo = ({ className = '', onClick = () => {} }) => {
  return (
    <div className={`${className} flex items-center cursor-pointer`} onClick={onClick}>
      <img 
        src="/logo.png" 
        alt="MyDentalFly Logo" 
        className="h-9 mr-2" 
      />
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">MyDentalFly</span>
    </div>
  );
};

export default Logo;