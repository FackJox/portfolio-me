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
export const middleMagazineAtom = atom("vague"); // Default to vague on first render

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
    const newIsPortrait = viewport.width <= 11; // Adjusted threshold for Three.js viewport units
    console.log('newIsPortrait:', newIsPortrait);
    setIsPortrait(newIsPortrait);
    console.log("🚀 ~ useLayoutEffect ~ viewport.width:", viewport.width)
  }, [viewport.width, viewport.height, isPortrait]);

  const [smackPage] = useAtom(smackAtom);
  const [vaguePage] = useAtom(vagueAtom);
  const [engineerPage] = useAtom(engineerAtom);

  // Default positions serve as the center points for the carousel
  const defaultPositions = useMemo(
    () => ({
      [magazines.vague]: isPortrait
        ? [-0.65 + (vaguePage > 0 ? 0.65 : 0), 2, 3.5]      // Portrait: top
        : [-2.5 + (vaguePage > 0 ? 0.65 : 0), -0, 5],    // Landscape: left
      [magazines.smack]: isPortrait 
        ? [-0.65 + (smackPage > 0 ? 0.65 : 0), -2, 3.5]     // Portrait: bottom
        : [-2 + (smackPage > 0 ? 0.65 : 0), -0, 5],     // Landscape: middle
      [magazines.engineer]: isPortrait 
        ? [-0.65 + (engineerPage > 0 ? 0.65 : 0), 0, 3.5]     // Portrait: middle
        : [2.5 + (engineerPage > 0 ? 0.65 : 0), -0, 5],  // Landscape: right
    }),
    [isPortrait, smackPage, vaguePage, engineerPage]
  );

  // Calculate positions with drag offset and wrapping
  const positions = useMemo(() => {
    const spacing = 2.2; // Use consistent spacing regardless of orientation
    const totalSpacing = spacing * 3; // Total space for all 3 magazines

    // Function to wrap offset within the total spacing
    const wrapOffset = (offset) => {
      // Normalize to [-totalSpacing/2, totalSpacing/2]
      const normalizedOffset = ((offset % totalSpacing) + totalSpacing * 1.5) % totalSpacing - totalSpacing / 2;
      return normalizedOffset;
    };

    // Calculate base offset for each magazine based on its default position
    const getBaseIndex = (magazineName) => {
      return magazineName === magazines.vague ? 0 :
             magazineName === magazines.engineer ? 1 : 2;
    };

    // Calculate positions for each magazine with wrapping
    const calculatePosition = (magazineName) => {
      const basePosition = defaultPositions[magazineName];
      const index = getBaseIndex(magazineName);
      
      // Calculate individual magazine offset including its index position
      const magazineOffset = dragOffset + (index * spacing);
      const wrappedOffset = wrapOffset(magazineOffset);
      
      // Check if magazine is opened
      const isOpened = magazineName === magazines.vague ? vaguePage > 0 :
                      magazineName === magazines.engineer ? engineerPage > 0 :
                      smackPage > 0;
      
      // Calculate smooth z adjustment based on distance from center, only if not opened
      const zAdjustment = !isOpened ? (() => {
        const distanceFromCenter = Math.abs(wrappedOffset);
        const transitionRange = spacing / 2;
        const lerpFactor = 1 - Math.min(distanceFromCenter / transitionRange, 1);
        return lerpFactor * 2;
      })() : 0;
      
      return isPortrait
        ? [
            basePosition[0],
            wrappedOffset,
            basePosition[2] + zAdjustment
          ]
        : [
            wrappedOffset,
            basePosition[1],
            basePosition[2] + zAdjustment
          ];
    };

    return {
      [magazines.vague]: calculatePosition(magazines.vague),
      [magazines.smack]: calculatePosition(magazines.smack),
      [magazines.engineer]: calculatePosition(magazines.engineer),
    };
  }, [defaultPositions, dragOffset, isPortrait]);

  // Handle drag gestures
  const bind = useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedMagazine) return;
        event.stopPropagation();
        setIsDragging(true);
        dragStartRef.current = dragOffset;
        velocityRef.current = 0;
      },
      onDrag: ({ event, movement: [dx, dy], velocity: [vx, vy], last }) => {
        if (focusedMagazine) return;
        event.stopPropagation();
        
        const totalMovement = Math.sqrt(dx * dx + dy * dy);
        
        // Only handle drag if it's a significant movement
        if (totalMovement > 5) {
          // Handle drag movement
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

  // Smooth animation
  useFrame((_, delta) => {
    // No need for bounds since we're wrapping around
    // Just smooth lerp to target
    const lerpFactor = isDragging ? 0.4 : 0.1;
    const newOffset = THREE.MathUtils.lerp(
      dragOffset,
      targetOffsetRef.current,
      lerpFactor
    );
    
    setDragOffset(newOffset);

    // Determine which magazine is in the middle based on wrapped offset
    const spacing = 2.2;
    const wrappedOffset = ((newOffset % (spacing * 3)) + spacing * 4.5) % (spacing * 3) - spacing * 1.5;
    
    // Calculate which magazine should be in the middle
    const index = Math.round(wrappedOffset / spacing);
    const magazineOrder = [magazines.vague, magazines.smack, magazines.engineer];
    const middleMagazine = magazineOrder[((index % 3) + 3) % 3];
    
    // Update middle magazine atom if it changed
    if (middleMagazine !== currentMiddleMagazine) {
      setMiddleMagazine(middleMagazine);
    }
  });

  const [currentMiddleMagazine, setMiddleMagazine] = useAtom(middleMagazineAtom);

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