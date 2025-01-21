// portfolio-me/src/components/canvas/Magazines/Magazine.jsx
import { useAtom } from "jotai";
import { useEffect, useState, useRef, useMemo } from "react";
import { Page } from "./Page";
import { Float, useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";
import { styleMagazineAtom, magazineViewingStateAtom } from '@/helpers/atoms';
import { performLerp, handlePageViewTransition, updateMagazineCarousel, calculatePageViewOffset } from "@/helpers/positionHelper";

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
  const lastPageRef = useRef(1);  // Store last viewed page
  const lastViewingStateRef = useRef(false);  // Store last viewing state

  // Initial transforms
  const initialPositionRef = useRef(null);
  const initialQuaternionRef = useRef(null);
  const previousViewingRightPageRef = useRef(false);

  // Focus/unfocus logic
  useEffect(() => {
    if (focusedMagazine === magazine) {
      // When focusing, check if we should restore state
      if (page === 0) {
        setPage(lastPageRef.current);
        setViewingRightPage(lastViewingStateRef.current);
      }
    } else if (focusedMagazine !== magazine) {
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
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe => page turn or view shift
      // Check if we're about to close from the last page
      if (page === pages.length - 1 && deltaX < -50) {
        lastPageRef.current = page;
        lastViewingStateRef.current = viewingRightPage;
      }

      if (isPortrait) {
        const result = handlePageViewTransition({
          deltaX,
          isViewingRightPage: viewingRightPage,
          currentPage: page,
          maxPages: pages.length
        });
        
        setPage(result.newPage);
        setViewingRightPage(result.newViewingRightPage);
      } else {
        // Regular landscape mode behavior with last page swipe handling
        if (deltaX > 50) {
          setPage((p) => Math.max(p - 1, 0));
        } else if (deltaX < -50) {
          if (page === pages.length - 1) {
            // Last page swipe left behavior
            setPage(0); // Close the magazine
            setFocusedMagazine(null); // Unfocus
          } else {
            setPage((p) => Math.min(p + 1, pages.length - 1));
          }
        }
      }
    }
    // vertical swipes ignored
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
        pointerEvents={focusedMagazine && focusedMagazine !== magazine ? "none" : "auto"}
      >
        <Float
          ref={floatRef}
          floatIntensity={0.5}
          speed={0.7}
          rotationIntensity={2}
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
            <group position={[0.65, -1.05, 0]}>
              <Button />
            </group>
          </group>
        </Float>
      </mesh>
    </group>
  );
};