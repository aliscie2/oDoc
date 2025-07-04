import React from "react";
import { useSelector } from "react-redux";
const mainColor = "#FFEFCE";
const lightColor = "#fcfcfc";
const darkColor = "#e6dfca";
// const mainColor = "#40e0d0"
// const lightColor = "#49fceb"
// const darkColor = "#3dd4c5"
// Simplified Logo SVG Component
export const LogoSVG = ({ size = 120 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 348 398" fill="none">
      <path
        d="M195.965 0C255.309 0 308.468 26.9715 344.286 69.5399C347.576 76.7754 347.921 83.9238 345.76 90.096C343.639 96.1591 338.775 101.041 333.024 104.722C327.275 108.401 320.677 110.857 315.154 112.084C314.136 112.31 312.791 112.185 311.159 111.73C309.533 111.277 307.659 110.507 305.604 109.484C303.451 108.412 301.111 107.067 298.659 105.53C273.407 76.4389 236.483 58.093 195.348 58.093C119.234 58.0931 57.5311 120.903 57.5311 198.382C57.5313 275.862 119.234 338.671 195.348 338.671C211.524 338.671 227.05 335.831 241.47 330.619C242.38 330.906 243.324 331.282 244.233 331.7C245.645 332.349 246.957 333.09 247.911 333.742C248.389 334.068 248.767 334.366 249.021 334.611C249.148 334.733 249.234 334.835 249.285 334.911C249.343 334.996 249.328 335.008 249.328 334.963C249.328 335.166 249.447 335.307 249.523 335.379C249.607 335.457 249.711 335.521 249.813 335.574C250.019 335.681 250.303 335.784 250.638 335.884C251.314 336.087 252.273 336.297 253.429 336.501C255.742 336.909 258.886 337.298 262.219 337.53C265.552 337.763 269.087 337.841 272.183 337.626C275.257 337.413 277.97 336.909 279.605 335.928C281.852 334.58 284.54 335.474 287.116 337.345C289.668 339.2 291.955 341.91 293.278 343.844L293.318 343.903L293.377 343.945C294.829 344.983 297.284 346.597 299.935 348.078C302.577 349.554 305.452 350.919 307.738 351.427C309.032 351.714 309.93 352.384 310.426 353.291C310.925 354.204 311.045 355.407 310.679 356.799C310.127 358.897 308.476 361.379 305.488 363.782C304.207 364.668 302.916 365.539 301.613 366.395C296.423 369.448 289.841 373.33 283.916 376.555C281.877 377.665 279.918 378.693 278.123 379.584C276.53 380.338 274.925 381.071 273.308 381.782C272.003 382.303 269.43 383.438 269.43 383.438C246.752 392.827 221.952 398 195.965 398C88.1089 398 0.673668 308.905 0.673668 199C0.673668 89.0954 88.1089 0.000131467 195.965 0Z"
        fill={mainColor}
        style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.15))" }}
      />
    </svg>
  );
};

// Magnifier SVG Component
export const MagnifierSVG = ({
  size = 80,
  position = { x: 0, y: 0 },
  rotation = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      position: "absolute",
      left: position.x,
      top: position.y,
      transform: `rotate(${rotation}deg)`,
      filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.15))",
      zIndex: 10,
    }}
  >
    <defs>
      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#e3f2fd" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#90caf9" stopOpacity="0.4" />
      </linearGradient>
      <radialGradient id="lensGradient" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#e3f2fd" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#1976d2" stopOpacity="0.1" />
      </radialGradient>
    </defs>

    {/* Magnifier lens */}
    <circle
      cx="35"
      cy="35"
      r="25"
      fill="url(#lensGradient)"
      stroke="#1976d2"
      strokeWidth="3"
    />

    {/* Handle */}
    <line
      x1="55"
      y1="55"
      x2="80"
      y2="80"
      stroke="#424242"
      strokeWidth="6"
      strokeLinecap="round"
    />

    {/* Lens rim */}
    <circle
      cx="35"
      cy="35"
      r="25"
      fill="none"
      stroke="#1976d2"
      strokeWidth="2"
    />

    {/* Lens highlight */}
    <ellipse cx="28" cy="28" rx="8" ry="12" fill="#ffffff" opacity="0.7" />
  </svg>
);

// Jellyfish SVG Component
export const JellyfishSVG = ({
  config,
  scale,
  eyePos,
  blink,
  phase,
  getTentaclePath,
}) => {
  const tentacles = [
    "M72.2162 213.056C71.0175 213.087 62.69 215.701 59.2797 222.986C55.8702 230.27 58.4838 238.598 52.6776 245.944C46.8699 253.291 38.3875 249.912 38.3875 249.912C38.3875 249.912 32.3588 248.713 32.1459 240.478C31.9331 232.244 39.9553 223.485 39.9553 223.485C39.9553 223.485 49.489 209.706 44.3397 201.783",
    "M80.6827 219.037C80.6827 219.037 87.0725 223.684 87.0725 232.057C87.0725 240.431 87.3359 249.983 89.5672 251.987C91.7986 253.992 98.2363 262.039 106.791 254.518C115.346 246.998 104.865 235.356 104.865 235.356C104.865 235.356 102.041 229.913 102.041 225.695C102.041 221.476 104.865 216.146 104.865 216.146",
    "M119.504 209.577C119.504 209.577 131.351 213.529 132.912 219.038C134.472 224.545 141.957 234.524 141.957 234.524C141.957 234.524 151.304 242.616 157.856 236.907C164.409 231.198 162.982 228.308 162.982 228.308C162.982 228.308 163.664 221.051 154.474 216.145C145.283 211.24 143.62 202.624 143.62 202.624C143.62 202.624 141.909 190.458 141.888 190.529",
  ];

  const { isDarkMode } = useSelector((state: any) => state.uiState);

  return (
    <svg
      id="jellyfish"
      width={config.width}
      height={config.width}
      viewBox="0 0 209 259"
      style={{
        position: "absolute",
        filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.15))",
        transform: `scale(${config.scale})`,
      }}
    >
      {/* Glow lines */}
      <g className="glow" opacity="0.6">
        <line
          stroke={lightColor}
          strokeWidth="8"
          x1="83.7"
          y1="37.4"
          x2="82.1"
          y2="0.85"
        />
        <line
          stroke={lightColor}
          strokeWidth="8"
          x1="136.7"
          y1="49.2"
          x2="159.4"
          y2="23.3"
        />
        <line
          stroke={lightColor}
          strokeWidth="8"
          x1="175.2"
          y1="95.7"
          x2="203.5"
          y2="84.8"
        />
      </g>

      {/* Eye parts */}
      <ellipse
        fill={mainColor}
        cx="80.7"
        cy="138.4"
        rx="80.7"
        ry="80.7"
        style={{
          transform: `scale(${scale})`,
          transition: "transform 2s ease-in-out",
        }}
      />
      <ellipse
        fill="#ffffff"
        cx="78.6"
        cy="138"
        rx="64.6"
        ry="65"
        style={{
          transform: `scale(${scale})`,
          transition: "transform 2s ease-in-out",
        }}
      />
      <ellipse
        fill="#024B6D"
        cx={78.2 + eyePos.x}
        cy={138.2 + eyePos.y}
        rx="43.2"
        ry={blink ? "3" : "43.2"}
        style={{ transition: "all 0.3s ease", transform: `scale(${scale})` }}
      />
      <ellipse
        fill="#FFFFF3"
        cx={78.4 + eyePos.x * 0.7}
        cy={138.4 + eyePos.y * 0.7}
        rx="10.4"
        ry={blink ? "2" : "10.4"}
        style={{ transition: "all 0.3s ease", transform: `scale(${scale})` }}
      />

      {/* Tentacles */}
      {tentacles.map((path, i) => (
        <path
          key={i}
          d={getTentaclePath(path, i)}
          fill={mainColor}
          className="tentacle-jiggle"
          style={{
            transformOrigin: "80px 200px",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </svg>
  );
};

// Animation Styles Component
export const AnimationStyles = () => (
  <style jsx>{`
    .jellyfish-container {
      position: relative;
      display: inline-block;
    }
    .logo-wrapper {
      animation: logoFloat 4s ease-in-out infinite;
    }
    .anim-wobble {
      animation: wobble 2s ease-in-out infinite;
    }
    .anim-alert {
      animation: alert 4s ease-in-out infinite;
    }
    .anim-active {
      animation: active 1.8s ease-in-out infinite;
    }
    .anim-float {
      animation: float 6s ease-in-out infinite;
    }
    .anim-droop {
      animation: droop 4s ease-in-out infinite;
    }
    .anim-bounce {
      animation: bounce 1.5s ease-in-out infinite;
    }
    .anim-gentle {
      animation: gentle 3s ease-in-out infinite;
    }
    .anim-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
    .glow {
      animation: glow 4s ease-in-out infinite;
    }
    .icon-overlay {
      animation: iconFloat 3s ease-in-out infinite;
    }
    .tentacle-jiggle {
      animation: tentacleJiggle 2s ease-in-out infinite;
    }

    @keyframes logoFloat {
      0%,
      100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-10px) rotate(1deg);
      }
    }
    @keyframes wobble {
      0%,
      100% {
        transform: translateX(0px) rotateZ(0deg);
      }
      25% {
        transform: translateX(-3px) rotateZ(-1deg);
      }
      75% {
        transform: translateX(3px) rotateZ(1deg);
      }
    }
    @keyframes alert {
      0%,
      100% {
        transform: translateY(0px) scale(1);
      }
      50% {
        transform: translateY(-5px) scale(1.02);
      }
    }
    @keyframes active {
      0%,
      100% {
        transform: translateY(0px) rotateZ(0deg);
      }
      33% {
        transform: translateY(-8px) rotateZ(1deg);
      }
    }
    @keyframes float {
      0%,
      100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-12px);
      }
    }
    @keyframes droop {
      0%,
      100% {
        transform: translateY(0px) scale(1);
      }
      50% {
        transform: translateY(8px) scale(0.98);
      }
    }
    @keyframes bounce {
      0%,
      100% {
        transform: translateY(0px) scale(1);
      }
      50% {
        transform: translateY(-15px) scale(1.1);
      }
    }
    @keyframes gentle {
      0%,
      100% {
        transform: translateY(0px) rotateZ(0deg);
      }
      50% {
        transform: translateY(-5px) rotateZ(1deg);
      }
    }
    @keyframes pulse {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    @keyframes glow {
      0%,
      100% {
        opacity: 0.6;
      }
      50% {
        opacity: 0.9;
      }
    }
    @keyframes iconFloat {
      0%,
      100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-4px);
      }
    }
    @keyframes tentacleJiggle {
      0%,
      100% {
        transform: scaleX(1) scaleY(1);
      }
      25% {
        transform: scaleX(1.01) scaleY(0.99);
      }
      50% {
        transform: scaleX(0.99) scaleY(1.01);
      }
      75% {
        transform: scaleX(1.01) scaleY(0.99);
      }
    }
  `}</style>
);
