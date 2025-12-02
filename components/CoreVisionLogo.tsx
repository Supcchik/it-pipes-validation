import React from 'react';
import Image from 'next/image';

interface CoreVisionLogoProps {
  className?: string;
  height?: number;
  width?: number;
}

export default function CoreVisionLogo({ 
  className = '', 
  height = 32,
  width
}: CoreVisionLogoProps) {
  // If width not specified, use height to maintain aspect ratio
  const logoWidth = width || height * 2.5; // Approximate aspect ratio

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/corevision-logo.png"
        alt="CoreVision"
        width={logoWidth}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}

