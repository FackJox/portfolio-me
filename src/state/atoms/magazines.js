/**
 * Magazine-specific state atoms
 */

import { atom } from 'jotai'

// Page state atoms for individual magazines
export const smackAtom = atom(0)
export const vagueAtom = atom(0)
export const engineerAtom = atom(0)

// Magazine focus atom to track which magazine is currently focused
export const focusedMagazineAtom = atom(null)

// Style magazine atom for UI styling based on current magazine
export const styleMagazineAtom = atom('vague') // Default to vague on first render

// Magazine viewing states atom (whether viewing left or right page)
export const magazineViewingStatesAtom = atom({
  vague: false,
  engineer: false,
  smack: false,
})

// Carousel interaction tracking
export const lastCarouselMoveAtom = atom({
  time: Date.now(),
  movement: 0,
})

// Flag to indicate when carousel is ready for interaction
export const carouselReadyAtom = atom(false)

// Derived atom to get/set viewing state for a specific magazine
export const magazineViewingStateAtom = (magazine) =>
  atom(
    (get) => get(magazineViewingStatesAtom)[magazine],
    (get, set, newValue) => {
      const currentStates = get(magazineViewingStatesAtom)
      set(magazineViewingStatesAtom, {
        ...currentStates,
        [magazine]: newValue,
      })
    }
  )

// Derived atom to get the current page for a specific magazine
export const magazinePageAtom = (magazine) => {
  switch (magazine) {
    case 'smack':
      return smackAtom
    case 'vague':
      return vagueAtom
    case 'engineer':
      return engineerAtom
    default:
      return atom(0)
  }
}

// Derived atom to check if any magazine is focused
export const anyMagazineFocusedAtom = atom(
  (get) => get(focusedMagazineAtom) !== null
)

// Derived atom to check if a specific magazine is focused
export const isMagazineFocusedAtom = (magazine) =>
  atom(
    (get) => get(focusedMagazineAtom) === magazine
  )

// Atom to track drag state for carousel
export const isDraggingAtom = atom(false)

// Atom to track carousel offset position
export const carouselOffsetAtom = atom(0)