import React, { useState, useEffect } from 'react';
import snsimage from '@/assets/infograph/SNS.png';
import analyticsImage from '@/assets/infograph/analytics.png';
import autoReleaseImage from '@/assets/infograph/autoRlease.png';
import jobMatcherImage from '@/assets/infograph/jobMatcher.png';
import karmaImage from '@/assets/infograph/karma.png';
import identityImage from '@/assets/infograph/identityVerfication.png';
import odocIcon from '@/assets/infograph/odocIcon.png';

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
  const [pulseActive, setPulseActive] = useState(false);
  const [coreActive, setCoreActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const elements: Element[] = [
    {
      id: 1,
      title: "AI Job Matcher",
      description: "Match-based system finds opportunities instantly, or get alerted later.",
      icon: <img src={jobMatcherImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.8))' }} />,
      angle: 228,
      color: "from-blue-500 to-cyan-400",
      glowColor: "rgba(0, 212, 255, 0.8)"
    },
    {
      id: 2,
      title: "AI Auto-Release",
      description: "Conditions met? Payment flows automatically",
      icon: <img src={autoReleaseImage} width="60px" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 149, 0, 0.8))' }} />,
      angle: 40.5,
      color: "from-yellow-500 to-orange-400",
      glowColor: "rgba(255, 149, 0, 0.8)"
    },
    {
      id: 3,
      title: "AI Analytics",
      description: "Data-driven suggestions for team and tasks",
      icon: <img src={analyticsImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.8))' }} />,
      angle: 143,
      color: "from-green-500 to-emerald-400",
      glowColor: "rgba(0, 255, 136, 0.8)"
    },
    {
      id: 4,
      title: "Trust/Karma Score",
      description: "Transparent behavior builds or breaks your score",
      icon: <img src={karmaImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(184, 76, 255, 0.8))' }} />,
      angle: 312,
      color: "from-purple-500 to-violet-400",
      glowColor: "rgba(184, 76, 255, 0.8)"
    },
    {
      id: 5,
      title: "SNS DAO",
      description: "Decentralized governance layer for collaboration",
      icon: <img src={snsimage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 76, 139, 0.8))' }} />,
      angle: 0,
      color: "from-pink-500 to-rose-400",
      glowColor: "rgba(255, 76, 139, 0.8)"
    },
    {
      id: 6,
      title: "Origyn Identity Verification",
      description: "Authenticate users using on-chain identity tech",
      icon: <img src={identityImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(76, 154, 255, 0.8))' }} />,
      angle: 180,
      color: "from-indigo-500 to-blue-400",
      glowColor: "rgba(76, 154, 255, 0.8)"
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const coreInterval = setInterval(() => {
      setCoreActive(prev => !prev);
    }, 2000);

    const pulseInterval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 1500);

    return () => {
      clearInterval(coreInterval);
      clearInterval(pulseInterval);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const getElementPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const getAdjustedCardPosition = (angle: number, radius: number) => {
    const basePosition = getElementPosition(angle, radius);
    const cardWidth = isMobile ? 260 : 280;
    const cardHeight = isMobile ? 180 : 200;
    const padding = 20;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    let actualX = centerX + basePosition.x;
    let actualY = centerY + basePosition.y;
    
    if (actualX + cardWidth/2 + padding > viewportWidth) {
      actualX = viewportWidth - cardWidth/2 - padding;
    } else if (actualX - cardWidth/2 - padding < 0) {
      actualX = cardWidth/2 + padding;
    }
    
    if (actualY + cardHeight/2 + padding > viewportHeight) {
      actualY = viewportHeight - cardHeight/2 - padding;
    } else if (actualY - cardHeight/2 - padding < 0) {
      actualY = cardHeight/2 + padding;
    }
    
    return {
      x: actualX - centerX,
      y: actualY - centerY
    };
  };

  // Mobile layout: vertical stack
  if (isMobile) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 50%, #0a0a23 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Effects */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          background: 'radial-gradient(circle at 30% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)',
        }} />
        
        {/* Floating Particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00',
            borderRadius: '50%',
            left: `${10 + (i * 80) % 90}%`,
            top: `${5 + (i * 60) % 90}%`,
            opacity: 0.6,
            animation: `float ${2 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`
          }} />
        ))}

        {/* Mobile Layout */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          paddingTop: '40px',
          paddingBottom: '40px'
        }}>
          {/* Central Core */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.9) 100%)',
            border: '2px solid rgba(0, 255, 255, 0.8)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.8)',
            marginBottom: '20px',
            animation: coreActive ? 'corePulse 2s ease-in-out infinite' : 'none'
          }}>
            <img 
              src={odocIcon} 
              alt="ODOC Logo" 
              style={{ 
                width: '120px',
                filter: `drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) ${coreActive ? 'brightness(1.2)' : 'brightness(1)'}`,
                transition: 'all 0.3s ease'
              }} 
            />
          </div>

          {/* Mobile Cards */}
          {elements.map((element, index) => (
            <div key={element.id} style={{
              width: '100%',
              maxWidth: '340px',
              marginBottom: '16px',
              animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(45, 45, 45, 0.9))',
                borderRadius: '16px',
                border: `2px solid ${element.glowColor}`,
                boxShadow: `0 0 20px ${element.glowColor}`,
                backdropFilter: 'blur(20px)',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => setHoveredElement(element.id)}
              onMouseLeave={() => setHoveredElement(null)}
              onClick={() => setHoveredElement(hoveredElement === element.id ? null : element.id)}
              >
                {/* Card Glow Effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${element.glowColor}, transparent)`,
                  animation: 'shimmer 2s ease-in-out infinite'
                }} />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${element.glowColor}20, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${element.glowColor}`,
                    flexShrink: 0
                  }}>
                    {element.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: element.glowColor,
                      fontWeight: 'bold',
                      margin: '0 0 8px 0',
                      fontSize: '1.1rem',
                      textShadow: `0 0 10px ${element.glowColor}`
                    }}>
                      {element.title}
                    </h3>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                      margin: 0
                    }}>
                      {element.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes slideInUp {
            from { 
              opacity: 0; 
              transform: translateY(30px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(180deg); }
          }
          
          @keyframes corePulse {
            0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.8); }
            50% { box-shadow: 0 0 50px rgba(0, 255, 255, 1); }
          }
          
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Desktop layout: original orbital design
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 50%, #0a0a23 100%)',
      position: 'relative'
    }}>
      {/* Sci-Fi Background Effects */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.3,
        background: 'radial-gradient(circle at 30% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)',
      }} />
      
      {/* Animated Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.15,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'gridPulse 4s ease-in-out infinite'
      }} />

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: '2px',
          height: '2px',
          background: i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00',
          borderRadius: '50%',
          left: `${10 + (i * 80) % 90}%`,
          top: `${5 + (i * 60) % 90}%`,
          opacity: 0.6,
          animation: `float ${2 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`
        }} />
      ))}

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        height: '100%',
        maxHeight: '1200px'
      }}>
        {/* Central Core */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          cursor: 'pointer'
        }}
        onMouseEnter={() => setCoreActive(true)}
        onMouseLeave={() => setCoreActive(false)}>
          <img 
              src={odocIcon} 
              alt="ODOC Logo" 
              style={{ 
                width: window.innerWidth < 1024 ? '150px' : '200px',
                filter: `drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) ${coreActive ? 'brightness(1.2)' : 'brightness(1)'}`,
                transition: 'all 0.3s ease'
              }} 
            />
        </div>

        {/* Connection Lines and Orbital Elements */}
        {elements.map((element) => {
          const radius = window.innerWidth < 1024 ? 250 : 300;
          const position = getElementPosition(element.angle, radius);
          const adjustedPosition = getAdjustedCardPosition(element.angle, radius);
          const isHovered = hoveredElement === element.id;
          
          return (
            <React.Fragment key={element.id}>
              {/* Energy Pipes */}
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'left center',
                  height: '12px',
                  width: `${radius}px`,
                  transform: `rotate(${element.angle}deg)`,
                  overflow: 'hidden',
                  borderRadius: '6px',
                  background: 'linear-gradient(90deg, #1a1a1a, #2a2a2a, #1a1a1a)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isHovered ? `0 0 20px ${element.glowColor}` : 'none',
                  cursor: 'pointer',
                  zIndex: 5,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => setHoveredElement(element.id)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div style={{
                  position: 'absolute',
                  top: '1px',
                  left: 0,
                  right: 0,
                  bottom: '1px',
                  background: `linear-gradient(90deg, transparent, ${element.glowColor}, ${element.glowColor}, transparent)`,
                  borderRadius: '4px',
                  animation: 'energyFlow 2.5s ease-in-out infinite',
                  animationDelay: `${element.id * 0.4}s`,
                  opacity: isHovered ? 1 : 0.6,
                  filter: 'blur(1px)'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: 0,
                  right: 0,
                  bottom: '4px',
                  background: `linear-gradient(90deg, transparent, white, transparent)`,
                  borderRadius: '1px',
                  animation: 'coreFlow 1.8s linear infinite',
                  animationDelay: `${element.id * 0.3}s`,
                  opacity: isHovered ? 0.8 : 0.4
                }} />
              </div>
              
              {/* Orbital Elements */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${isHovered ? adjustedPosition.x : position.x}px, ${isHovered ? adjustedPosition.y : position.y}px)`,
                transition: 'transform 0.4s ease',
                zIndex: isHovered ? 200 : 20
              }}>
                <div 
                  onMouseEnter={() => setHoveredElement(element.id)}
                  onMouseLeave={() => setHoveredElement(null)}
                  style={{
                    transition: 'all 0.4s ease',
                    cursor: 'pointer'
                  }}
                >
                  {/* Element Glow */}
                  <div style={{
                    position: 'absolute',
                    inset: '-20px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${element.glowColor} 0%, transparent 70%)`,
                    opacity: isHovered ? 0.8 : 0.3,
                    filter: 'blur(15px)',
                    transition: 'all 0.4s ease',
                    transform: isHovered ? 'scale(1.5)' : 'scale(1)'
                  }} />

                  {!isHovered ? (
                    <div style={{
                      width: window.innerWidth < 1024 ? '70px' : '80px',
                      height: window.innerWidth < 1024 ? '70px' : '80px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.9) 100%)',
                      border: `2px solid ${element.glowColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.4s ease',
                      cursor: 'pointer',
                      boxShadow: `0 0 20px ${element.glowColor}`
                    }}>
                      {element.icon}
                    </div>
                  ) : (
                    <div style={{
                      width: window.innerWidth < 1024 ? '260px' : '280px',
                      height: window.innerWidth < 1024 ? '180px' : '200px',
                      background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(45, 45, 45, 0.9))',
                      borderRadius: '16px',
                      border: `2px solid ${element.glowColor}`,
                      boxShadow: `0 0 40px ${element.glowColor}, inset 0 0 20px rgba(255, 255, 255, 0.1)`,
                      backdropFilter: 'blur(20px)',
                      transition: 'all 0.4s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, transparent, ${element.glowColor}, transparent)`,
                        animation: 'shimmer 2s ease-in-out infinite'
                      }} />
                      
                      <div style={{
                        width: '60px',
                        height: '60px',
                        marginBottom: '12px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${element.glowColor}20, transparent)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${element.glowColor}`,
                        animation: 'iconPulse 2s ease-in-out infinite'
                      }}>
                        {element.icon}
                      </div>
                      <h3 style={{ 
                        color: element.glowColor,
                        fontWeight: 'bold',
                        margin: '0 0 8px 0',
                        fontSize: window.innerWidth < 1024 ? '1rem' : '1.1rem',
                        textShadow: `0 0 10px ${element.glowColor}`
                      }}>
                        {element.title}
                      </h3>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        margin: 0
                      }}>
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

      {/* Keyframe Animations */}
      <style>{`
        @keyframes corePulse {
          0%, 100% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.8); }
          50% { box-shadow: 0 0 60px rgba(0, 255, 255, 1); }
        }
        
        @keyframes energyFlow {
          0% { transform: translateX(-100%) scaleX(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateX(0%) scaleX(1); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100%) scaleX(0); opacity: 0; }
        }
        
        @keyframes coreFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes gridPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
};

export default ODOCInfographic;