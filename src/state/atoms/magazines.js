/**
 * Magazine-specific state atoms
 */

import { atom } from 'jotai';

// Page state atoms
export const smackAtom = atom(0);
export const vagueAtom = atom(0);
export const engineerAtom = atom(0);

// Magazine focus atom
export const focusedMagazineAtom = atom(null);

// Style magazine atom (tracks which magazine is in the middle)
export const styleMagazineAtom = atom('vague'); // Default to vague on first render

// Magazine viewing states atom
export const magazineViewingStatesAtom = atom({
  vague: false,
  engineer: false,
  smack: false,
});

// Carousel movement atom
export const lastCarouselMoveAtom = atom({
  time: Date.now(),
  movement: 0,
});

// Carousel state atoms
export const carouselReadyAtom = atom(false);
export const carouselExitingAtom = atom(false);

/**
 * Derived atom to get/set viewing state for a specific magazine
 * @param {string} magazine - Magazine identifier ('vague', 'engineer', or 'smack')
 * @returns {Object} Atom that can get/set the viewing state for the specified magazine
 */
export const magazineViewingStateAtom = (magazine) =>
  atom(
    (get) => get(magazineViewingStatesAtom)[magazine],
    (get, set, newValue) => {
      const currentStates = get(magazineViewingStatesAtom);
      set(magazineViewingStatesAtom, {
        ...currentStates,
        [magazine]: newValue,
      });
    }
  ); 