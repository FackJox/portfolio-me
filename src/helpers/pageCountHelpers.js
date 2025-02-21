import { SmackContents, EngineerContents, VagueContents } from './contentsConfig'

/**
 * Returns the page count for a given title by searching through all magazine contents
 * @param {string} title - The title to search for
 * @returns {number} The number of pages for the title, or 0 if not found
 */
export const getPageCountForTitle = (title) => {
  // Search through each content source
  const contentSources = [SmackContents, EngineerContents, VagueContents]

  for (const contentSource of contentSources) {
    // Find the section with matching title
    const section = Object.values(contentSource).find((section) => section.title === title)

    // If found, return the number of pages
    if (section && section.pages) {
      return Object.keys(section.pages).length
    }
  }

  // Return 0 if title not found
  return 0
}
