"use client";

import React from 'react';

export const Logo: React.FC<{ className?: string; alt?: string }> = ({ className = 'h-10 w-auto', alt = 'Purely Works Logo' }) => {
  return <img src="/assets/logo.png" className={className} alt={alt} />;
};
