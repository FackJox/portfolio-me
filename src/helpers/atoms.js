import { atom } from 'jotai'

// Atoms for page states
export const smackAtom = atom(0)
export const vagueAtom = atom(0)
export const engineerAtom = atom(0)

// Atom to track the focused magazine
export const focusedMagazineAtom = atom(null)

// Atom to track which magazine is in the middle
export const styleMagazineAtom = atom('vague') // Default to vague on first render

// Atoms to track viewing state (left/right page) for each magazine
export const magazineViewingStatesAtom = atom({
  vague: false,
  engineer: false,
  smack: false,
})

// Atom to track carousel movement
export const lastCarouselMoveAtom = atom({
  time: Date.now(),
  movement: 0,
})

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
    },
  )

// Atoms for loading states
export const texturesLoadedAtom = atom(false)
export const hdrLoadedAtom = atom(false)

// Derived atom to check if all assets are loaded
export const allAssetsLoadedAtom = atom((get) => get(texturesLoadedAtom) && get(hdrLoadedAtom))

// Atom to manage WordCloud visibility
export const wordCloudVisibleAtom = atom(false)

export const scrollTopAtom = atom(0)
export const totalPagesAtom = atom(2)
export const pagesAtom = atom(0)

// Shared scroll state object
export const scrollState = {
  top: 0,
}
