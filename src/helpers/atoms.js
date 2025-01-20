import { atom } from "jotai";

// Atoms for page states
export const smackAtom = atom(0);
export const vagueAtom = atom(0);
export const engineerAtom = atom(0);

// Atom to track the focused magazine
export const focusedMagazineAtom = atom(null);

// Atom to track which magazine is in the middle
export const styleMagazineAtom = atom("vague"); // Default to vague on first render