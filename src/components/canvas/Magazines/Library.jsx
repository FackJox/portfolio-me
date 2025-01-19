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

// Atom to track which magazine is in the middle
export const styleMagazineAtom = atom("vague"); // Default to vague on first render

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

export const Library = (props) => {
  const { viewport } = useThree();
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartRef = useRef(0);
  const velocityRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const groupRef = useRef();
  const [focusedMagazine, setFocusedMagazine] = useAtom(focusedMagazineAtom);
  
  useLayoutEffect(() => {
    // Get the actual window width in pixels
    const windowWidth = window.innerWidth;
    const newIsPortrait = windowWidth <= 768; // 1024px threshold for portrait mode
    console.log('Window width in pixels:', windowWidth);
    console.log('Is portrait:', newIsPortrait);
    setIsPortrait(newIsPortrait);
  }, [viewport.width, viewport.height, isPortrait]);

  const [smackPage] = useAtom(smackAtom);
  const [vaguePage] = useAtom(vagueAtom);
  const [engineerPage] = useAtom(engineerAtom);

  // Default positions serve as the center points for the carousel
  const defaultPositions = useMemo(
    () => ({
      [magazines.vague]: isPortrait
        ? [-0.65 + (vaguePage > 0 ? 0.65 : 0), 2, 3.5]      // Portrait: top
        : [-0.5 + (vaguePage > 0 ? 0.65 : 0), -0, 4.5 - (vaguePage > 0 ? 1 : 0)],    // Landscape: left
      [magazines.smack]: isPortrait 
        ? [-0.65 + (smackPage > 0 ? 0.65 : 0), -2, 3.5]     // Portrait: bottom
        : [-2.5- (vaguePage > 0 ? 1 : 0) + (smackPage > 0 ? 0.65 : 0), -0, 4.5 - (vaguePage > 0 ? 1 : 0)],     // Landscape: middle
      [magazines.engineer]: isPortrait 
        ? [-0.65 + (engineerPage > 0 ? 0.65 : 0), 0, 3.5]     // Portrait: middle
        : [1.5 + (vaguePage > 0 ? 1 : 0) + (engineerPage > 0 ? 0.65 : 0), -0, 4.5 - (vaguePage > 0 ? 1 : 0)],  // Landscape: right
    }),
    [isPortrait, smackPage, vaguePage, engineerPage]
  );

  // Calculate positions with drag offset and wrapping
  const positions = useMemo(() => {
    // In landscape mode, just use default positions
    if (!isPortrait) {
      return {
        [magazines.vague]: defaultPositions[magazines.vague],
        [magazines.smack]: defaultPositions[magazines.smack],
        [magazines.engineer]: defaultPositions[magazines.engineer],
      };
    }

    const spacing = 2.2;
    const totalSpacing = spacing * 3;

    const wrapOffset = (offset) => {
      const normalizedOffset = ((offset % totalSpacing) + totalSpacing * 1.5) % totalSpacing - totalSpacing / 2;
      return normalizedOffset;
    };

    const getBaseIndex = (magazineName) => {
      return magazineName === magazines.vague ? 0 :
             magazineName === magazines.engineer ? 1 : 2;
    };

    const calculatePosition = (magazineName) => {
      const basePosition = defaultPositions[magazineName];
      const index = getBaseIndex(magazineName);
      
      const magazineOffset = dragOffset + (index * spacing);
      const wrappedOffset = wrapOffset(magazineOffset);
      
      const isOpened = magazineName === magazines.vague ? vaguePage > 0 :
                      magazineName === magazines.engineer ? engineerPage > 0 :
                      smackPage > 0;
      
      // Only apply z adjustment in portrait mode
      const zAdjustment = !isOpened && isPortrait ? (() => {
        const distanceFromCenter = Math.abs(wrappedOffset);
        const transitionRange = spacing / 2;
        const lerpFactor = 1 - Math.min(distanceFromCenter / transitionRange, 1);
        return lerpFactor * 2;
      })() : 0;
      
      return [
        basePosition[0],
        isPortrait ? wrappedOffset : basePosition[1],
        basePosition[2] + zAdjustment
      ];
    };

    return {
      [magazines.vague]: calculatePosition(magazines.vague),
      [magazines.smack]: calculatePosition(magazines.smack),
      [magazines.engineer]: calculatePosition(magazines.engineer),
    };
  }, [defaultPositions, dragOffset, isPortrait, smackPage, vaguePage, engineerPage]);

  // Handle drag gestures
  const bind = useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedMagazine || !isPortrait) return;
        event.stopPropagation();
        setIsDragging(true);
        dragStartRef.current = dragOffset;
        velocityRef.current = 0;
      },
      onDrag: ({ event, movement: [dx, dy], velocity: [vx, vy], last }) => {
        if (focusedMagazine || !isPortrait) return;
        event.stopPropagation();
        
        const totalMovement = Math.sqrt(dx * dx + dy * dy);
        
        if (totalMovement > 5) {
          const movement = isPortrait ? -dy * 0.005 : dx * 0.005;
          const velocity = isPortrait ? -vy : vx;
          velocityRef.current = velocity;
          
          const newOffset = dragStartRef.current + movement;
          targetOffsetRef.current = newOffset;
          
          if (last) {
            setIsDragging(false);
            const momentum = velocity * 0.5;
            const projectedOffset = newOffset + momentum;
            const spacing = 2.2;
            const snapOffset = Math.round(projectedOffset / spacing) * spacing;
            targetOffsetRef.current = snapOffset;
          }
        } else if (last) {
          setIsDragging(false);
        }
      },
    },
    { drag: { filterTaps: true } }
  );

  // Smooth animation - only in portrait mode
  useFrame((_, delta) => {
    if (!isPortrait) return;

    const lerpFactor = isDragging ? 0.4 : 0.1;
    const newOffset = THREE.MathUtils.lerp(
      dragOffset,
      targetOffsetRef.current,
      lerpFactor
    );
    
    setDragOffset(newOffset);

    const spacing = 2.2;
    const wrappedOffset = ((newOffset % (spacing * 3)) + spacing * 4.5) % (spacing * 3) - spacing * 1.5;
    
    const index = Math.round(wrappedOffset / spacing);
    const magazineOrder = [magazines.vague, magazines.smack, magazines.engineer];
    const middleMagazine = magazineOrder[((index % 3) + 3) % 3];
    
    if (middleMagazine !== currentMiddleMagazine) {
      setMiddleMagazine(middleMagazine);
    }
  });

  const [currentMiddleMagazine, setMiddleMagazine] = useAtom(styleMagazineAtom);

  return (
    <group {...props} ref={groupRef}>
      {/* Invisible plane for drag detection */}
      <mesh 
        position={[0, 0, 10]} 
        {...bind()}
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
          />
        </animated.group>
      ))}
    </group>
  );
};