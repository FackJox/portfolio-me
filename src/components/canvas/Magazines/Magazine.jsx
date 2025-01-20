// portfolio-me/src/components/canvas/Magazines/Magazine.jsx
import { useAtom } from "jotai";
import { useEffect, useState, useRef, useMemo } from "react";
import { Page } from "./Page";
import { Float, useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";
import { styleMagazineAtom } from '@/helpers/atoms';
import { performLerp } from "@/helpers/positionHelper"; // Import LERP helper

export const Magazine = ({
  pictures,
  magazine,
  pageAtom,
  focusedMagazineAtom,
  isPortrait,
  layoutPosition,
  Button,
  targetPosition, // Receive target position
  camera,
  ...props
}) => {
  
  // Atoms & State
  const [page, setPage] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const [focusedMagazine, setFocusedMagazine] = useAtom(focusedMagazineAtom);
  const [, setStyleMagazine] = useAtom(styleMagazineAtom);
  const [highlighted, setHighlighted] = useState(false);
  const [viewingRightPage, setViewingRightPage] = useState(false);
  const [horizontalOffsetTarget, setHorizontalOffsetTarget] = useState(0);
  const horizontalOffsetRef = useRef(0);

  // Refs
  const groupRef = useRef();
  const floatRef = useRef();
  const floatNullifyRef = useRef();

  // Initial transforms
  const initialPositionRef = useRef(null);
  const initialQuaternionRef = useRef(null);
  const previousViewingRightPageRef = useRef(false);

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
    audio.play();
  }, [page]);

  // Gestures (swipe vs click)
  const handleSwipeOrClick = (deltaX, deltaY, e) => {
    console.log("page", page)

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
          if (deltaX > 50) {
            // Swipe right (going backward)
            if (viewingRightPage) {
              // If on right page, shift focus to left page
              setViewingRightPage(false);
            } else {
              // If on left page and not at the start, turn page backward
              if (page > 0) {
                setPage(page - 1);
                setViewingRightPage(true); // Focus on right page after turning back
              }
            }
          } else if (deltaX < -50) {
            // Swipe left (going forward)
            if (!viewingRightPage) {
              // If on left page, shift focus to right page
              setViewingRightPage(true);
            } else {
              // If on right page and not at the end, turn page forward
              if (page < pages.length) {
                setPage(page + 1);
                setViewingRightPage(false); // Focus on left page after turning
              }
            }
          }
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

  // Store initial transforms
  useEffect(() => {
    if (!groupRef.current) return;
    initialPositionRef.current = groupRef.current.position.clone();
    initialQuaternionRef.current = groupRef.current.quaternion.clone();
  }, [camera]);

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

  // Lerp towards target position
  useFrame(() => {
    if (!groupRef.current || !targetPosition) return;

    // Lerp position
    performLerp(groupRef.current.position, targetPosition, 0.1);

    // Lerp quaternion if focused
    if (focusedMagazine === magazine) {
      groupRef.current.quaternion.slerp(camera.quaternion, 0.1);
    } else {
      // Unfocused - back to original transform
      if (initialPositionRef.current && initialQuaternionRef.current) {
        performLerp(groupRef.current.position, initialPositionRef.current, 0.1);
        groupRef.current.quaternion.slerp(initialQuaternionRef.current, 0.1);
      }
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