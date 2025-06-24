import React from 'react';
import { useSelector } from 'react-redux';
import gif from '@/public/creature.gif'
import loading from '@/public/loading.gif'
import greetings from '@/public/greetings.gif'
import watching from '@/public/watching.gif'
import sad from '@/public/sad.gif'

export default function LoaderComponent({size = 12, type = 'loading'}) {
  const { isDarkMode } = useSelector((state: any) => state.uiState);
  
  let src = "";
  switch (type) {
    case 'loading':
      src = loading;
      break;
    case 'greetings':
      src = greetings;
      break;
    case 'watching':
      src = watching;
      break;
    case 'sad':
      src = sad;
      break;
  }
  
  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .invert-colors {
          filter: invert(0.2) hue-rotate(180deg);
        }
      `}</style>
      
      <div className="top-4 right-4 z-50 pointer-events-none">
        <img
          src={src}
          alt="Loading"
          className={`object-contain animate-float ${!isDarkMode ? 'invert-colors' : ''}`}
          style={{
            width: `${size * 8}px`,
            height: `${size * 8}px`,
          }}
          onError={(e) => {
            console.error('GIF error:', e);
          }}
        />
      </div>
    </>
  );
}