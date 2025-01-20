// portfolio-me/src/components/canvas/Magazines/Library.jsx
import { atom, useAtom } from "jotai";
import { Magazine } from "./Magazine";
import { VagueButton, EngineerButton, SmackButton } from "../Buttons";
import React, { useState, useMemo, useLayoutEffect, useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { animated } from "@react-spring/three";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";
import { 
  smackAtom, 
  vagueAtom, 
  engineerAtom, 
  focusedMagazineAtom, 
  styleMagazineAtom,
  magazineViewingStatesAtom
} from '@/helpers/atoms';
import { calculateMagazineTargetPosition } from "@/helpers/positionHelper";

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
  const { viewport, camera } = useThree();
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartRef = useRef(0);
  const velocityRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const groupRef = useRef();
  const [focusedMagazine, setFocusedMagazine] = useAtom(focusedMagazineAtom);
  const [currentMiddleMagazine, setMiddleMagazine] = useAtom(styleMagazineAtom);
  const [magazineViewStates] = useAtom(magazineViewingStatesAtom);
  
  // Add initialization tracking
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(false);
  const initializationCountRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!isMountedRef.current) return;
      
      const windowWidth = window.innerWidth;
      const newIsPortrait = windowWidth <= 768;
      setIsPortrait(newIsPortrait);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [smackPage] = useAtom(smackAtom);
  const [vaguePage] = useAtom(vagueAtom);
  const [engineerPage] = useAtom(engineerAtom);
  
  // Smoothly update dragOffset and determine middle magazine
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
    
    const index = Math.round(wrappedOffset / spacing) % 3;
    const magazineOrder = [magazines.engineer, magazines.vague, magazines.smack];
    const calculatedIndex = (index + 1) % 3;  // Shift by 1 to make vague the middle magazine initially
    const middleMagazine = magazineOrder[calculatedIndex];
    
    if (middleMagazine !== currentMiddleMagazine) {
      setMiddleMagazine(middleMagazine);
    }
  });

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

  // Calculate target positions for all magazines
  const targetPositions = useMemo(() => {
    initializationCountRef.current++;
    
    if (!isMountedRef.current) {
      return {};
    }

    const positions = {
      [magazines.vague]: calculateMagazineTargetPosition({
        isPortrait,
        dragOffset,
        focusedMagazine,
        magazine: magazines.vague,
        page: vaguePage,
        delayedPage: vaguePage,
        layoutPosition: null,
        viewingRightPage: magazineViewStates.vague,
        camera
      }),
      [magazines.smack]: calculateMagazineTargetPosition({
        isPortrait,
        dragOffset,
        focusedMagazine,
        magazine: magazines.smack,
        page: smackPage,
        delayedPage: smackPage,
        layoutPosition: null,
        viewingRightPage: magazineViewStates.smack,
        camera
      }),
      [magazines.engineer]: calculateMagazineTargetPosition({
        isPortrait,
        dragOffset,
        focusedMagazine,
        magazine: magazines.engineer,
        page: engineerPage,
        delayedPage: engineerPage,
        layoutPosition: null,
        viewingRightPage: magazineViewStates.engineer,
        camera
      }),
    };

    return positions;
  }, [isPortrait, dragOffset, focusedMagazine, vaguePage, smackPage, engineerPage, camera, magazineViewStates]);

  // Only render magazines if properly initialized
  if (!isMountedRef.current || Object.keys(targetPositions).length === 0) {
    return null;
  }

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
          pictures: picturesSmack,
          atom: smackAtom,
          Button: SmackButton
        },
        [magazines.vague]: {
          pictures: picturesVague,
          atom: vagueAtom,
          Button: VagueButton
        },
        [magazines.engineer]: {
          pictures: picturesEngineer,
          atom: engineerAtom,
          Button: EngineerButton
        },
      }).map(([magazineName, config]) => (
        <Magazine
          key={magazineName}
          pictures={config.pictures}
          pageAtom={config.atom}
          magazine={magazineName}
          focusedMagazineAtom={focusedMagazineAtom}
          isPortrait={isPortrait}
          layoutPosition={targetPositions[magazineName]}
          Button={config.Button}
          targetPosition={targetPositions[magazineName]}
          camera={camera}
        />
      ))}
    </group>
  );
};