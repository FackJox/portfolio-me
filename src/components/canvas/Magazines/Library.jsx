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
import { calculateFocusPosition, updateMagazineCarousel, calculateMiddleMagazine } from "@/helpers/positionHelper";

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
      const windowHeight = window.innerHeight;
      const newIsPortrait = windowWidth < windowHeight;
      
      setIsPortrait(newIsPortrait);

      // Initialize dragOffset and targetOffset on resize/mount
      if (!newIsPortrait) {
        dragStartRef.current = 0;
        targetOffsetRef.current = 0;
        setDragOffset(0);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize state on mount
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      if (!isPortrait) {
        dragStartRef.current = 0;
        targetOffsetRef.current = 0;
        setDragOffset(0);
      }
    }
  }, [isPortrait]);

  const [smackPage, setSmackPage] = useAtom(smackAtom);
  const [vaguePage, setVaguePage] = useAtom(vagueAtom);
  const [engineerPage, setEngineerPage] = useAtom(engineerAtom);
  
  // Smoothly update dragOffset
  useFrame((_, delta) => {
    // Update dragOffset without lerping for portrait mode
    if (isPortrait) {
      setDragOffset(targetOffsetRef.current);
    }

    // Calculate target positions for each magazine
    Object.entries({
      [magazines.smack]: {
        magazineRef: groupRef.current?.children.find(child => 
          child.userData?.magazine === magazines.smack
        ),
        page: smackPage,
        setPage: (page) => setSmackPage(page)
      },
      [magazines.vague]: {
        magazineRef: groupRef.current?.children.find(child => 
          child.userData?.magazine === magazines.vague
        ),
        page: vaguePage,
        setPage: (page) => setVaguePage(page)
      },
      [magazines.engineer]: {
        magazineRef: groupRef.current?.children.find(child => 
          child.userData?.magazine === magazines.engineer
        ),
        page: engineerPage,
        setPage: (page) => setEngineerPage(page)
      }
    }).forEach(([magazine, { magazineRef, page, setPage }]) => {
      if (!magazineRef) return;
      
      updateMagazineCarousel({
        magazineRef,
        targetPosition: targetPositions[magazine],
        camera,
        focusedMagazine,
        magazine,
        isPortrait,
        dragOffset: targetOffsetRef.current,
        page,
        targetOffsetRef,
        currentMiddleMagazine,
        setMiddleMagazine,
        setPage
      });
    });

    // Calculate and update middle magazine if needed
    if (isPortrait && setMiddleMagazine && currentMiddleMagazine) {
      const middleMagazine = calculateMiddleMagazine(dragOffset, isPortrait);
      if (middleMagazine !== currentMiddleMagazine) {
        setMiddleMagazine(middleMagazine);
      }
    }
  });

  // Handle drag gestures
  const bind = useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedMagazine) return;
        event.stopPropagation();
        setIsDragging(true);
        dragStartRef.current = targetOffsetRef.current;
        velocityRef.current = 0;
      },
      onDrag: ({ event, movement: [dx, dy], velocity: [vx, vy], delta: [deltaX, deltaY], last }) => {
        if (focusedMagazine) return;
        event.stopPropagation();
        
        const totalMovement = Math.sqrt(dx * dx + dy * dy);
        
        if (totalMovement > 5) {
          const movement = isPortrait ? -dy * 0.01 : dx * 0.01;
          
          if (last) {
            setIsDragging(false);
            const spacing = isPortrait ? 2.5 : 2;
            
            // Calculate the nearest snap position
            const currentPosition = Math.round(dragStartRef.current / spacing);
            
            // Determine direction based on the total movement
            const deltaMovement = isPortrait ? -dy : dx;
            if (Math.abs(deltaMovement) > 20) { // Increased threshold for more deliberate movements
              const targetPosition = currentPosition + (deltaMovement > 0 ? 1 : -1);
              targetOffsetRef.current = targetPosition * spacing;
            } else {
              targetOffsetRef.current = currentPosition * spacing;
            }
          } else {
            // During drag, snap to the nearest position
            const newOffset = dragStartRef.current + movement;
            const spacing = isPortrait ? 2.5 : 2;
            targetOffsetRef.current = Math.round(newOffset / spacing) * spacing;
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
      [magazines.vague]: calculateFocusPosition({
        camera,
        focusedMagazine,
        magazine: magazines.vague,
        layoutPosition: null,
        isPortrait
      }),
      [magazines.smack]: calculateFocusPosition({
        camera,
        focusedMagazine,
        magazine: magazines.smack,
        layoutPosition: null,
        isPortrait
      }),
      [magazines.engineer]: calculateFocusPosition({
        camera,
        focusedMagazine,
        magazine: magazines.engineer,
        layoutPosition: null,
        isPortrait
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