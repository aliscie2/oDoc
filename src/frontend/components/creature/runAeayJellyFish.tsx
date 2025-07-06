import React, { useState, useEffect, useRef } from "react";
const mainColor = "#FFEFCE";
const RunawayJellyfish = ({
  scale = 1,
  panic = false,
  runaway = false,
  shiver = false,
  die = false,
  thinking = false,
  LogoSvg = null,
  jellyfishOffsetX = 0,
  jellyfishOffsetY = 0,
  logoSvgScale = 1,
}) => {
  const [position, setPosition] = useState({ x: 300, y: 300 });
  const [originalPosition] = useState({ x: 300, y: 300 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [movementDirection, setMovementDirection] = useState(0);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [squishFactor, setSquishFactor] = useState(1);
  const [initialAnimationComplete, setInitialAnimationComplete] =
    useState(false);
  const [emphasisIndex, setEmphasisIndex] = useState(0);
  const [tentacleIndex, setTentacleIndex] = useState(0);
  const [thinkingCycle, setThinkingCycle] = useState(0);
  const [logoEyeTarget, setLogoEyeTarget] = useState({ x: 0, y: 0 }); // Top-left default
  const [isLookingAtCamera, setIsLookingAtCamera] = useState(false);
  const [logoSize, setLogoSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const prevPositionRef = useRef({ x: 300, y: 300 });
  const returnIntervalRef = useRef(null);
  const deathTimeoutRef = useRef(null);
  const initialAnimationTimeoutRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  const eyeTrackingIntervalRef = useRef(null);

  // Logo eye tracking behavior
  useEffect(() => {
    if (LogoSvg) {
      const startEyeTracking = () => {
        // Look at top-left most of the time
        setIsLookingAtCamera(false);
        setLogoEyeTarget({ x: -200, y: -200 }); // Changed from -100, -100

        // Randomly look at camera every 3-8 seconds
        const lookAtCameraDelay = 3000 + Math.random() * 5000;

        const cameraTimeout = setTimeout(() => {
          setIsLookingAtCamera(true);
          setLogoEyeTarget({ x: 0, y: 0 }); // Look at camera (center)

          // Look at camera for 1-3 seconds then return to top-left
          const returnDelay = 1000 + Math.random() * 2000;
          setTimeout(() => {
            setIsLookingAtCamera(false);
            setLogoEyeTarget({ x: -150, y: -150 }); // Changed from -100, -100
          }, returnDelay);
        }, lookAtCameraDelay);

        return cameraTimeout;
      };

      let cameraTimeout = startEyeTracking();

      // Continuous cycle
      eyeTrackingIntervalRef.current = setInterval(
        () => {
          clearTimeout(cameraTimeout);
          cameraTimeout = startEyeTracking();
        },
        8000 + Math.random() * 4000,
      );

      return () => {
        if (eyeTrackingIntervalRef.current)
          clearInterval(eyeTrackingIntervalRef.current);
        clearTimeout(cameraTimeout);
      };
    }
  }, [LogoSvg, die, isDead]);

  // Get logo dimensions
  useEffect(() => {
    if (LogoSvg && logoRef.current) {
      const updateLogoSize = () => {
        const rect = logoRef.current.getBoundingClientRect();
        setLogoSize({ width: rect.width, height: rect.height });
      };

      updateLogoSize();
      window.addEventListener("resize", updateLogoSize);
      return () => window.removeEventListener("resize", updateLogoSize);
    }
  }, [LogoSvg]);

  // Death animation effect
  useEffect(() => {
    if (die && !isDead) {
      deathTimeoutRef.current = setTimeout(() => {
        setIsDead(true);
        setIsBlinking(false);
      }, 2000);
    }
    return () => {
      if (deathTimeoutRef.current) clearTimeout(deathTimeoutRef.current);
    };
  }, [die, isDead]);

  // Initial entrance animation
  useEffect(() => {
    if (!initialAnimationComplete) {
      const emphasisTimer = setInterval(() => {
        setEmphasisIndex((prev) => {
          if (prev >= 3) {
            clearInterval(emphasisTimer);
            const tentacleTimer = setInterval(() => {
              setTentacleIndex((prevTent) => {
                if (prevTent >= 3) {
                  clearInterval(tentacleTimer);
                  setInitialAnimationComplete(true);
                  return prevTent;
                }
                return prevTent + 1;
              });
            }, 200);
            return prev;
          }
          return prev + 1;
        });
      }, 300);
    }
  }, [initialAnimationComplete]);

  // Thinking animation cycle
  useEffect(() => {
    if (thinking && !die) {
      thinkingIntervalRef.current = setInterval(() => {
        setThinkingCycle((prev) => (prev + 1) % 6);
      }, 800);
    }
    return () => {
      if (thinkingIntervalRef.current)
        clearInterval(thinkingIntervalRef.current);
    };
  }, [thinking, die]);

  // Blinking animation
  useEffect(() => {
    if (die || isDead) return;

    const blinkInterval = setInterval(
      () => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      },
      1500 + Math.random() * 2000,
    );

    return () => clearInterval(blinkInterval);
  }, [die, isDead]);

  // Panic mode effect
  useEffect(() => {
    if (panic && !die && !isDead) {
      setIsMoving(true);
      const panicInterval = setInterval(() => {
        setMovementDirection((prev) => prev + (Math.random() - 0.5) * 0.5);
        setSquishFactor(0.8 + Math.random() * 0.2);
      }, 100);
      return () => clearInterval(panicInterval);
    }
  }, [panic, die, isDead]);

  // Mouse interaction (only when not in logo mode)
  useEffect(() => {
    if (LogoSvg) return; // Skip mouse interaction when in logo mode

    const handleMouseMove = (e) => {
      if (!containerRef.current || die || isDead) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setMouse({ x: mouseX, y: mouseY });

      const distance = Math.sqrt(
        (mouseX - position.x) ** 2 + (mouseY - position.y) ** 2,
      );

      if (distance < 100) {
        setIsMoving(true);
        const angle = Math.atan2(position.y - mouseY, position.x - mouseX);
        setMovementDirection(angle);

        if (runaway) {
          if (returnIntervalRef.current) {
            clearInterval(returnIntervalRef.current);
            returnIntervalRef.current = null;
          }

          setIsReturning(false);
          const speed = Math.max(120, 300 - distance);

          let newX = position.x + Math.cos(angle) * speed * 0.2;
          let newY = position.y + Math.sin(angle) * speed * 0.2;

          const padding = 80;
          newX = Math.max(padding, Math.min(rect.width - padding, newX));
          newY = Math.max(padding, Math.min(rect.height - padding, newY));

          const velX = newX - prevPositionRef.current.x;
          const velY = newY - prevPositionRef.current.y;
          setVelocity({ x: velX, y: velY });

          const totalSpeed = Math.sqrt(velX * velX + velY * velY);
          setSquishFactor(Math.max(0.7, 1 - totalSpeed * 0.03));

          prevPositionRef.current = { x: newX, y: newY };
          setPosition({ x: newX, y: newY });
        } else {
          setSquishFactor(0.8 + Math.random() * 0.15);
        }
      } else if (!panic) {
        setIsMoving(false);
        setSquishFactor(1);

        if (runaway) {
          const distanceToOriginal = Math.sqrt(
            (position.x - originalPosition.x) ** 2 +
              (position.y - originalPosition.y) ** 2,
          );
          if (distanceToOriginal > 20) {
            if (!returnIntervalRef.current) {
              setIsReturning(true);
              returnIntervalRef.current = setInterval(() => {
                setPosition((current) => {
                  const dx = originalPosition.x - current.x;
                  const dy = originalPosition.y - current.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);

                  if (distance < 8) {
                    clearInterval(returnIntervalRef.current);
                    returnIntervalRef.current = null;
                    setIsReturning(false);
                    setVelocity({ x: 0, y: 0 });
                    return originalPosition;
                  }

                  const speed = 0.08;
                  const newPos = {
                    x: current.x + dx * speed,
                    y: current.y + dy * speed,
                  };
                  setVelocity({ x: dx * speed, y: dy * speed });
                  return newPos;
                });
              }, 16);
            }
          } else {
            setIsReturning(false);
            setVelocity({ x: 0, y: 0 });
          }
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (returnIntervalRef.current) clearInterval(returnIntervalRef.current);
    };
  }, [position, originalPosition, panic, runaway, die, isDead, LogoSvg]);

  // Calculate eye movement
  const getEyeTarget = () => {
    if (LogoSvg) {
      return logoEyeTarget;
    }
    return isMoving
      ? {
          x: position.x + Math.cos(movementDirection) * 100,
          y: position.y + Math.sin(movementDirection) * 100,
        }
      : mouse;
  };

  const lookTarget = getEyeTarget();
  const currentPos = LogoSvg ? { x: 40, y: 40 } : position; // Center of jellyfish in logo mode
  const eyeAngle = Math.atan2(
    lookTarget.y - currentPos.y,
    lookTarget.x - currentPos.x,
  );
  const eyeDistance = LogoSvg
    ? isLookingAtCamera
      ? 6
      : 65
    : isMoving
      ? 12
      : 8;
  const eyeX = 255.5 + Math.cos(eyeAngle) * eyeDistance;
  const eyeY = 263.5 + Math.sin(eyeAngle) * eyeDistance;
  const pupilDistance = LogoSvg
    ? isLookingAtCamera
      ? 3
      : 60
    : isMoving
      ? 6
      : 4;
  const pupilX = 255.5 + Math.cos(eyeAngle) * pupilDistance;
  const pupilY = 263.5 + Math.sin(eyeAngle) * pupilDistance;

  // Animation calculations
  const breathScale = 1 + Math.sin(Date.now() * 0.003) * 0.02;
  const shiverIntensity = shiver ? Math.sin(Date.now() * 0.05) * 3 : 0;
  const moveRotation = isMoving ? Math.sin(Date.now() * 0.02) * 15 : 0;
  const thinkingTilt = thinking ? Math.sin(Date.now() * 0.004) * 10 : 0;
  const bodySquish = isMoving ? squishFactor : breathScale;
  const panicShake = panic ? Math.sin(Date.now() * 0.03) * 2 : 0;

  // Animation keyframes
  const bounceKeyframes = `
    @keyframes bounce-in {
      0% { transform: scale(0) translateY(20px); opacity: 0; }
      50% { transform: scale(1.2) translateY(-10px); opacity: 0.8; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes bounce-out {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
      100% { transform: scale(0); opacity: 0; }
    }
    @keyframes death-transition {
      0% { filter: brightness(1) contrast(1); }
      50% { filter: brightness(0.7) contrast(1.2); }
      100% { filter: brightness(0.3) contrast(0.8) grayscale(0.8); }
    }
    @keyframes thinking-emphasis {
      0% { transform: scale(0) rotate(0deg); opacity: 0; }
      25% { transform: scale(1.3) rotate(5deg); opacity: 0.8; }
      50% { transform: scale(1) rotate(0deg); opacity: 1; }
      75% { transform: scale(1.1) rotate(-3deg); opacity: 0.9; }
      100% { transform: scale(0) rotate(0deg); opacity: 0; }
    }
  `;

  const emphases = [
    {
      d: "M251 45.5C251 43.0147 253.015 41 255.5 41C257.985 41 260 43.0147 260 45.5V99.5C260 101.985 257.985 104 255.5 104C253.015 104 251 101.985 251 99.5V45.5Z",
      origin: "255.5px 126px",
      wave: 0,
      scale: 1,
    },
    {
      d: "M327.612 60.1503C328.572 57.8581 331.209 56.7787 333.501 57.7394C335.794 58.7 336.873 61.3369 335.912 63.629L315.04 113.432C314.079 115.724 311.442 116.804 309.15 115.843C306.858 114.882 305.779 112.245 306.739 109.953L327.612 60.1503Z",
      origin: "321px 126px",
      wave: 1,
      scale: 1.1,
    },
    {
      d: "M389.708 92.374C391.353 90.5106 394.196 90.3331 396.06 91.9775C397.923 93.622 398.101 96.4657 396.456 98.3291L360.726 138.818C359.081 140.681 356.237 140.859 354.374 139.214C352.511 137.57 352.333 134.726 353.978 132.863L389.708 92.374Z",
      origin: "375px 126px",
      wave: 2,
      scale: 1.05,
    },
  ];

  const tentacles = [
    {
      d: "M273.28 399C270.489 406.405 265.944 420.495 267.238 430.854C268.181 438.397 271.295 441.887 272.886 449.291C274.405 456.365 277.062 460.726 275.306 467.729C271.187 484.152 240.698 484.152 236.579 467.729C234.823 460.726 237.479 456.365 238.999 449.291C240.589 441.887 243.704 438.397 244.647 430.854C245.932 420.566 241.458 406.598 238.662 399.153C244.142 399.891 249.736 400.275 255.418 400.275C261.483 400.275 267.447 399.839 273.28 399Z",
      origin: "255.5px 401px",
      wave: 0,
      scale: 1.1,
    },
    {
      d: "M213.039 392.755C207.38 398.287 197.306 409.136 194.101 419.071C191.767 426.306 193.115 430.785 191.428 438.168C189.815 445.221 190.38 450.296 185.828 455.901C175.155 469.044 147.523 456.159 150.73 439.535C152.098 432.445 156.349 429.616 160.716 423.847C165.286 417.809 169.584 415.962 173.626 409.523C179.139 400.743 180.987 386.193 181.599 378.264C186.254 381.249 191.161 383.961 196.311 386.362C201.808 388.926 207.398 391.05 213.039 392.755Z",
      origin: "180px 401px",
      wave: 1,
      scale: 1.08,
    },
    {
      d: "M329.787 378.101C330.387 385.992 332.222 400.682 337.773 409.523C341.816 415.962 346.113 417.809 350.684 423.847C355.051 429.616 359.301 432.445 360.669 439.535C363.877 456.159 336.244 469.044 325.571 455.901C321.019 450.296 321.584 445.221 319.972 438.168C318.284 430.785 319.632 426.306 317.298 419.071C314.116 409.204 304.158 398.436 298.478 392.87C303.756 391.223 308.988 389.207 314.138 386.806C319.635 384.242 324.855 381.326 329.787 378.101Z",
      origin: "330px 401px",
      wave: 3,
      scale: 1.08,
    },
  ];

  const renderEye = () => {
    if (isDead) {
      return (
        <>
          <path
            d="M230 240L280 290M280 240L230 290"
            stroke="#666"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M230 240L280 290M280 240L230 290"
            stroke="#333"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      );
    }

    const thinkingSquint = thinking
      ? 0.75 + Math.sin(Date.now() * 0.006) * 0.15
      : 1;

    return (
      <>
        <circle
          cx={eyeX}
          cy={eyeY}
          r="73.5"
          fill="#024B6D"
          style={{
            transform: isBlinking
              ? "scaleY(0.1)"
              : `scaleY(${(isMoving ? 1.1 : 1) * thinkingSquint})`,
            transformOrigin: `${eyeX}px ${eyeY}px`,
            transition: LogoSvg
              ? "cx 0.8s ease-in-out, cy 0.8s ease-in-out, transform 0.3s ease-out"
              : "transform 0.15s ease-out",
          }}
        />
        <circle
          cx={pupilX}
          cy={pupilY}
          r="17.5"
          fill="#FFFFF3"
          style={{
            transform: isBlinking
              ? "scaleY(0.1)"
              : `scaleY(${(isMoving ? 1.2 : 1) * thinkingSquint})`,
            transformOrigin: `${pupilX}px ${pupilY}px`,
            transition: LogoSvg
              ? "cx 0.8s ease-in-out, cy 0.8s ease-in-out, transform 0.3s ease-out"
              : "transform 0.15s ease-out",
          }}
        />
      </>
    );
  };

  const jellyfishElement = (
    <div
      style={{
        position: "relative",
        width: 80 * scale,
        height: 80 * scale,
        transition: isReturning ? "all 0.8s ease-out" : "all 0.2s ease-out",
        transform: LogoSvg
          ? `translate(calc(50% + ${logoSize.width / 2}px + ${jellyfishOffsetX}px), calc(50% - ${logoSize.height / 4}px + ${jellyfishOffsetY}px))`
          : runaway
            ? `translate(${position.x - 40 * scale}px, ${position.y - 40 * scale}px)`
            : "none",
        filter: die
          ? "brightness(0.3) contrast(0.8) grayscale(0.8)"
          : `drop-shadow(0 ${(isMoving ? 8 : 4) * scale}px ${(isMoving ? 30 : 20) * scale}px rgba(249, 243, 224, ${isMoving ? 0.5 : 0.3})) drop-shadow(0 ${(isMoving ? 12 : 8) * scale}px ${(isMoving ? 40 : 30) * scale}px rgba(0, 0, 0, ${isMoving ? 0.7 : 0.6}))`,
        pointerEvents: "none",
        animation: die ? "death-transition 2s ease-out" : "none",
        zIndex: LogoSvg ? 10 : 1000,
      }}
    >
      <svg width={80 * scale} height={80 * scale} viewBox="0 0 512 512">
        {emphases.map((emphas, i) => (
          <path
            key={i}
            d={emphas.d}
            fill={mainColor}
            style={{
              opacity: !initialAnimationComplete
                ? i < emphasisIndex
                  ? 1
                  : 0
                : thinking
                  ? thinkingCycle === i || thinkingCycle === i + 3
                    ? 1
                    : 0
                  : 1,
              transform: `rotate(${isMoving && !LogoSvg ? Math.sin(Date.now() * 0.015 + emphas.wave) * 20 : Math.sin(Date.now() * 0.008 + emphas.wave) * 5}deg) scaleY(${isMoving && !LogoSvg ? 1.3 : emphas.scale})`,
              transformOrigin: emphas.origin,
              transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
              animation:
                !initialAnimationComplete && i === emphasisIndex - 1
                  ? "bounce-in 0.5s ease-out"
                  : thinking && (thinkingCycle === i || thinkingCycle === i + 3)
                    ? "thinking-emphasis 0.8s ease-out"
                    : "none",
            }}
          />
        ))}

        <path
          d="M255.5 401C331.439 401 393 339.439 393 263.5C393 187.561 331.439 126 255.5 126C179.561 126 118 187.561 118 263.5C118 339.439 179.561 401 255.5 401Z"
          fill={mainColor}
          style={{
            transform: `scale(${bodySquish})`,
            transformOrigin: "255.5px 263.5px",
            transition: "transform 0.3s ease-out",
          }}
        />

        <path
          d="M255 374C315.751 374 365 324.527 365 263.5C365 202.473 315.751 153 255 153C194.249 153 145 202.473 145 263.5C145 324.527 194.249 374 255 374Z"
          fill="white"
          style={{
            transform: isBlinking
              ? "scaleY(0.1)"
              : `scaleY(${isMoving && !LogoSvg ? 1.1 : 1}) scaleX(${bodySquish})`,
            transformOrigin: "255px 263.5px",
            transition: "transform 0.15s ease-out",
          }}
        />

        {renderEye()}

        {tentacles.map((tentacle, i) => (
          <path
            key={i}
            d={tentacle.d}
            fill={mainColor}
            style={{
              opacity: !initialAnimationComplete
                ? i < tentacleIndex
                  ? 1
                  : 0
                : 1,
              transform: `rotate(${isMoving && !LogoSvg ? Math.sin(Date.now() * 0.015 + tentacle.wave) * 20 : Math.sin(Date.now() * 0.008 + tentacle.wave) * 5}deg) scaleY(${isMoving && !LogoSvg ? 1.3 : tentacle.scale})`,
              transformOrigin: tentacle.origin,
              transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
              animation:
                !initialAnimationComplete && i === tentacleIndex - 1
                  ? "bounce-in 0.5s ease-out"
                  : "none",
            }}
          />
        ))}

        {isMoving && !die && !LogoSvg && (
          <>
            <circle
              cx="200"
              cy="100"
              r="3"
              fill="rgba(249, 243, 224, 0.6)"
              opacity={Math.sin(Date.now() * 0.02) * 0.5 + 0.5}
            />
            <circle
              cx="320"
              cy="80"
              r="2"
              fill="rgba(249, 243, 224, 0.8)"
              opacity={Math.sin(Date.now() * 0.025 + 1) * 0.5 + 0.5}
            />
            <circle
              cx="260"
              cy="60"
              r="4"
              fill="rgba(249, 243, 224, 0.4)"
              opacity={Math.sin(Date.now() * 0.018 + 2) * 0.5 + 0.5}
            />
          </>
        )}
      </svg>
    </div>
  );

  if (LogoSvg) {
    return (
      <div style={{ display: "flex" }} ref={containerRef}>
        <div style={{ transform: `scale(${logoSvgScale})` }}>
          <LogoSvg />
        </div>
        {jellyfishElement}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: runaway ? "absolute" : "relative",
        width: "100%",
        height: "100%",

        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <style>{bounceKeyframes}</style>
      {jellyfishElement}
    </div>
  );
};

export default RunawayJellyfish;
