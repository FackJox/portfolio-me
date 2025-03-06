/**
 * Global state atoms
 */

import { atom } from 'jotai';

// Loading state atoms
export const texturesLoadedAtom = atom(false);
export const hdrLoadedAtom = atom(false);

// Derived atom to check if all assets are loaded
export const allAssetsLoadedAtom = atom(
  (get) => get(texturesLoadedAtom) && get(hdrLoadedAtom)
);

// Scroll state atoms
export const scrollTopAtom = atom(0);
export const scrollState = atom({ top: 0 });

// Page counting atoms
export const totalPagesAtom = atom(2);
export const pagesAtom = atom(0);

// Contents visibility atom
export const contentsVisibleAtom = atom(false);

// Carousel state
export const carouselReadyAtom = atom(false);
export const titleSlidesAtom = atom([]); 