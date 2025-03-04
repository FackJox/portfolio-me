import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useSetAtom, useAtom } from 'jotai'
import { styleMagazineAtom, titleSlidesAtom } from '@/helpers/atoms'
import { carouselExitingAtom } from '@/components/dom/DescriptionCarousel'
import { skills, transformSkillsConfig, SmackContents, EngineerContents } from '@/helpers/contentsConfig'
import { getTexturePath } from '@/helpers/textureLoaders'
import { PageCarousel } from '@/components/canvas/PageCarousel/PageCarousel'
import { LAYOUT } from './Constants'
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
        console.log('Finding relevant content for skill:', clickedSkill);

        // Search through SmackContents and EngineerContents
        const searchContents = (contents, type) => {
            console.log(`Searching in ${type} contents for skill:`, clickedSkill);
            const relevantSections = [];
            for (const [key, section] of Object.entries(contents)) {
                console.log(`Checking section ${key}:`, section);
                if (section.skills && section.skills.length > 0) {
                    console.log(`Section ${key} has skills:`, section.skills);

                    // Check for exact title match
                    const hasExactMatch = section.skills.some((skill) => {
                        const match = skill && skill.title === clickedSkill;
                        if (match) {
                            console.log(`Found exact match in section ${key} for skill:`, clickedSkill);
                        }
                        return match;
                    });

                    // If no exact match, check for partial title match
                    const hasPartialMatch = !hasExactMatch && section.skills.some((skill) => {
                        if (!skill || !skill.title) return false;

                        // Check if the skill title contains the clicked skill or vice versa
                        const skillLower = skill.title.toLowerCase();
                        const clickedLower = clickedSkill.toLowerCase();
                        const match = skillLower.includes(clickedLower) || clickedLower.includes(skillLower);

                        if (match) {
                            console.log(`Found partial match in section ${key}: "${skill.title}" matches "${clickedSkill}"`);
                        }
                        return match;
                    });

                    if (hasExactMatch || hasPartialMatch) {
                        console.log(`Adding section ${key} to relevant sections`);
                        relevantSections.push({
                            ...section,
                            type: section.magazine || type, // Use section.magazine if available, fallback to type
                        });
                    }
                } else {
                    console.log(`Section ${key} has no skills array or empty skills array`);
                }
            }
            return relevantSections;
        };

        // Search in both content types
        const smackSections = searchContents(SmackContents, 'smack');
        const engineerSections = searchContents(EngineerContents, 'engineer');

        console.log('Found relevant sections:', {
            smack: smackSections,
            engineer: engineerSections
        });

        // Combine and return all relevant sections
        return [...smackSections, ...engineerSections];
    }, []);

    /**
     * Handle skill click events
     */
    const handleSkillClick = useCallback(
        (content) => {
            console.log('handleSkillClick called with content:', content, 'current skill:', currentSkill);

            // Force a reset of animation states to ensure clean state
            setIsExitingCarousel(false);
            setIsCarouselExiting(false);

            if (!content) {
                // If we have a current skill, trigger the exit animation
                if (currentSkill && skillStackRef.current) {
                    console.log('Clearing current skill (null content)');
                    // Immediately clear the titles to hide DescriptionCarousel
                    setTitles([])
                    // Still trigger the exit animation for PageCarousel
                    setIsExitingCarousel(true)
                    setIsCarouselExiting(false) // Don't set this for SkillText clicks
                } else {
                    // Only reset if there's no current skill
                    resetCarouselState()
                }
                setCurrentSkill(null)
                return
            }

            // If clicking the same skill that's already expanded, start exit animation
            if (content === currentSkill) {
                console.log('Clearing current skill (same content clicked)');
                // Immediately clear the titles to hide DescriptionCarousel
                setTitles([])
                // Still trigger the exit animation for PageCarousel
                setIsExitingCarousel(true)
                setIsCarouselExiting(false) // Don't set this for SkillText clicks
                setCurrentSkill(null)
                return
            }

            // Only proceed with setting up a new carousel if we're not in an exit animation
            // or force it if we're in a clean state
            console.log('Setting current skill to:', content);

            // Reset any existing carousel state
            resetCarouselState();

            // Store the clicked skill
            setCurrentSkill(content);

            const relevantSections = findRelevantContent(content);
            if (relevantSections.length > 0) {
                // Get all titles and descriptions from relevant sections
                const sectionItems = relevantSections.map((section) => ({
                    title: section.title,
                    description: section.description || 'No description available.',
                    magazine: section.magazine || section.type, // Include magazine information
                }));
                setTitles(sectionItems);

                // Collect all pages from all relevant sections
                const allPages = relevantSections.reduce((acc, section) => {
                    // Get pages in order based on pageIndex
                    const orderedPages = Object.values(section.pages)
                        .sort((a, b) => a.pageIndex - b.pageIndex)
                        .map((page) => getTexturePath(section.magazine, page.image));
                    return [...acc, ...orderedPages];
                }, []);

                // Use the first section's type for the magazine style
                const firstSection = relevantSections[0];
                setCarouselType(firstSection.magazine);
                setCarouselPages(allPages);
                setStyleMagazine(firstSection.magazine);
            } else {
                resetCarouselState();
            }
        },
        [findRelevantContent, setStyleMagazine, setTitles, currentSkill, resetCarouselState, setIsCarouselExiting],
    );

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

    // Handler for experience parameter changes from URL
    const handleExperienceChange = useCallback((experienceParam) => {
        console.log('handleExperienceChange called with param:', experienceParam, 'current skill:', currentSkill);

        // If experienceParam is null, clear the current skill
        if (!experienceParam) {
            console.log('Received null experience parameter, clearing current skill');
            if (currentSkill) {
                // Use a direct approach to clear the skill
                setTitles([]);
                setIsExitingCarousel(true);
                setIsCarouselExiting(false);
                setCurrentSkill(null);
                resetCarouselState();
            }
            return;
        }

        console.log('Processing experience parameter:', experienceParam);

        // Normalize the experience parameter for comparison (lowercase, no spaces)
        const normalizeSkill = (skill) => {
            return skill.toLowerCase().replace(/\s+/g, '');
        };

        const normalizedParam = normalizeSkill(experienceParam);

        // First try to find an exact match
        let matchingSkill = skillsContent.find(skill =>
            normalizeSkill(skill.content) === normalizedParam
        );

        // If no exact match, try to find a partial match
        if (!matchingSkill) {
            console.log('No exact match found, trying partial match');
            matchingSkill = skillsContent.find(skill => {
                const normalizedSkillContent = normalizeSkill(skill.content);
                return normalizedSkillContent.includes(normalizedParam) ||
                    normalizedParam.includes(normalizedSkillContent);
            });
        }

        // If still no match, try to match by checking if the skill content contains any word from the param
        if (!matchingSkill) {
            console.log('No partial match found, trying word match');
            const paramWords = normalizedParam.match(/[a-z]+/g) || [];
            matchingSkill = skillsContent.find(skill => {
                const normalizedSkillContent = normalizeSkill(skill.content);
                return paramWords.some(word => normalizedSkillContent.includes(word));
            });
        }

        if (matchingSkill) {
            console.log('Found matching skill for URL parameter:', matchingSkill.content);

            // Only trigger if it's different from the current skill
            if (matchingSkill.content !== currentSkill) {
                console.log('Setting skill from URL parameter');

                // Reset animation states
                setIsExitingCarousel(false);
                setIsCarouselExiting(false);

                // Reset any existing carousel state
                resetCarouselState();

                // Set the new skill directly
                setCurrentSkill(matchingSkill.content);

                // Find and set up the relevant content
                const relevantSections = findRelevantContent(matchingSkill.content);
                console.log('Found relevant sections:', relevantSections);

                if (relevantSections.length > 0) {
                    // Get all titles and descriptions from relevant sections
                    const sectionItems = relevantSections.map((section) => ({
                        title: section.title,
                        description: section.description || 'No description available.',
                        magazine: section.magazine || section.type, // Include magazine information
                    }));
                    setTitles(sectionItems);

                    // Collect all pages from all relevant sections
                    const allPages = relevantSections.reduce((acc, section) => {
                        // Get pages in order based on pageIndex
                        const orderedPages = Object.values(section.pages || {})
                            .sort((a, b) => a.pageIndex - b.pageIndex)
                            .map((page) => getTexturePath(section.magazine, page.image));
                        return [...acc, ...orderedPages];
                    }, []);

                    console.log('Setting up carousel with pages:', allPages);

                    // Use the first section's type for the magazine style
                    const firstSection = relevantSections[0];
                    setCarouselType(firstSection.magazine);
                    setCarouselPages(allPages);
                    setStyleMagazine(firstSection.magazine);
                } else {
                    console.warn('No relevant sections found for skill:', matchingSkill.content);
                }
            } else {
                console.log('Skill already set to', matchingSkill.content);
            }
        } else {
            console.warn(`Experience "${experienceParam}" not found in available skills`);
        }
    }, [skillsContent, currentSkill, resetCarouselState, findRelevantContent, setStyleMagazine]);

    // Cleanup effect for carousel state
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
            <SkillStacks skills={skillsContent} onSkillClick={handleSkillClick} ref={skillStackRef} />
            {carouselPages && (
                <group position={[0, 0, LAYOUT.POSITION.CAROUSEL]}>
                    <PageCarousel images={carouselPages} onFinish={handleCarouselFinish} isExiting={isExitingCarousel} />
                </group>
            )}
        </>
    )
} 