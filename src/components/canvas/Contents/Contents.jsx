import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useSetAtom, useAtom } from 'jotai'
import { styleMagazineAtom } from '@/state/atoms/global'
import { titleSlidesAtom } from '@/state/atoms/contents'
import { carouselExitingAtom } from '@/components/dom/DescriptionCarousel'
import { skills, SmackContents, EngineerContents } from '@/constants/contents/config'
import { transformSkillsConfig } from '@/helpers/contents/utils'
import { getTexturePath } from '@/helpers/global/texture'
import { PageCarousel } from '@/components/canvas/PageCarousel/PageCarousel'
import { LAYOUT } from '@/constants/contents/layout'
import SkillStacks from './SkillStacks'
import ExperienceQueryParamHandler from '@/components/ExperienceQueryParamHandler'

/**
 * SkillStackContent component manages the skill stack and associated carousel
 */
export default function Contents() {
    const skillsContent = useMemo(() => transformSkillsConfig(skills), [])
    const [carouselPages, setCarouselPages] = useState(null)
    const [carouselType, setCarouselType] = useState(null)
    const [currentSkill, setCurrentSkill] = useState(null)
    const [isExitingCarousel, setIsExitingCarousel] = useState(false)
    const setStyleMagazine = useSetAtom(styleMagazineAtom)
    const setTitles = useSetAtom(titleSlidesAtom)
    const [isCarouselExiting, setIsCarouselExiting] = useAtom(carouselExitingAtom)
    const skillStackRef = useRef(null)

    // Debug useEffect to log position and rendering of Contents component
    useEffect(() => {
        console.log('[Contents] Component mounted');
        console.log('[Contents] skillsContent:', skillsContent);

        // Check if we're in a WebGL context
        try {
            const canvas = document.querySelector('canvas');
            console.log('[Contents] Canvas element found:', !!canvas);
            if (canvas) {
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                console.log('[Contents] WebGL context available:', !!gl);
            }
        } catch (err) {
            console.error('[Contents] Error checking WebGL context:', err);
        }

        return () => {
            console.log('[Contents] Component unmounted');
        };
    }, [skillsContent]);

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
     * @param {string} clickedSkill - The skill to find content for
     * @returns {Array} Array of relevant sections
     */
    const findRelevantContent = useCallback((clickedSkill) => {
        if (!clickedSkill) return []

        const searchContents = (contents, type) => {
            return Object.entries(contents)
                .filter(([_, section]) => section.skills?.length > 0)
                .reduce((relevantSections, [_, section]) => {
                    const hasMatch = section.skills.some(skill => {
                        if (!skill?.title) return false

                        // Check for exact or partial match
                        const skillLower = skill.title.toLowerCase()
                        const clickedLower = clickedSkill.toLowerCase()
                        return skillLower === clickedLower ||
                            skillLower.includes(clickedLower) ||
                            clickedLower.includes(skillLower)
                    })

                    if (hasMatch) {
                        relevantSections.push({
                            ...section,
                            type: section.magazine || type,
                        })
                    }
                    return relevantSections
                }, [])
        }

        // Search in both content types and combine results
        return [
            ...searchContents(SmackContents, 'smack'),
            ...searchContents(EngineerContents, 'engineer')
        ]
    }, [])

    /**
     * Sets up carousel content based on relevant sections
     */
    const setupCarouselContent = useCallback((sections, magazine) => {
        const sectionItems = sections.map((section) => ({
            title: section.title,
            description: section.description || 'No description available.',
            magazine: section.magazine || section.type,
        }))
        setTitles(sectionItems)

        const allPages = sections.reduce((acc, section) => {
            const orderedPages = Object.values(section.pages || {})
                .sort((a, b) => a.pageIndex - b.pageIndex)
                .map((page) => getTexturePath(section.magazine, page.image))
            return [...acc, ...orderedPages]
        }, [])

        setCarouselType(magazine)
        setCarouselPages(allPages)
        setStyleMagazine(magazine)
    }, [setStyleMagazine, setTitles])

    /**
     * Handle skill click events
     */
    const handleSkillClick = useCallback(
        (content) => {
            setIsExitingCarousel(false)
            setIsCarouselExiting(false)

            // Handle skill deselection
            if (!content || content === currentSkill) {
                if (currentSkill) {
                    setTitles([])
                    setIsExitingCarousel(true)
                    // Trigger collapse animation immediately
                    if (skillStackRef.current?.handleSkillAnimations) {
                        skillStackRef.current.handleSkillAnimations(currentSkill, true)
                    }
                } else {
                    resetCarouselState()
                }
                setCurrentSkill(null)
                return
            }

            // Handle new skill selection
            resetCarouselState()
            setCurrentSkill(content)

            const relevantSections = findRelevantContent(content)
            if (relevantSections.length > 0) {
                const firstSection = relevantSections[0]
                setupCarouselContent(relevantSections, firstSection.magazine)

                // Trigger explosion animation
                if (skillStackRef.current?.handleSkillAnimations) {
                    skillStackRef.current.handleSkillAnimations(content, false)
                }
            } else {
                resetCarouselState()
            }
        },
        [findRelevantContent, setupCarouselContent, currentSkill, resetCarouselState]
    )

    /**
     * Handle carousel animation finish
     */
    const handleCarouselFinish = useCallback(() => {
        if ((isExitingCarousel || isCarouselExiting) && skillStackRef.current?.handleSkillAnimations) {
            const skillToReset = currentSkill
            setCurrentSkill(null)
            resetCarouselState()

            if (skillToReset) {
                skillStackRef.current.handleSkillAnimations(skillToReset, true)
            }
        }
    }, [currentSkill, resetCarouselState, isExitingCarousel, isCarouselExiting])

    /**
     * Handle experience parameter changes from URL
     */
    const handleExperienceChange = useCallback((experienceParam) => {
        console.log('[Contents] handleExperienceChange', experienceParam)
        // Handle parameter removal
        if (!experienceParam) {
            if (currentSkill && skillStackRef.current?.handleSkillAnimations) {
                setTitles([])
                setIsExitingCarousel(true)
                setIsCarouselExiting(false)
                setCurrentSkill(null)
                resetCarouselState()
                skillStackRef.current.handleSkillAnimations(currentSkill, true)
            }
            return
        }

        // Normalize and find matching skill
        const normalizeSkill = (skill) => skill.toLowerCase().replace(/\s+/g, '')
        const normalizedParam = normalizeSkill(experienceParam)

        const findSkillMatch = (predicate) => skillsContent.find(predicate)

        // Try exact match
        let matchingSkill = findSkillMatch(
            skill => normalizeSkill(skill.content) === normalizedParam
        )

        // Try partial match
        if (!matchingSkill) {
            matchingSkill = findSkillMatch(skill => {
                const normalizedContent = normalizeSkill(skill.content)
                return normalizedContent.includes(normalizedParam) ||
                    normalizedParam.includes(normalizedContent)
            })
        }

        // Try word match
        if (!matchingSkill) {
            const paramWords = normalizedParam.match(/[a-z]+/g) || []
            matchingSkill = findSkillMatch(skill => {
                const normalizedContent = normalizeSkill(skill.content)
                return paramWords.some(word => normalizedContent.includes(word))
            })
        }

        // Handle matching skill
        if (matchingSkill && matchingSkill.content !== currentSkill) {
            setIsExitingCarousel(false)
            setIsCarouselExiting(false)
            resetCarouselState()
            setCurrentSkill(matchingSkill.content)

            const relevantSections = findRelevantContent(matchingSkill.content)
            if (relevantSections.length > 0) {
                const firstSection = relevantSections[0]
                setupCarouselContent(relevantSections, firstSection.magazine)

                if (skillStackRef.current?.handleSkillAnimations) {
                    skillStackRef.current.handleSkillAnimations(matchingSkill.content, false)
                }
            }
        }
    }, [skillsContent, currentSkill, resetCarouselState, findRelevantContent, setupCarouselContent])

    // Cleanup effect
    useEffect(() => {
        return () => {
            resetCarouselState()
        }
    }, [resetCarouselState])

    return (
        <>
            <ExperienceQueryParamHandler
                onExperienceChange={handleExperienceChange}
                currentSkill={currentSkill}
            />
            <SkillStacks
                skills={skillsContent}
                onSkillClick={handleSkillClick}
                ref={skillStackRef}
                selectedSkill={currentSkill}
            />
         
            {carouselPages && (
                <group position={[0, 0, LAYOUT.POSITION.CAROUSEL]}>
                    <PageCarousel
                        images={carouselPages}
                        onFinish={handleCarouselFinish}
                        isExiting={isExitingCarousel}
                    />
                </group>
            )}
        </>
    )
} 