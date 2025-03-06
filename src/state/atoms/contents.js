/**
 * Contents-specific state atoms
 */

import { atom } from 'jotai';

// Contents visibility atom
export const contentsVisibleAtom = atom(false);

// Contents navigation atoms
export const scrollTopAtom = atom(0);
export const totalPagesAtom = atom(2);
export const pagesAtom = atom(0);

// Carousel state atoms
export const carouselReadyAtom = atom(false);
export const titleSlidesAtom = atom([]);

// Scroll state for content scrolling
export const scrollState = atom({ top: 0 }); 