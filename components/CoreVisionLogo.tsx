import React from 'react';
import Image from 'next/image';

interface CoreVisionLogoProps {
  className?: string;
  height?: number;
  width?: number;
}

export default function CoreVisionLogo({ 
  className = '', 
  height,
  width
}: CoreVisionLogoProps) {
  // If width specified, use it (minimum 124px)
  // If only height specified, calculate width from aspect ratio (approximately 2.5:1)
  // If neither specified, default to width 124px
  const logoWidth = width ? Math.max(width, 124) : (height ? Math.max(height * 2.5, 124) : 124);
  const logoHeight = height || logoWidth / 2.5; // Maintain aspect ratio

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/corevision-logo.png"
        alt="CoreVision"
        width={logoWidth}
        height={logoHeight}
        className="object-contain"
        priority
      />
    </div>
  );
}

