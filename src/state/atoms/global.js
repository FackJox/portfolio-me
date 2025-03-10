/**
 * Global state atoms
 */

import { atom } from 'jotai'

// Loading state atoms
export const texturesLoadedAtom = atom(false)
export const hdrLoadedAtom = atom(false)

// Derived atom to check if all assets are loaded
export const allAssetsLoadedAtom = atom(
  (get) => get(texturesLoadedAtom) && get(hdrLoadedAtom)
)

// Scroll state atoms
export const scrollTopAtom = atom(0)
export const scrollState = atom({ top: 0 })

// Global content visibility state
export const contentsVisibleAtom = atom(false)

// Flag to indicate when carousel is ready
export const carouselReadyAtom = atom(false)

// Last carousel movement tracking
export const lastCarouselMoveAtom = atom({
  time: Date.now(),
  movement: 0,
})

// Atom to track the focused magazine
export const focusedMagazineAtom = atom(null)

// Atom to track which magazine is in the middle (for styling)
export const styleMagazineAtom = atom('vague') // Default to vague on first render