// portfolio-me/src/components/canvas/Magazines/Magazine.jsx
import { useAtom } from "jotai";
import { useEffect, useState, useRef, useMemo } from "react";
import { Page } from "./Page";
import { Float, useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";
import { styleMagazineAtom, magazineViewingStateAtom } from '@/helpers/atoms';
import { performLerp, handlePageViewTransition, updateMagazineCarousel, calculatePageViewOffset, getFloatConfig, getButtonPosition, isMiddleMagazine, hoverMagazine } from "@/helpers/positionHelper";
import { useDeviceOrientation } from '@/helpers/deviceHelper'
import { handleMagazineInteraction, isTapInteraction } from "@/helpers/gestureHelper";

export const Magazine = ({
  pictures,
  magazine,
  pageAtom,
  focusedMagazineAtom,
  layoutPosition,
  Button,
  targetPosition,
  camera,
  lastCarouselMove,
  ...props
}) => {
  const isPortrait = useDeviceOrientation();
  
  // Atoms & State
  const [page, setPage] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const [focusedMagazine, setFocusedMagazine] = useAtom(focusedMagazineAtom);
  const [, setStyleMagazine] = useAtom(styleMagazineAtom);
  const [highlighted, setHighlighted] = useState(false);
  const viewingStateAtom = useMemo(() => magazineViewingStateAtom(magazine), [magazine]);
  const [viewingRightPage, setViewingRightPage] = useAtom(viewingStateAtom);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTimeRef = useRef(0);
  const dragStartRef = useRef(0);
  const velocityRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const lastMovementTimeRef = useRef(0);
  const lastMovementAmountRef = useRef(0);
  const isHoveredRef = useRef(false);
    const [currentMiddleMagazine] = useAtom(styleMagazineAtom);


  // Refs
  const groupRef = useRef();
  const floatRef = useRef();
  const floatNullifyRef = useRef();
  const lastPageRef = useRef(1);  // Store last viewed page
  const lastViewingStateRef = useRef(false);  // Store last viewing state

  // Initial transforms
  const initialPositionRef = useRef(null);
  const initialQuaternionRef = useRef(null);
  const previousViewingRightPageRef = useRef(false);

  // Focus/unfocus logic
  useEffect(() => {
    if (focusedMagazine === magazine) {
      console.log('[Magazine] Magazine focused', { magazine, page, lastPage: lastPageRef.current });
      // When focusing, check if we should restore state
      if (page === 0) {
        setPage(lastPageRef.current);
        setViewingRightPage(lastViewingStateRef.current);
      }
      // Update style magazine when focused
      setStyleMagazine(magazine);
    } else if (focusedMagazine !== magazine && page > 0) {
      console.log('[Magazine] Magazine unfocused', { magazine, page, lastPage: lastPageRef.current });
      // Only store state if we're not already closing (page !== 0)
      // and we haven't already stored a state (lastPageRef.current === 1)
      if (page !== 0 && lastPageRef.current === 1) {
        lastPageRef.current = page;
        lastViewingStateRef.current = viewingRightPage;
      }
      // Set initial page when unfocused
      setPage(0);
      setViewingRightPage(false);
    }
  }, [focusedMagazine, magazine]);

  // Only update stored state when explicitly changing pages
  useEffect(() => {
    if (focusedMagazine === magazine && page > 0) {
      lastPageRef.current = page;
      lastViewingStateRef.current = viewingRightPage;
    }
  }, [page, viewingRightPage, focusedMagazine]);

  // useCursor
  useCursor(highlighted && focusedMagazine !== magazine);

  // Pages setup and texture preloads
  const pages = useMemo(() => {
    const pagesArray = [
      { front: "01Front", back: pictures[0] },
    ];
    for (let i = 1; i < pictures.length - 1; i += 2) {
      pagesArray.push({
        front: pictures[i % pictures.length],
        back: pictures[(i + 1) % pictures.length],
      });
    }
    pagesArray.push({
      front: pictures[pictures.length - 1],
      back: "01Front",
    });
    return pagesArray;
  }, [pictures]);

  useEffect(() => {
    pages.forEach((p) => {
      useTexture.preload(`/textures/${magazine}/${p.front}.png`);
      useTexture.preload(`/textures/${magazine}/${p.back}.png`);
      useTexture.preload(`/textures/book-cover-roughness.png`);
    });
  }, [pages, magazine]);

  // Audio effect on page change
  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    // audio.play();
  }, [page]);

  // Gestures (swipe vs click)
  const bind = useGesture(
    {
      onDragStart: ({ event }) => {
        // Check if magazine is clickable first
        if (isPortrait && currentMiddleMagazine !== magazine) {
          console.log('[Magazine] Drag ignored - not middle magazine in portrait', { magazine, currentMiddleMagazine });
          return;
        }
        if (focusedMagazine && focusedMagazine !== magazine) {
          console.log('[Magazine] Drag ignored - different magazine focused', { magazine, focusedMagazine });
          return;
        }
        
        event.stopPropagation();
        setIsDragging(true);
        dragStartTimeRef.current = Date.now();
        console.log('[Magazine] Drag started', { magazine, time: dragStartTimeRef.current });
      },
      onDrag: ({ last, movement: [dx, dy], event }) => {
        // Check if magazine is clickable first
        if (isPortrait && currentMiddleMagazine !== magazine) {
          return;
        }
        
        if (focusedMagazine && focusedMagazine !== magazine) {
          return;
        }

        if (event.preventDefault) event.preventDefault();
        
        if (last) {
          const dragDuration = Date.now() - dragStartTimeRef.current;
          const totalMovement = Math.sqrt(dx * dx + dy * dy);
          
          console.log('[Magazine] Drag ended', { 
            magazine,
            dragDuration,
            totalMovement,
            dx,
            dy,
            isTap: isTapInteraction({ duration: dragDuration, totalMovement, isPortrait })
          });

          handleMagazineInteraction({
            deltaX: dx,
            deltaY: dy,
            isDrag: totalMovement > 5,
            magazine,
            focusedMagazine,
            setFocusedMagazine,
            page,
            pages,
            setPage,
            setViewingRightPage,
            viewingRightPage,
            isPortrait,
            currentMiddleMagazine,
            lastPageRef,
            lastViewingStateRef,
            lastCarouselMove,
            dragDuration,
            totalMovement
          });
          
          setIsDragging(false);
        }
      },
    },
    { eventOptions: { passive: false } }
  );

  // Delayed flip logic
  useEffect(() => {
    let timeout;
    const animatePageFlip = () => {
      setDelayedPage((current) => {
        if (current === page) return current;
        // Flip exactly 1 page at a time every 150ms
        timeout = setTimeout(animatePageFlip, 150);
        return current < page ? current + 1 : current - 1;
      });
    };
    animatePageFlip();
    return () => clearTimeout(timeout);
  }, [page]);

  // Set initial position on mount
  useEffect(() => {
    if (!groupRef.current || !targetPosition) return;
    // Set initial position directly
    groupRef.current.position.copy(targetPosition);
    initialPositionRef.current = targetPosition.clone();
    initialQuaternionRef.current = groupRef.current.quaternion.clone();
  }, []); // Empty deps array to only run on mount

  // Store initial transforms when target changes
  useEffect(() => {
    if (!groupRef.current || !targetPosition) return;
    initialPositionRef.current = targetPosition.clone();
    initialQuaternionRef.current = groupRef.current.quaternion.clone();
  }, [targetPosition]);

  // Lerp towards target position
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Calculate horizontal offset if focused
    if (focusedMagazine === magazine) {
      const right = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(camera.quaternion)
        .normalize();

      // If magazine is closing (transitioning from any page to 0), offset to center and unfocus
      if (page === 0) {
        const centerOffset = isPortrait ? 0.65 : -0.65;
        groupRef.current.position.addScaledVector(right, centerOffset * delta * 5);
        // Unfocus the magazine after it's closed
        setFocusedMagazine(null);
      } else {
        calculatePageViewOffset({
          position: groupRef.current.position,
          right,
          currentOffset: previousViewingRightPageRef.current ? 1.5 : -1.5,
          targetOffset: viewingRightPage ? 1.5 : -1.5,
          isPortrait,
          viewingRightPage,
          page,
          delayedPage,
          lerpFactor: 0.03
        });
      }

      previousViewingRightPageRef.current = viewingRightPage;
    }

    // Apply hover effect
    if (!isPortrait && !focusedMagazine) {
      hoverMagazine({
        position: groupRef.current.position,
        isHovered: isHoveredRef.current,
        magazine,
        isPortrait
      });
    }
  });

  // Float nullification
  useFrame(() => {
    if (!floatRef.current || !floatNullifyRef.current) return;

    const floatGroup = floatRef.current;

    if (focusedMagazine === magazine) {
      floatNullifyRef.current.matrix
        .copy(floatGroup.matrix)
        .invert();
      floatNullifyRef.current.matrixAutoUpdate = false;
    } else {
      floatNullifyRef.current.matrix.identity();
      floatNullifyRef.current.matrixAutoUpdate = true;
    }
  });

  return (
    <group ref={groupRef} userData={{ magazine }}>
      {/* Invisible bounding box for interaction */}
      <mesh
        position={[page === 0 ? 0.65 : 0, 0, 0]}
        geometry={new THREE.BoxGeometry(
          page === 0 ? 1.25 : 2.5, // Width: smaller when closed
          page === 0 ? 1.5 : 1.5, // Height: smaller when closed
          page === 0 ? 1 : 1 // Depth: smaller when closed
        )}
        material={new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        })}
       onPointerEnter={(e) => {
          e.stopPropagation();
          // Only set highlighted and isHovered if this magazine is clickable
          if (!isPortrait || (isPortrait && currentMiddleMagazine === magazine)) {
            setHighlighted(true);
            isHoveredRef.current = true;
            // Only set style magazine in landscape mode
            if (!isPortrait) {
              setStyleMagazine(magazine);
            }
          }
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          if (!isPortrait || (isPortrait && currentMiddleMagazine === magazine)) {
            setHighlighted(false);
            isHoveredRef.current = false;
          }
        }}
        {...bind()}
        pointerEvents={
          (focusedMagazine && focusedMagazine !== magazine) || 
          (isPortrait && currentMiddleMagazine !== magazine)
            ? "none" 
            : "auto"
        }
      />
      
      {/* Magazine content */}
      <Float
        ref={floatRef}
        {...getFloatConfig(isPortrait)}
        enabled={focusedMagazine !== magazine}
      >
        <group ref={floatNullifyRef}>
          <group rotation={[0, -Math.PI / 2, 0]}>
            {pages.map((pageData, idx) => (
              <Page
                key={idx}
                page={delayedPage}
                number={idx}
                magazine={magazine}
                opened={delayedPage > idx}
                magazineClosed={delayedPage === 0 || delayedPage === pages.length}
                pages={pages}
                setPage={setPage}
                highlighted={highlighted}
                isFocused={focusedMagazine === magazine}
                {...pageData}
              />
            ))}
          </group>
          {!isPortrait && (
            <group position={[getButtonPosition(isPortrait).x, getButtonPosition(isPortrait).y, getButtonPosition(isPortrait).z]}>
              <Button />
            </group>
          )}
        </group>
      </Float>
    </group>
  );
};