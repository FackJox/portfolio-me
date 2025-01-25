import { useGesture } from "@use-gesture/react";

const useMagazineGestures = ({
  isPortrait,
  magazine,
  currentMiddleMagazine,
  focusedMagazine,
  setFocusedMagazine,
  page,
  pages,
  setPage,
  setViewingRightPage,
  viewingRightPage,
  layoutPosition,
  dragStartTimeRef,
  setIsDragging,
  handleInteraction,
}) => {
  const bind = useGesture(
    {
      onDragStart: ({ event }) => {
        // Check if magazine is clickable first
        if (isPortrait && currentMiddleMagazine !== magazine) {
          return;
        }
        if (focusedMagazine && focusedMagazine !== magazine) {
          return;
        }

        event.stopPropagation();
        setIsDragging(true);
        dragStartTimeRef.current = Date.now();
      },
      onDrag: ({ last, movement: [dx, dy], event, tap, distance }) => {
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
          
          // In portrait mode, be more lenient with what counts as a tap
          const isTap = isPortrait ? 
            (dragDuration < 200 && totalMovement < 20) : 
            (dragDuration < 150 && totalMovement < 10);
            
          handleInteraction({
            deltaX: dx,
            deltaY: dy,
            isDrag: !isTap,
            magazine,
            focusedMagazine,
            setFocusedMagazine,
            page,
            pages,
            setPage,
            setViewingRightPage,
            viewingRightPage,
            isPortrait,
            layoutPosition: {
              currentMiddleMagazine // Pass the correct layout position structure
            }
          });
          
          setIsDragging(false);
        }
      },
    },
    { eventOptions: { passive: false } }
  );

  return bind;
};

export default useMagazineGestures; 