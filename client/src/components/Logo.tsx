import React from 'react';
import { Link } from 'wouter';

const Logo = ({ className = '' }) => {
  return (
    <Link href="/">
      <div className={`${className} flex items-center cursor-pointer`}>
        <img 
          src="/logo.png" 
          alt="MyDentalFly Logo" 
          className="h-9 mr-2" 
        />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">MyDentalFly</span>
      </div>
    </Link>
  );
};

export default Logo;