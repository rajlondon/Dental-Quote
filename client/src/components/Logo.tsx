import React from 'react';

const Logo = ({ className = '' }) => {
  return (
    <div className={className}>
      <span className="text-xl font-bold text-primary">MyDentalFly</span>
    </div>
  );
};

export default Logo;