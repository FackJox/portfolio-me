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
  focusedX = 0,
  focusedY = 0,
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

  // ------------------------------
  // R3F Hooks
  // ------------------------------
  const { camera, size } = useThree();

  useEffect(() => {
    console.log(`Magazine ${magazine} position:`, layoutPosition);
  }, [layoutPosition, magazine, camera.position]);

  // Change pointer if hovered & not focused
  useCursor(highlighted && focusedMagazine !== magazine);

  // Set initial right page view when focusing
  useEffect(() => {
    if (focusedMagazine === magazine) {
      setViewingRightPage(true);
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
    if (focusedMagazine && focusedMagazine !== magazine) return;

    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (totalMovement < 5) {
      // Tiny movement => treat as click to focus/unfocus
      e.stopPropagation();
      setFocusedMagazine((prev) => (prev === magazine ? null : magazine));
    } else {
      // Horizontal swipe => page turn or view shift
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (isPortrait) {
          if (deltaX > 50) {
            // Swipe right (going backward)
            if (viewingRightPage) {
              setViewingRightPage(false);
            } else {
              if (page > 0) {
                setPage(page - 1);
                setViewingRightPage(true);
              }
            }
          } else if (deltaX < -50) {
            // Swipe left (going forward)
            if (!viewingRightPage) {
              setViewingRightPage(true);
            } else {
              if (page < pages.length) {
                setPage(page + 1);
                setViewingRightPage(false);
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
  }, []);

  // ------------------------------
  // Focus/unfocus animation
  // ------------------------------
  useFrame(() => {
    if (!groupRef.current || !initialPositionRef.current) return;

    if (focusedMagazine === magazine) {
      const geometryWidth = 3;
      const zDist = 6;
      
      // Use hardcoded position for x and y
      const targetPos = new THREE.Vector3(focusedX, focusedY, zDist);

      if (isPortrait) {
        const horizontalOffset = viewingRightPage ? -geometryWidth / 4.75 : geometryWidth / 4.75;
        targetPos.x += horizontalOffset;
      } else {
        const targetOffset = delayedPage < 1 ? -geometryWidth / 4.75 : 0;
        setHorizontalOffsetTarget(targetOffset);
        horizontalOffsetRef.current = THREE.MathUtils.lerp(
          horizontalOffsetRef.current,
          horizontalOffsetTarget,
          0.1
        );
        targetPos.x += horizontalOffsetRef.current;
      }

      // Apply layout-specific offset
      if (layoutPosition) {
        const [offsetX, offsetY, offsetZ] = layoutPosition;
        const layoutOffset = new THREE.Vector3(-offsetX, -offsetY, -offsetZ);
        targetPos.add(layoutOffset);
      }

      // Lerp to target position
      groupRef.current.position.lerp(targetPos, 0.1);
      groupRef.current.quaternion.slerp(camera.quaternion, 0.1);
    } else {
      // Return to original position when unfocused
      groupRef.current.position.lerp(initialPositionRef.current, 0.1);
      groupRef.current.quaternion.slerp(initialQuaternionRef.current, 0.1);
    }
  });

  // ------------------------------
  // Float nullification
  // ------------------------------
  useFrame(() => {
    if (!floatRef.current || !floatNullifyRef.current) return;
    const floatGroup = floatRef.current;

    if (focusedMagazine === magazine) {
      floatNullifyRef.current.matrix.copy(floatGroup.matrix).invert();
      floatNullifyRef.current.matrixAutoUpdate = false;
    } else {
      floatNullifyRef.current.matrix.identity();
      floatNullifyRef.current.matrixAutoUpdate = true;
    }
  });

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <group ref={groupRef} {...props}>
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
          </group>
        </Float>
      </mesh>
    </group>
  );
};
