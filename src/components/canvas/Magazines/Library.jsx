// Library.js
import { atom, useAtom } from "jotai";
import { Magazine } from "./Magazine";
import React, { useState, useMemo, useLayoutEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { animated } from "@react-spring/three";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";

// Atoms for page states
const smackAtom = atom(0);
const vagueAtom = atom(0);
const engineerAtom = atom(0);

// Atom to track the focused magazine
export const focusedMagazineAtom = atom(null);

const picturesSmack = [
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06Graphics",
  "07Graphics",
  "08Scout",
  "09Scout",
  "10Bunker",
  "11Bunker",
  "12AI",
  "13AI",
  "14Sandro",
  "15Sandro",
  "16Tarot",
  "17Tarot",
  "18Tarot",
  "19Tarot",
  "20Events",
  "21Events",
];

const picturesEngineer = [
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06DigitalTwins",
  "07DigitalTwins",
  "08DigitalTwins",
  "09DigitalTwins",
  "10WindTurbines",
  "11WindTurbines",
  "12HPC",
  "13HPC",
  "14Modelling",
  "15Modelling",
  "16Transformation",
  "17Transformation",
  "18Transformation",
  "19Transformation",
];

const picturesVague = [
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06Timeline",
  "07Timeline",
  "08About",
  "09About",
  "10Contributers",
  "11Contributers",
];

const magazines = {
  vague: "vague",
  engineer: "engineer",
  smack: "smack",
};

// Define scroll positions
const scrollPositions = {
  a: { x: -2.75, y: -2.2 }, 
  b: { x: -0.5, y: 0 },
  c: { x: 1.75, y: 2.2 },
};

export const Library = (props) => {
  const { viewport } = useThree();
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollIndex, setScrollIndex] = useState({
    [magazines.smack]: 0,    // starts at position a
    [magazines.vague]: 1,    // starts at position b
    [magazines.engineer]: 2, // starts at position c
  });
  const dragStartRef = useRef(0);
  const velocityRef = useRef(0);
  const scrollStartRef = useRef(0);
  const groupRef = useRef();
  const [focusedMagazine] = useAtom(focusedMagazineAtom);
  
  useLayoutEffect(() => {
    const newIsPortrait = viewport.width < viewport.height;
    setIsPortrait(newIsPortrait);
  }, [viewport.width, viewport.height, isPortrait]);

  const [smackPage] = useAtom(smackAtom);
  const [vaguePage] = useAtom(vagueAtom);
  const [engineerPage] = useAtom(engineerAtom);

  const getScrollPosition = (index, progress = 0) => {
    // Wrap index between 0 and 2
    const wrappedIndex = ((index % 3) + 3) % 3;
    const currentPos = wrappedIndex === 0 ? scrollPositions.a :
                      wrappedIndex === 1 ? scrollPositions.b :
                                         scrollPositions.c;
    
    // Calculate next position for interpolation
    const nextIndex = ((wrappedIndex + 1) % 3);
    const nextPos = nextIndex === 0 ? scrollPositions.a :
                   nextIndex === 1 ? scrollPositions.b :
                                   scrollPositions.c;
    
    // Interpolate between current and next position
    return {
      x: THREE.MathUtils.lerp(currentPos.x, nextPos.x, progress),
      y: THREE.MathUtils.lerp(currentPos.y, nextPos.y, progress)
    };
  };

  // Calculate positions for each magazine
  const positions = useMemo(() => {
    const calculatePosition = (magazineName) => {
      const pageOffset = magazineName === magazines.smack ? smackPage :
                        magazineName === magazines.vague ? vaguePage :
                                                         engineerPage;
      const pos = getScrollPosition(scrollIndex[magazineName], scrollProgress);
      const xOffset = pageOffset > 0 ? 0.65 : 0;
      
      return isPortrait
        ? [-0.65 + xOffset, pos.y, 4]
        : [pos.x + xOffset, -0.2, 6];
    };

    return {
      [magazines.smack]: calculatePosition(magazines.smack),
      [magazines.vague]: calculatePosition(magazines.vague),
      [magazines.engineer]: calculatePosition(magazines.engineer),
    };
  }, [isPortrait, smackPage, vaguePage, engineerPage, scrollIndex, scrollProgress]);

  // Handle drag gestures
  const bind = useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedMagazine) return;
        event.stopPropagation();
        setIsDragging(true);
        scrollStartRef.current = scrollProgress;
        dragStartRef.current = 0;
        velocityRef.current = 0;
      },
      onDrag: ({ event, movement: [dx, dy], velocity: [vx, vy], last }) => {
        if (focusedMagazine) return;
        event.stopPropagation();
        
        const movement = isPortrait ? -dy * 0.001 : dx * 0.001;
        const velocity = isPortrait ? -vy : vx;
        velocityRef.current = velocity;
        
        // Calculate scroll progress (0 to 1)
        let newProgress = scrollStartRef.current + movement;
        newProgress = newProgress - Math.floor(newProgress); // Wrap to 0-1
        setScrollProgress(newProgress);
        
        if (last) {
          setIsDragging(false);
          const momentum = velocity * 0.2;
          let targetProgress = newProgress + momentum;
          
          // Snap to nearest position (0, 0.33, 0.66, or 1)
          targetProgress = Math.round(targetProgress * 3) / 3;
          
          // If we crossed a position boundary, update indices
          if (Math.abs(targetProgress - scrollStartRef.current) > 0.1) {
            const direction = Math.sign(targetProgress - scrollStartRef.current);
            setScrollIndex(prev => ({
              [magazines.smack]: ((prev[magazines.smack] + direction) % 3 + 3) % 3,
              [magazines.vague]: ((prev[magazines.vague] + direction) % 3 + 3) % 3,
              [magazines.engineer]: ((prev[magazines.engineer] + direction) % 3 + 3) % 3,
            }));
          }
          
          setScrollProgress(0); // Reset progress after updating indices
        }
      },
    },
    { drag: { filterTaps: true } }
  );

  // Smooth animation
  useFrame((_, delta) => {
    if (focusedMagazine || !isDragging) return;
    
    // Smooth lerp for drag movement
    const lerpFactor = isDragging ? 0.4 : 0.1;
    setScrollProgress(current => 
      THREE.MathUtils.lerp(current, isDragging ? current : 0, lerpFactor)
    );
  });

  return (
    <group {...props} ref={groupRef}>
      {/* Invisible plane for drag detection */}
      <mesh 
        position={[0, 0, 10]} 
        {...bind()}
        // onPointerOver={(e) => e.stopPropagation()}
      >
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Magazines */}
      {Object.entries({
        [magazines.smack]: {
          position: positions[magazines.smack],
          pictures: picturesSmack,
          atom: smackAtom,
        },
        [magazines.vague]: {
          position: positions[magazines.vague],
          pictures: picturesVague,
          atom: vagueAtom,
        },
        [magazines.engineer]: {
          position: positions[magazines.engineer],
          pictures: picturesEngineer,
          atom: engineerAtom,
        },
      }).map(([magazineName, config]) => (
        <animated.group key={magazineName} position={config.position}>
          <Magazine
            pictures={config.pictures}
            pageAtom={config.atom}
            magazine={magazineName}
            focusedMagazineAtom={focusedMagazineAtom}
            isPortrait={isPortrait}
            layoutPosition={positions[magazineName]}
            focusedX={0}  // Magazine will move to x=2 when focused
            focusedY={0}  // Magazine will move to y=1 when focused
          />
        </animated.group>
      ))}
    </group>
  );
};
