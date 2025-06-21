import React, { useState, useEffect } from "react";

import odocIcon from "@/assets/infograph/odocIcon.png";
import { odocStrecutre } from "./landingPageData";

interface Element {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  angle: number;
  color: string;
  glowColor: string;
}

const ODOCInfographic: React.FC = () => {
  const [hoveredElement, setHoveredElement] = useState<number | null>(null);
  const [coreActive, setCoreActive] = useState(false);

  const getElementPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  const getAdjustedCardPosition = (angle: number, radius: number) => {
    const basePosition = getElementPosition(angle, radius);
    const cardWidth = 280;
    const cardHeight = 200;
    const padding = 20;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    let actualX = centerX + basePosition.x;
    let actualY = centerY + basePosition.y;

    if (actualX + cardWidth / 2 + padding > viewportWidth) {
      actualX = viewportWidth - cardWidth / 2 - padding;
    } else if (actualX - cardWidth / 2 - padding < 0) {
      actualX = cardWidth / 2 + padding;
    }

    if (actualY + cardHeight / 2 + padding > viewportHeight) {
      actualY = viewportHeight - cardHeight / 2 - padding;
    } else if (actualY - cardHeight / 2 - padding < 0) {
      actualY = cardHeight / 2 + padding;
    }

    return {
      x: actualX - centerX,
      y: actualY - centerY,
    };
  };

  // Desktop layout
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflow: "hidden",

        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.3,
          background:
            "radial-gradient(circle at 30% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1200px",
          height: "100%",
          maxHeight: "1200px",
        }}
      >
        {/* Central Core */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <img
            src={odocIcon}
            alt="ODOC Logo"
            style={{
              width: window.innerWidth < 1024 ? "150px" : "200px",
              filter: `drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) brightness(${coreActive ? "1.2" : "1"})`,
              transition: "all 0.3s ease",
              animation: "shineGlow 2s ease-in-out infinite",
            }}
          />
        </div>

        {odocStrecutre.map((element) => {
          const radius = window.innerWidth < 1024 ? 250 : 300;
          const position = getElementPosition(element.angle, radius);
          const adjustedPosition = getAdjustedCardPosition(
            element.angle,
            radius,
          );
          const isHovered = hoveredElement === element.id;
          const hasEnergyPipe = element.id !== 5 && element.id !== 6;

          return (
            <React.Fragment key={element.id}>
              {hasEnergyPipe ? (
                // Energy Pipes for elements 1-4
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transformOrigin: "left center",
                    height: "12px",
                    width: `${radius}px`,
                    transform: `rotate(${element.angle}deg)`,
                    overflow: "hidden",
                    borderRadius: "6px",
                    background:
                      "linear-gradient(90deg, #1a1a1a, #2a2a2a, #1a1a1a)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: isHovered
                      ? `0 0 20px ${element.glowColor}`
                      : "none",
                    zIndex: 5,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={() => setHoveredElement(element.id)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "1px",
                      left: 0,
                      right: 0,
                      bottom: "1px",
                      background: `linear-gradient(90deg, transparent, ${element.glowColor}, ${element.glowColor}, transparent)`,
                      borderRadius: "4px",
                      animation: "energyFlow 2.5s ease-in-out infinite",
                      opacity: isHovered ? 1 : 0.6,
                    }}
                  />
                </div>
              ) : (
                // Wifi radiation for elements 5 & 6 - connected to center
                <>
                  {/* Connection line to center */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transformOrigin: "left center",
                      height: "2px",
                      width: `${radius}px`,
                      transform: `rotate(${element.angle}deg)`,
                      background: `linear-gradient(90deg, ${element.glowColor}40, ${element.glowColor}80, ${element.glowColor}40)`,
                      opacity: isHovered ? 0.8 : 0.4,
                      zIndex: 5,
                      transition: "opacity 0.3s ease",
                    }}
                  />

                  {/* Wifi radiation rings */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
                      zIndex: 5,
                    }}
                  >
                    {[1, 2, 3].map((ring) => (
                      <div
                        key={ring}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: `${40 + ring * 30}px`,
                          height: `${40 + ring * 30}px`,
                          border: `2px solid ${element.glowColor}`,
                          borderRadius: "50%",
                          opacity: isHovered ? 0.8 : 0.3,
                          animation: `wifiPulse${ring} ${2 + ring * 0.5}s ease-in-out infinite`,
                          transition: "opacity 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Orbital Elements */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translate(${isHovered ? adjustedPosition.x : position.x}px, ${isHovered ? adjustedPosition.y : position.y}px)`,
                  transition: "transform 0.4s ease",
                  zIndex: isHovered ? 200 : 20,
                }}
              >
                <div
                  onMouseEnter={() => setHoveredElement(element.id)}
                  onMouseLeave={() => setHoveredElement(null)}
                  style={{
                    transition: "all 0.4s ease",
                    cursor: "pointer",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "-20px",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${element.glowColor} 0%, transparent 70%)`,
                      opacity: isHovered ? 0.8 : 0.3,
                      filter: "blur(15px)",
                      transition: "all 0.4s ease",
                      transform: isHovered ? "scale(1.5)" : "scale(1)",
                    }}
                  />

                  {!isHovered ? (
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.9) 100%)",
                        border: `2px solid ${element.glowColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(10px)",
                        boxShadow: `0 0 20px ${element.glowColor}`,
                        transition: "all 0.3s ease",
                        transform: isHovered ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {element.icon}
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "280px",
                        height: "200px",
                        background:
                          "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(45, 45, 45, 0.9))",
                        borderRadius: "100px",
                        border: `2px solid ${element.glowColor}`,
                        boxShadow: `0 0 40px ${element.glowColor}`,
                        backdropFilter: "blur(20px)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        position: "relative",
                        transition: "all 0.3s ease",
                        animation: isHovered
                          ? "expandCard 0.4s ease-out"
                          : "none",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "2px",
                          background: `linear-gradient(90deg, transparent, ${element.glowColor}, transparent)`,
                          animation: "shimmer 2s ease-in-out infinite",
                        }}
                      />

                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          marginBottom: "12px",
                          borderRadius: "50%",
                          background: `radial-gradient(circle, ${element.glowColor}20, transparent)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1px solid ${element.glowColor}`,
                        }}
                      >
                        {element.icon}
                      </div>
                      <h3
                        style={{
                          color: element.glowColor,
                          fontWeight: "bold",
                          margin: "0 0 8px 0",
                          fontSize: "1.1rem",
                          textShadow: `0 0 10px ${element.glowColor}`,
                        }}
                      >
                        {element.title}
                      </h3>
                      <p
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontSize: "0.85rem",
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {element.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <style>{`
        @keyframes shineGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) brightness(1); }
          50% { filter: drop-shadow(0 0 20px rgba(0, 255, 255, 1)) brightness(1.3); }
        }
        
        @keyframes energyFlow {
          0% { transform: translateX(-100%) scaleX(0); opacity: 0; }
          50% { transform: translateX(0%) scaleX(1); opacity: 1; }
          100% { transform: translateX(100%) scaleX(0); opacity: 0; }
        }
        
        @keyframes wifiPulse1 {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes wifiPulse2 {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
        }
        
        @keyframes wifiPulse3 {
          0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.02); }
        }
        
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ODOCInfographic;
