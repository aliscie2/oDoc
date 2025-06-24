import React from 'react';
import { useSelector } from 'react-redux';
import gif from '@/public/creature.gif'

export default function LoaderComponent({size=12}) {
  const { isDarkMode } = useSelector((state: any) => state.uiState);

  return (
    <div className="top-4 right-4 z-50 pointer-events-none">
      <img
        src={gif}
        alt="Loading"
        className="object-contain"
        style={{
          width: `${size * 8}px`,
          height: `${size * 8}px`,
          // Use screen blend mode - most efficient for removing black
          mixBlendMode: 'screen',
          // Aggressive filtering to remove black/dark shades
          filter: `
            contrast(1.5) 
            brightness(1.3) 
            saturate(1.2)
            ${!isDarkMode ? 'invert(1)' : ''}
          `.replace(/\s+/g, ' ').trim(),
          background: 'transparent',
          opacity: 0.95,
        }}
        onError={(e) => {
          console.error('GIF error:', e);
        }}
      />
      
      {/* CSS-only black removal overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          width: `${size * 8}px`,
          height: `${size * 8}px`,
          background: `
            radial-gradient(circle, transparent 0%, transparent 100%),
            linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 100%)
          `,
          mixBlendMode: 'lighten',
          opacity: 0.8,
        }}
      />
    </div>
  );
}