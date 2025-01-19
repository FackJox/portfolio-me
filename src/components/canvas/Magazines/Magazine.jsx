import { atom, useAtom } from "jotai";
import { useEffect, useState, useRef } from "react";
import { Page } from "./Page";
import { Float, useCursor, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";

export const Magazine = ({
  pictures,
  magazine,
  pageAtom,
  focusedMagazineAtom,
  isPortrait,
  layoutPosition,
  ...props
}) => {
  

  // ------------------------------
  // Atoms & State
  // ------------------------------
  const [page, setPage] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const [focusedMagazine, setFocusedMagazine] = useAtom(focusedMagazineAtom);
  const [highlighted, setHighlighted] = useState(false);
  const [viewingRightPage, setViewingRightPage] = useState(false);
  const [horizontalOffsetTarget, setHorizontalOffsetTarget] = useState(0);
  const horizontalOffsetRef = useRef(0);

  // ------------------------------
  // Refs
  // ------------------------------
  const groupRef = useRef();
  const floatRef = useRef();
  const floatNullifyRef = useRef();

  // For storing original transform:
  const initialPositionRef = useRef(null);
  const initialQuaternionRef = useRef(null);
  const initialCameraQuaternionRef = useRef(null);
  const previousViewingRightPageRef = useRef(false); // Store previous state

  // ------------------------------
  // R3F Hooks
  // ------------------------------
  const { camera, size } = useThree();

  // useEffect(() => {
  //   console.log(`Magazine ${magazine} position:`, layoutPosition);
  // }, [layoutPosition, magazine, camera.position]);


  // Change pointer if hovered & not focused
  useCursor(highlighted && focusedMagazine !== magazine);

  // Set initial right page view when focusing/unfocusing
  useEffect(() => {
    if (focusedMagazine === magazine) {
      // When focusing, set page to 1 if it's 0
      if (page === 0) {
        setPage(1);
        setViewingRightPage(false);
      } else {
        // Restore previous viewing state
        setViewingRightPage(previousViewingRightPageRef.current);
      }
    } else if (focusedMagazine !== magazine && previousViewingRightPageRef.current !== viewingRightPage) {
      // Store the current state when unfocusing
      previousViewingRightPageRef.current = viewingRightPage;
    }
  }, [focusedMagazine, magazine]);

  // ------------------------------
  // Pages setup
  // ------------------------------
  // Build pages array
  const pages = [
    { front: "01Front", back: pictures[0] },
  ];
  for (let i = 1; i < pictures.length - 1; i += 2) {
    pages.push({
      front: pictures[i % pictures.length],
      back: pictures[(i + 1) % pictures.length],
    });
  }
  // Last page
  pages.push({
    front: pictures[pictures.length - 1],
    back: "01Front",
  });


  // Preload textures
  pages.forEach((p) => {
    useTexture.preload(`/textures/${magazine}/${p.front}.png`);
    useTexture.preload(`/textures/${magazine}/${p.back}.png`);
    useTexture.preload(`/textures/book-cover-roughness.png`);
  });

  // ------------------------------
  // Audio effect on page change
  // ------------------------------
  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play();
  }, [page]);

  // ------------------------------
  // Gestures (swipe vs click)
  // ------------------------------
  const handleSwipeOrClick = (deltaX, deltaY, e) => {
    console.log("page", page)

    if (focusedMagazine && focusedMagazine !== magazine) return;

    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const isMiddleMagazine = isPortrait 
      ? Math.abs(layoutPosition[1]) < 0.3  // Check Y position in portrait
      : Math.abs(layoutPosition[0]) < 0.3; // Check X position in landscape

    if (totalMovement < 5) {
      // Tiny movement => treat as click to focus/unfocus
      e.stopPropagation();
      
      // Only allow focusing if this is the middle magazine
      if (isMiddleMagazine) {
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

  // ------------------------------
  // Delayed flip (one page at a time)
  // ------------------------------
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

  // ------------------------------
  // Store initial transforms
  // ------------------------------
  useEffect(() => {
    if (!groupRef.current) return;
    initialPositionRef.current = groupRef.current.position.clone();
    initialQuaternionRef.current = groupRef.current.quaternion.clone();
  }, [camera]);

  // Focus/unfocus animation
  useFrame(() => {
    if (!groupRef.current || !initialPositionRef.current) return;

    if (focusedMagazine === magazine) {
      const geometryWidth = 3;
      const zDist = 7.5;
      
      const newPos = new THREE.Vector3().copy(camera.position);
      const forward = new THREE.Vector3(-0.003, 0.0, -1)
        .applyQuaternion(camera.quaternion)
        .normalize();
      
      const portraitZoomFactor = isPortrait ? 0.52 : 0.4;
      newPos.addScaledVector(forward, zDist * portraitZoomFactor);

      const right = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(camera.quaternion)
        .normalize();

      if (isPortrait) {
        // Portrait mode offset
        const horizontalOffset = viewingRightPage ? -geometryWidth / 4.75 : geometryWidth / 4.75;
        newPos.addScaledVector(right, horizontalOffset);
      } else {
        // Landscape mode - smooth transition
        // Update target based on page
        const targetOffset = delayedPage < 1 ? -geometryWidth / 4.75 : 0;
        setHorizontalOffsetTarget(targetOffset);
        
        // Lerp the actual offset
        horizontalOffsetRef.current = THREE.MathUtils.lerp(
          horizontalOffsetRef.current,
          horizontalOffsetTarget,
          0.1
        );
        
        newPos.addScaledVector(right, horizontalOffsetRef.current);
      }

      // Apply layout-specific offset
      if (layoutPosition) {
        const [offsetX, offsetY, offsetZ] = layoutPosition;
        const layoutOffset = new THREE.Vector3(
          -offsetX,
          -offsetY,
          -offsetZ
        );
        newPos.add(layoutOffset);
      }

      // Use different lerp speeds for horizontal and other movements
      const currentPos = groupRef.current.position.clone();
      const horizontalLerpFactor = 0.03; // Slower horizontal movement
      const normalLerpFactor = 0.1; // Original speed for other movements

      // Separate horizontal and vertical movements for both portrait and landscape
      const horizontalDelta = new THREE.Vector3(
        newPos.x - currentPos.x,
        0,
        0
      );
      const otherDelta = new THREE.Vector3(
        0,
        newPos.y - currentPos.y,
        newPos.z - currentPos.z
      );

      // Apply different lerp speeds
      currentPos.add(horizontalDelta.multiplyScalar(horizontalLerpFactor));
      currentPos.add(otherDelta.multiplyScalar(normalLerpFactor));
      groupRef.current.position.copy(currentPos);

      // Quaternion lerp remains the same speed
      groupRef.current.quaternion.slerp(camera.quaternion, 0.1);
    } else {
      // Unfocused => back to original transform
      groupRef.current.position.lerp(initialPositionRef.current, 0.1);
      groupRef.current.quaternion.slerp(initialQuaternionRef.current, 0.1);
    }
  });

  // ------------------------------
  // Float nullification
  // ------------------------------
  useFrame(() => {
    if (!floatRef.current || !floatNullifyRef.current) return;

    // `floatRef.current` is a THREE.Group in your version of drei
    const floatGroup = floatRef.current;

    // If focused, invert the Float's transform
    if (focusedMagazine === magazine) {
      floatNullifyRef.current.matrix
        .copy(floatGroup.matrix)
        .invert();
      floatNullifyRef.current.matrixAutoUpdate = false;
    } else {
      // Not focused => identity matrix
      floatNullifyRef.current.matrix.identity();
      floatNullifyRef.current.matrixAutoUpdate = true;
    }
  });

  // ------------------------------
  // Render
  // ------------------------------
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
          </group>
        </Float>
      </mesh>
    </group>
  );
};