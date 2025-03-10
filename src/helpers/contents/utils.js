/**
 * Utility functions for Contents components
 */

// Import necessary constants and dependencies
import { SmackContents, EngineerContents, VagueContents } from '@/constants/contents/config'

/**
 * Gets the number of pages for a given title by searching through all content sources.
 *
 * @param {string} title - The title to search for (case-sensitive)
 * @returns {number} The number of pages for the matching title, or 0 if not found
 */
export const getPageCountForTitle = (title) => {
  const contentSources = [SmackContents, EngineerContents, VagueContents]

  for (const source of contentSources) {
    for (const contentItem of Object.values(source)) {
      if (contentItem.title === title) {
        return Object.keys(contentItem.pages).length
      }
    }
  }

  return 0
}

/**
 * Calculates cumulative page counts for an ordered array of titles.
 * Uses getPageCountForTitle to get individual counts and accumulates them.
 *
 * @param {string[]} titles - Ordered array of title strings to calculate cumulative counts for
 * @returns {number[]} Array of cumulative page counts
 */
export const getCumulativePageCounts = (titles) => {
  let sum = 0
  return titles.map((title) => {
    sum += getPageCountForTitle(title)
    return sum
  })
}

/**
 * Transforms the skills configuration into separate arrays for engineering and creative skills
 * @param {Object} skillsConfig - The skills configuration object
 * @returns {Array} Array containing all skills in the correct order for display
 */
export const transformSkillsConfig = (skillsConfig) => {
  console.log('transformSkillsConfig called with:', skillsConfig);
  
  const engineering = []
  const creative = []

  Object.entries(skillsConfig).forEach(([category, skillSet]) => {
    console.log(`Processing category: ${category}`, skillSet);
    
    const orderedSkills = Object.values(skillSet)
    console.log(`Ordered skills for ${category}:`, orderedSkills);
    
    orderedSkills.forEach((skill) => {
      if (skill && skill.title) {
        if (category === 'engineering') {
          engineering.push({ content: skill.title, isEngineering: true })
        } else {
          creative.push({ content: skill.title, isEngineering: false })
        }
      }
    })
  })

  console.log('Transformed skills:', {
    creative: creative.length,
    engineering: engineering.length,
    total: creative.length + engineering.length
  });
  
  // Return concatenated arrays to maintain column separation
  return [...creative, ...engineering]
}

/**
 * Finds a specific content item by title across all magazine content sources
 * @param {string} title - Title to search for
 * @returns {Object|null} Content item object if found, null otherwise
 */
export const findContentByTitle = (title) => {
  const contentSources = [SmackContents, EngineerContents, VagueContents]

  for (const source of contentSources) {
    for (const [key, contentItem] of Object.entries(source)) {
      if (contentItem.title === title) {
        return { ...contentItem, key }
      }
    }
  }

  return null
}

/**
 * Gets all titles from a specific magazine content source
 * @param {string} magazineName - Magazine name ('smack', 'engineer', 'vague')
 * @returns {string[]} Array of titles from the specified magazine
 */
export const getTitlesFromMagazine = (magazineName) => {
  let contentSource

  switch (magazineName) {
    case 'smack':
      contentSource = SmackContents
      break
    case 'engineer':
      contentSource = EngineerContents
      break
    case 'vague':
      contentSource = VagueContents
      break
    default:
      return []
  }

  return Object.values(contentSource).map(item => item.title)
}

/**
 * Gets all skills associated with a specific content title
 * @param {string} title - Content title to look up
 * @returns {Array} Array of skill objects
 */
export const getSkillsForTitle = (title) => {
  const content = findContentByTitle(title)
  return content ? content.skills || [] : []
}

/**
 * Checks if a content item has associated skills
 * @param {string} title - Content title to check
 * @returns {boolean} True if the content has skills
 */
export const hasSkills = (title) => {
  const skills = getSkillsForTitle(title)
  return skills.length > 0
}