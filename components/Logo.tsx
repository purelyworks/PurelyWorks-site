
import React from 'react';
import logo from '../assets/logo.svg';

export const Logo: React.FC<{ className?: string; alt?: string }> = ({ className = 'h-10 w-auto', alt = 'Purely Works Logo' }) => {
  return <img src={logo} className={className} alt={alt} />;
};
