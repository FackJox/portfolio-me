/**
 * Utility functions for Contents components
 */

// Import necessary constants and dependencies
import { SmackContents, EngineerContents, VagueContents } from '@/constants/contents/config';

/**
 * Gets the number of pages for a given title by searching through all content sources.
 * @param {string} title - The title to search for (case-sensitive)
 * @returns {number} The number of pages for the matching title, or 0 if not found
 */
export const getPageCountForTitle = (title) => {
  const contentSources = [SmackContents, EngineerContents, VagueContents];

  for (const source of contentSources) {
    for (const contentItem of Object.values(source)) {
      if (contentItem.title === title) {
        return Object.keys(contentItem.pages).length;
      }
    }
  }

  return 0;
};

/**
 * Calculates cumulative page counts for an ordered array of titles.
 * Uses getPageCountForTitle to get individual counts and accumulates them.
 * @param {Array<string>} titles - Ordered array of title strings to calculate cumulative counts for
 * @returns {Array<number>} Array of cumulative page counts
 */
export const getCumulativePageCounts = (titles) => {
  let sum = 0;
  return titles.map((title) => {
    sum += getPageCountForTitle(title);
    return sum;
  });
};

/**
 * Gets content data for a specific title
 * @param {string} title - Title to search for
 * @returns {Object|null} Content data object or null if not found
 */
export const getContentByTitle = (title) => {
  const contentSources = [SmackContents, EngineerContents, VagueContents];

  for (const source of contentSources) {
    for (const contentItem of Object.values(source)) {
      if (contentItem.title === title) {
        return contentItem;
      }
    }
  }

  return null;
};

/**
 * Gets magazine type for a content title
 * @param {string} title - Content title to look up
 * @returns {string|null} Magazine type ('smack', 'engineer', 'vague') or null if not found
 */
export const getMagazineTypeForTitle = (title) => {
  const content = getContentByTitle(title);
  return content ? content.magazine : null;
};

/**
 * Returns all content titles in a single array
 * @returns {Array<string>} Array of all content titles
 */
export const getAllContentTitles = () => {
  const contentSources = [SmackContents, EngineerContents, VagueContents];
  const titles = [];

  contentSources.forEach(source => {
    Object.values(source).forEach(contentItem => {
      titles.push(contentItem.title);
    });
  });

  return titles;
};

/**
 * Transforms the skills configuration into separate arrays for engineering and creative skills
 * @param {Object} skillsConfig - The skills configuration object
 * @returns {Array} Array containing all skills in the correct order for display
 */
export const transformSkillsConfig = (skillsConfig) => {
  const engineering = [];
  const creative = [];

  Object.entries(skillsConfig).forEach(([category, skillSet]) => {
    const orderedSkills = Object.values(skillSet);
    orderedSkills.forEach((skill) => {
      if (category === 'engineering') {
        engineering.push({ content: skill.title, isEngineering: true });
      } else {
        creative.push({ content: skill.title, isEngineering: false });
      }
    });
  });

  // Return concatenated arrays to maintain column separation
  return [...creative, ...engineering];
}; 