// portfolio-me/src/components/canvas/Magazines/Magazine.jsx
import { useAtom } from "jotai";
import { useEffect, useState, useRef, useMemo } from "react";
import { Page } from "./Page";
import { Float, useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";
import { styleMagazineAtom, magazineViewingStateAtom } from '@/helpers/atoms';
import { performLerp, handlePageViewTransition } from "@/helpers/positionHelper";

export const Magazine = ({
  pictures,
  magazine,
  pageAtom,
  focusedMagazineAtom,
  isPortrait,
  layoutPosition,
  Button,
  targetPosition,
  camera,
  ...props
}) => {

  
  // Atoms & State
  const [page, setPage] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const [focusedMagazine, setFocusedMagazine] = useAtom(focusedMagazineAtom);
  const [, setStyleMagazine] = useAtom(styleMagazineAtom);
  const [highlighted, setHighlighted] = useState(false);
  const [viewingRightPage, setViewingRightPage] = useAtom(magazineViewingStateAtom(magazine));


  // Refs
  const groupRef = useRef();
  const floatRef = useRef();
  const floatNullifyRef = useRef();

  // Initial transforms
  const initialPositionRef = useRef(null);
  const initialQuaternionRef = useRef(null);
  const previousViewingRightPageRef = useRef(false);

  // Add effect to open first page when focused in portrait mode
  useEffect(() => {
    if (focusedMagazine === magazine && isPortrait) {
      setPage(1);  // Set to 1 to open the first page
      setViewingRightPage(false);
    } else if (focusedMagazine !== magazine) {
      setPage(0);  // Close the magazine when unfocused
    }
  }, [focusedMagazine, magazine, isPortrait]);

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
  const handleSwipeOrClick = (deltaX, deltaY, e) => {
    if (focusedMagazine && focusedMagazine !== magazine) return;

    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const isMiddleMagazine = isPortrait 
      ? Math.abs(layoutPosition.y) < 0.3  // Check Y position in portrait
      : Math.abs(layoutPosition.x) < 0.3; // Check X position in landscape

    if (totalMovement < 5) {
      // Tiny movement => treat as click to focus/unfocus
      e.stopPropagation();
      
      // In landscape mode, allow focusing any magazine
      // In portrait mode, only allow focusing the middle magazine
      if (!isPortrait || isMiddleMagazine) {
        setFocusedMagazine((prev) => (prev === magazine ? null : magazine));
      }
    } else {
      // Horizontal swipe => page turn or view shift
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (isPortrait) {
          const { newPage, newViewingRightPage } = handlePageViewTransition({
            deltaX,
            isViewingRightPage: viewingRightPage,
            currentPage: page,
            maxPages: pages.length
          });
          
          setPage(newPage);
          setViewingRightPage(newViewingRightPage);
        } else {
          // Regular landscape mode behavior
          if (deltaX > 50) {
            setPage((p) => Math.max(p - 1, 0));
          } else if (deltaX < -50) {
            setPage((p) => Math.min(p + 1, pages.length));
          }
        }
      }
      // vertical swipes ignored
    }
  };

  const bind = useGesture(
    {
      onDrag: ({ last, movement: [dx, dy], event }) => {
        if (event.preventDefault) event.preventDefault();
        if (last) handleSwipeOrClick(dx, dy, event);
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
    if (!groupRef.current || !targetPosition) return;

    // If focused, lerp to camera-relative position
    if (focusedMagazine === magazine) {
      performLerp(groupRef.current.position, targetPosition, 0.1);
      groupRef.current.quaternion.slerp(camera.quaternion, 0.1);
    } 
    // If not focused, lerp to target position
    else {
      performLerp(groupRef.current.position, targetPosition, 0.1);
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

  // Render
  return (
    <group ref={groupRef} {...props}>
      {/* Transparent bounding box to detect pointer events */}
      <mesh
        geometry={new THREE.BoxGeometry(2.5, 1.5, 1)}
        material={new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        })}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHighlighted(true);
          setStyleMagazine(magazine);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHighlighted(false);
        }}
        {...bind()}
        pointerEvents={
          focusedMagazine && focusedMagazine !== magazine ? "none" : "auto"
        }
      >
        {/* Use Float; store its ref in floatRef */}
        <Float
          ref={floatRef}
          floatIntensity={0.5}
          speed={0.7}
          rotationIntensity={2}
          enabled={focusedMagazine !== magazine}
        >
          {/* This group will invert the Float transform if focused */}
          <group ref={floatNullifyRef}>
            {/* Finally, rotate pages -90deg and render them */}
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
            {/* Add Button below the magazine */}
            <group position={[0.65, -1.05, 0]}>
              <Button />
            </group>
          </group>
        </Float>
      </mesh>
    </group>
  );
};