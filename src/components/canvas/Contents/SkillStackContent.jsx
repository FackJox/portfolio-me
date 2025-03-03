import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useSetAtom, useAtom } from 'jotai'
import { styleMagazineAtom, titleSlidesAtom } from '@/helpers/atoms'
import { carouselExitingAtom } from '@/components/dom/DescriptionCarousel'
import { skills, transformSkillsConfig, SmackContents, EngineerContents } from '@/helpers/contentsConfig'
import { getTexturePath } from '@/helpers/textureLoaders'
import { PageCarousel } from '@/components/canvas/PageCarousel/PageCarousel'
import { LAYOUT } from './Constants'
import SkillStack from './SkillStack'

/**
 * SkillStackContent component manages the skill stack and associated carousel
 */
export default function SkillStackContent() {
  const skillsContent = useMemo(() => transformSkillsConfig(skills), [])
  const [carouselPages, setCarouselPages] = useState(null)
  const [carouselType, setCarouselType] = useState(null)
  const [currentSkill, setCurrentSkill] = useState(null)
  const [isExitingCarousel, setIsExitingCarousel] = useState(false)
  const setStyleMagazine = useSetAtom(styleMagazineAtom)
  const setTitles = useSetAtom(titleSlidesAtom)
  const [isCarouselExiting, setIsCarouselExiting] = useAtom(carouselExitingAtom)
  const skillStackRef = useRef(null)

  // Function to reset all carousel-related state
  const resetCarouselState = useCallback(() => {
    setCarouselPages(null)
    setCarouselType(null)
    setTitles([])
    setIsExitingCarousel(false)
    setIsCarouselExiting(false)
  }, [setTitles, setIsCarouselExiting])

  /**
   * Find content sections relevant to the clicked skill
   */
  const findRelevantContent = useCallback((clickedSkill) => {
    // Search through SmackContents and EngineerContents
    const searchContents = (contents, type) => {
      const relevantSections = []
      for (const [key, section] of Object.entries(contents)) {
        if (section.skills && section.skills.length > 0) {
          const hasSkill = section.skills.some((skill) => skill && skill.title === clickedSkill)
          if (hasSkill) {
            relevantSections.push({
              ...section,
              type: section.magazine || type, // Use section.magazine if available, fallback to type
            })
          }
        }
      }
      return relevantSections
    }

    // Search in both content types
    const smackSections = searchContents(SmackContents, 'smack')
    const engineerSections = searchContents(EngineerContents, 'engineer')

    // Combine and return all relevant sections
    return [...smackSections, ...engineerSections]
  }, [])

  /**
   * Handle skill click events
   */
  const handleSkillClick = useCallback(
    (content) => {
      if (!content) {
        // If we have a current skill, trigger the exit animation
        if (currentSkill && skillStackRef.current) {
          // Immediately clear the titles to hide DescriptionCarousel
          setTitles([])
          // Still trigger the exit animation for PageCarousel
          setIsExitingCarousel(true)
          setIsCarouselExiting(false) // Don't set this for SkillText clicks
        } else {
          // Only reset if there's no current skill
          resetCarouselState()
        }
        return
      }

      // If clicking the same skill that's already expanded, start exit animation
      if (content === currentSkill) {
        // Immediately clear the titles to hide DescriptionCarousel
        setTitles([])
        // Still trigger the exit animation for PageCarousel
        setIsExitingCarousel(true)
        setIsCarouselExiting(false) // Don't set this for SkillText clicks
        return
      }

      // Only proceed with setting up a new carousel if we're not in an exit animation
      if (!isExitingCarousel && !isCarouselExiting) {
        // Store the clicked skill
        setCurrentSkill(content)

        const relevantSections = findRelevantContent(content)
        if (relevantSections.length > 0) {
          // Get all titles and descriptions from relevant sections
          const sectionItems = relevantSections.map((section) => ({
            title: section.title,
            description: section.description || 'No description available.',
            magazine: section.magazine || section.type, // Include magazine information
          }))
          setTitles(sectionItems)

          // Collect all pages from all relevant sections
          const allPages = relevantSections.reduce((acc, section) => {
            // Get pages in order based on pageIndex
            const orderedPages = Object.values(section.pages)
              .sort((a, b) => a.pageIndex - b.pageIndex)
              .map((page) => getTexturePath(section.magazine, page.image))
            return [...acc, ...orderedPages]
          }, [])

          // Use the first section's type for the magazine style
          const firstSection = relevantSections[0]
          setCarouselType(firstSection.magazine)
          setCarouselPages(allPages)
          setStyleMagazine(firstSection.magazine)
        } else {
          resetCarouselState()
        }
      }
    },
    [findRelevantContent, setStyleMagazine, setTitles, currentSkill, resetCarouselState, setIsCarouselExiting, isExitingCarousel, isCarouselExiting],
  )

  /**
   * Handle carousel animation finish
   */
  const handleCarouselFinish = useCallback(() => {
    // This function is called when the PageCarousel animation finishes
    // (either entrance or exit animation)
    
    // If we were in an exit animation, reset everything
    if (isExitingCarousel || isCarouselExiting) {
      if (currentSkill && skillStackRef.current) {
        const skillToReset = currentSkill
        setCurrentSkill(null)
        resetCarouselState()
        // Trigger stack animation through the ref
        skillStackRef.current.triggerStackAnimation()
      } else {
        resetCarouselState()
      }
    }
    // Otherwise, do nothing - we've just finished the entrance animation
  }, [currentSkill, resetCarouselState, isExitingCarousel, isCarouselExiting])

  // Cleanup effect for carousel state
  useEffect(() => {
    return () => {
      resetCarouselState()
    }
  }, [resetCarouselState])

  return (
    <>
      <SkillStack skills={skillsContent} onSkillClick={handleSkillClick} ref={skillStackRef} />
      {carouselPages && (
        <group position={[0, 0, LAYOUT.POSITION.CAROUSEL]}>
          <PageCarousel images={carouselPages} onFinish={handleCarouselFinish} isExiting={isExitingCarousel} />
        </group>
      )}
    </>
  )
} 