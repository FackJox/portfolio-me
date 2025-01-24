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
import { calculateFocusPosition, updateMagazineCarousel, calculateMiddleMagazine, getSpacingConfig } from "@/helpers/positionHelper";
import { useDeviceOrientation } from '@/helpers/deviceHelper'

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
  const isPortrait = useDeviceOrientation();
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
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Set mounted immediately
    isMountedRef.current = true;
    
    // Initialize middle magazine if not set
    if (!currentMiddleMagazine) {
      setMiddleMagazine(magazines.vague);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [smackPage, setSmackPage] = useAtom(smackAtom);
  const [vaguePage, setVaguePage] = useAtom(vagueAtom);
  const [engineerPage, setEngineerPage] = useAtom(engineerAtom);
  
  // Calculate target positions for all magazines
  const targetPositions = useMemo(() => {
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

  // Render magazines as soon as we have positions
  if (!targetPositions || Object.keys(targetPositions).length === 0) {
    return null;
  }

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
      onDrag: ({ event, movement: [dx, dy], last }) => {
        if (focusedMagazine) return;
        event.stopPropagation();
        
        const config = getSpacingConfig(isPortrait);
        const totalMovement = Math.sqrt(dx * dx + dy * dy);
        
        if (totalMovement > config.dragThreshold) {
          const movement = isPortrait ? -dy * config.dragSensitivity : dx * config.dragSensitivity;
          
          if (last) {
            setIsDragging(false);
            
            // Calculate the nearest snap position
            const currentPosition = Math.round(dragStartRef.current / config.magazine);
            
            // Determine direction based on the total movement
            const deltaMovement = isPortrait ? -dy : dx;
            if (Math.abs(deltaMovement) > config.threshold) {
              const targetPosition = currentPosition + (deltaMovement > 0 ? 1 : -1);
              targetOffsetRef.current = targetPosition * config.magazine;
            } else {
              targetOffsetRef.current = currentPosition * config.magazine;
            }
          } else {
            // During drag, snap to the nearest position
            const newOffset = dragStartRef.current + movement;
            targetOffsetRef.current = Math.round(newOffset / config.magazine) * config.magazine;
          }
        } else if (last) {
          setIsDragging(false);
        }
      },
    },
    { drag: { filterTaps: true } }
  );

  return (
    <group {...props} ref={groupRef}>
      {/* Invisible plane for drag detection */}
      <mesh 
        position={[0, 0, 10]} 
        {...bind()}
      >
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={1} />
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