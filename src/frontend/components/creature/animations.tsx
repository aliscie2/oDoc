import React from 'react';
import { useSelector } from 'react-redux';

// Simplified Logo SVG Component
export const LogoSVG = ({ size = 120 }) => {
  const { isDarkMode } = useSelector((state: any) => state.uiState);
// const creamColor = isDarkMode ? '#F9F3E0' : '#E8D9B5'; // Darker cream when not in dark mode


  return (
    <svg width={size} height={size} viewBox="0 0 429 492" fill="none">
      <path d="M241.653 0C315.012 0 380.727 33.3416 425.004 85.9639C429.071 94.9083 429.498 103.745 426.827 111.375C424.204 118.87 418.192 124.905 411.082 129.455C403.976 134.003 395.819 137.039 388.992 138.556C387.734 138.835 386.071 138.681 384.053 138.119C382.043 137.559 379.727 136.607 377.186 135.342C374.525 134.017 371.632 132.354 368.601 130.454C337.385 94.4923 291.74 71.8135 240.89 71.8135C146.799 71.8136 70.5234 149.458 70.5234 245.236C70.5236 341.015 146.799 418.658 240.89 418.658C260.887 418.658 280.079 415.148 297.905 408.705C299.03 409.06 300.197 409.524 301.321 410.041C303.066 410.843 304.688 411.76 305.867 412.565C306.458 412.969 306.926 413.337 307.239 413.64C307.396 413.791 307.503 413.916 307.566 414.01C307.638 414.116 307.619 414.13 307.619 414.075C307.619 414.326 307.766 414.5 307.86 414.589C307.964 414.686 308.092 414.765 308.218 414.83C308.473 414.962 308.824 415.09 309.238 415.214C310.074 415.464 311.26 415.724 312.688 415.976C315.548 416.48 319.434 416.961 323.555 417.248C327.675 417.536 332.045 417.632 335.872 417.367C339.672 417.104 343.026 416.48 345.047 415.268C347.825 413.601 351.148 414.706 354.332 417.02C357.486 419.312 360.314 422.663 361.949 425.053L361.999 425.126L362.071 425.178C363.867 426.461 366.901 428.457 370.178 430.287C373.444 432.112 376.999 433.799 379.824 434.427C381.424 434.782 382.534 435.611 383.147 436.732C383.764 437.86 383.913 439.347 383.46 441.068C382.778 443.661 380.737 446.73 377.043 449.7C375.459 450.795 373.863 451.872 372.253 452.93C365.837 456.704 357.7 461.504 350.376 465.49C347.856 466.862 345.434 468.133 343.215 469.235C341.245 470.167 339.261 471.073 337.263 471.952C335.582 472.623 334.223 473.05 333.269 473.169C333.062 473.195 332.797 273.271 332.621 473.501C332.498 473.662 332.463 473.838 332.469 473.999C304.435 485.605 273.777 492 241.653 492C108.323 492 0.237305 381.862 0.237305 246C0.237305 110.138 108.323 0.000162517 241.653 0Z" 
            fill={'#F9F3E0'}
            
            style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.7))' }}

/>
    </svg>
  )
};

// Magnifier SVG Component
export const MagnifierSVG = ({ size = 80, position = { x: 0, y: 0 }, rotation = 0 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    style={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      transform: `rotate(${rotation}deg)`,
      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
      zIndex: 10
    }}
  >
    <defs>
      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8"/>
        <stop offset="50%" stopColor="#e3f2fd" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#90caf9" stopOpacity="0.4"/>
      </linearGradient>
      <radialGradient id="lensGradient" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
        <stop offset="70%" stopColor="#e3f2fd" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#1976d2" stopOpacity="0.1"/>
      </radialGradient>
    </defs>
    
    {/* Magnifier lens */}
    <circle cx="35" cy="35" r="25" 
      fill="url(#lensGradient)" 
      stroke="#1976d2" 
      strokeWidth="3"/>
    
    {/* Handle */}
    <line x1="55" y1="55" x2="80" y2="80" 
      stroke="#424242" 
      strokeWidth="6" 
      strokeLinecap="round"/>
    
    {/* Lens rim */}
    <circle cx="35" cy="35" r="25" 
      fill="none" 
      stroke="#1976d2" 
      strokeWidth="2"/>
    
    {/* Lens highlight */}
    <ellipse cx="28" cy="28" rx="8" ry="12" 
      fill="#ffffff" 
      opacity="0.7"/>
  </svg>
);

// Jellyfish SVG Component
export const JellyfishSVG = ({ 
  config, 
  scale, 
  eyePos, 
  blink, 
  phase, 
  getTentaclePath 
}) => {
  const tentacles = [
    "M72.2162 213.056C71.0175 213.087 62.69 215.701 59.2797 222.986C55.8702 230.27 58.4838 238.598 52.6776 245.944C46.8699 253.291 38.3875 249.912 38.3875 249.912C38.3875 249.912 32.3588 248.713 32.1459 240.478C31.9331 232.244 39.9553 223.485 39.9553 223.485C39.9553 223.485 49.489 209.706 44.3397 201.783",
    "M80.6827 219.037C80.6827 219.037 87.0725 223.684 87.0725 232.057C87.0725 240.431 87.3359 249.983 89.5672 251.987C91.7986 253.992 98.2363 262.039 106.791 254.518C115.346 246.998 104.865 235.356 104.865 235.356C104.865 235.356 102.041 229.913 102.041 225.695C102.041 221.476 104.865 216.146 104.865 216.146",
    "M119.504 209.577C119.504 209.577 131.351 213.529 132.912 219.038C134.472 224.545 141.957 234.524 141.957 234.524C141.957 234.524 151.304 242.616 157.856 236.907C164.409 231.198 162.982 228.308 162.982 228.308C162.982 228.308 163.664 221.051 154.474 216.145C145.283 211.24 143.62 202.624 143.62 202.624C143.62 202.624 141.909 190.458 141.888 190.529"
  ];

  const { isDarkMode } = useSelector((state: any) => state.uiState);
  const creamColor = isDarkMode ? '#F9F3E0' : '#E8D9B5'; // Darker cream when not in dark mode


  return (
    <svg 
      id="jellyfish"
      width={config.width} 
      height={config.width} 
      viewBox="0 0 209 259"
      style={{ 
        filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))',
        transform: `scale(${config.scale})` 
      }}
    >
      {/* Glow lines */}
      <g className="glow" opacity="0.6">
        <line stroke={creamColor} strokeWidth="8" x1="83.7" y1="37.4" x2="82.1" y2="0.85" />
        <line stroke={creamColor} strokeWidth="8" x1="136.7" y1="49.2" x2="159.4" y2="23.3" />
        <line stroke={creamColor} strokeWidth="8" x1="175.2" y1="95.7" x2="203.5" y2="84.8" />
      </g>
      
      {/* Eye parts */}
      <ellipse fill={creamColor}   cx="80.7" cy="138.4" rx="80.7" ry="80.7"
        style={{ transform: `scale(${scale})`, transition: 'transform 2s ease-in-out' }} />
      <ellipse fill="#ffffff" cx="78.6" cy="138" rx="64.6" ry="65"
        style={{ transform: `scale(${scale})`, transition: 'transform 2s ease-in-out' }} />
      <ellipse fill="#024B6D" cx={78.2 + eyePos.x} cy={138.2 + eyePos.y} 
        rx="43.2" ry={blink ? "3" : "43.2"}
        style={{ transition: 'all 0.3s ease', transform: `scale(${scale})` }} />
      <ellipse fill="#FFFFF3" cx={78.4 + eyePos.x * 0.7} cy={138.4 + eyePos.y * 0.7} 
        rx="10.4" ry={blink ? "2" : "10.4"}
        style={{ transition: 'all 0.3s ease', transform: `scale(${scale})` }} />
      
      {/* Tentacles */}
      {tentacles.map((path, i) => (
        <path key={i} d={getTentaclePath(path, i)} 
        fill={creamColor} 
        className="tentacle-jiggle"
          style={{
            transformOrigin: '80px 200px',
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}
    </svg>
  );
};

// Animation Styles Component
export const AnimationStyles = () => (
  <style jsx>{`
    .jellyfish-container { position: relative; display: inline-block; }
    .logo-wrapper { animation: logoFloat 4s ease-in-out infinite; }
    .anim-wobble { animation: wobble 2s ease-in-out infinite; }
    .anim-alert { animation: alert 4s ease-in-out infinite; }
    .anim-active { animation: active 1.8s ease-in-out infinite; }
    .anim-float { animation: float 6s ease-in-out infinite; }
    .anim-droop { animation: droop 4s ease-in-out infinite; }
    .anim-bounce { animation: bounce 1.5s ease-in-out infinite; }
    .anim-gentle { animation: gentle 3s ease-in-out infinite; }
    .anim-pulse { animation: pulse 2s ease-in-out infinite; }
    .glow { animation: glow 4s ease-in-out infinite; }
    .icon-overlay { animation: iconFloat 3s ease-in-out infinite; }
    .tentacle-jiggle { animation: tentacleJiggle 2s ease-in-out infinite; }
    
    @keyframes logoFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(1deg); }
    }
    @keyframes wobble {
      0%, 100% { transform: translateX(0px) rotateZ(0deg); }
      25% { transform: translateX(-3px) rotateZ(-1deg); }
      75% { transform: translateX(3px) rotateZ(1deg); }
    }
    @keyframes alert {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-5px) scale(1.02); }
    }
    @keyframes active {
      0%, 100% { transform: translateY(0px) rotateZ(0deg); }
      33% { transform: translateY(-8px) rotateZ(1deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes droop {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(8px) scale(0.98); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-15px) scale(1.1); }
    }
    @keyframes gentle {
      0%, 100% { transform: translateY(0px) rotateZ(0deg); }
      50% { transform: translateY(-5px) rotateZ(1deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.9; }
    }
    @keyframes iconFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    @keyframes tentacleJiggle {
      0%, 100% { transform: scaleX(1) scaleY(1); }
      25% { transform: scaleX(1.01) scaleY(0.99); }
      50% { transform: scaleX(0.99) scaleY(1.01); }
      75% { transform: scaleX(1.01) scaleY(0.99); }
    }
  `}</style>
);