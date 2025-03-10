/**
 * Contents-specific state atoms
 */

import { atom } from 'jotai'

// Contents visibility atom
export const contentsVisibleAtom = atom(false)

// Contents navigation atoms
export const totalPagesAtom = atom(2)
export const pagesAtom = atom(0)

// Title slides atom for contents navigation
export const titleSlidesAtom = atom([])

// Derived atom to compute the current page index
export const currentPageIndexAtom = atom(
  (get) => Math.min(get(pagesAtom), get(totalPagesAtom) - 1)
)

// Atom to track if contents are being displayed
export const isShowingContentsAtom = atom(
  (get) => get(contentsVisibleAtom) && get(pagesAtom) > 0
)

// Atoms for selected content
export const selectedContentAtom = atom(null)
export const contentSelectionActiveAtom = atom(false)