'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

/**
 * ExperienceQueryParamHandler component that manages the 'experience' URL parameter
 * for the Contents component. It handles:
 * 1. Reading the experience parameter from the URL and triggering the appropriate skill click
 * 2. Updating the URL when a skill is clicked in the Contents component
 */
const ExperienceQueryParamHandler = ({ onExperienceChange, currentSkill }) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [lastProcessedSkill, setLastProcessedSkill] = useState(null)
    const debugCounterRef = useRef(0)
    const isUpdatingUrlRef = useRef(false)
    const lastUrlParamRef = useRef(null)
    const timeoutRef = useRef(null)

    // Helper function to format skill name for URL (remove spaces)
    const formatSkillForUrl = (skill) => {
        if (!skill) return '';

        // For longer skill names, use a more compact representation
        const compactName = skill.replace(/\s+/g, '');

        // If the name is too long, truncate it
        return compactName.length > 30 ? compactName.substring(0, 30) : compactName;
    }

    // Helper function to normalize skill name for comparison
    const normalizeSkill = (skill) => {
        return skill ? skill.toLowerCase().replace(/\s+/g, '') : '';
    }

    // Log component props on each render
    const renderCount = ++debugCounterRef.current;
    console.log(`[ExperienceQueryParamHandler] Render #${renderCount}:`, {
        currentSkill,
        lastProcessedSkill,
        isInitialLoad,
        searchParams: searchParams.toString(),
        pathname,
        isUpdatingUrl: isUpdatingUrlRef.current,
        lastUrlParam: lastUrlParamRef.current
    });

    // Cleanup function for timeouts
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Effect for URL -> State synchronization (when URL changes)
    useEffect(() => {
        // Skip if we're in the middle of updating the URL ourselves
        if (isUpdatingUrlRef.current) {
            console.log('[ExperienceQueryParamHandler] Skipping URL -> State sync (we are updating URL)');
            return;
        }

        console.log(`[ExperienceQueryParamHandler] URL -> State effect running, isInitialLoad:`, isInitialLoad);

        // Try to get the parameter with an empty name
        let experienceParam = searchParams.get('')

        // If that doesn't work, try to get it from the raw URL
        if (!experienceParam && typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            experienceParam = urlParams.get('')
            if (experienceParam) {
                console.log(`[ExperienceQueryParamHandler] Got param from window.location:`, experienceParam);
            }
        }

        // Check if the URL parameter has changed
        if (experienceParam !== lastUrlParamRef.current) {
            console.log(`[ExperienceQueryParamHandler] URL parameter changed from "${lastUrlParamRef.current}" to "${experienceParam}"`);
            lastUrlParamRef.current = experienceParam;

            if (experienceParam) {
                console.log('[ExperienceQueryParamHandler] URL -> State: Found experience parameter:', experienceParam);
                onExperienceChange(experienceParam);
            } else if (currentSkill) {
                // URL parameter was removed, clear the skill
                console.log('[ExperienceQueryParamHandler] URL parameter removed, clearing skill');
                onExperienceChange(null);
            }
        }

        if (isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [searchParams, onExperienceChange, isInitialLoad, currentSkill]);

    // Effect for State -> URL synchronization (when skill selection changes)
    useEffect(() => {
        // Skip the initial render
        if (isInitialLoad) {
            console.log('[ExperienceQueryParamHandler] Skipping initial render');
            return;
        }

        // Skip if the skill hasn't changed
        if (currentSkill === lastProcessedSkill) {
            console.log('[ExperienceQueryParamHandler] Skill unchanged, skipping URL update');
            return;
        }

        console.log('[ExperienceQueryParamHandler] State -> URL: Current skill changed to', currentSkill);
        setLastProcessedSkill(currentSkill);

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        try {
            // Set flag to prevent URL -> State effect from firing due to our own URL change
            isUpdatingUrlRef.current = true;

            // Update URL based on current skill
            if (currentSkill) {
                // Add the experience parameter with empty name (?=value format)
                const formattedSkill = formatSkillForUrl(currentSkill);

                // Create a URLSearchParams object with an empty parameter name
                const params = new URLSearchParams();
                params.append('', formattedSkill);

                const newUrl = `${pathname}?${params.toString()}`;
                console.log('[ExperienceQueryParamHandler] Updating URL to:', newUrl);
                lastUrlParamRef.current = formattedSkill;
                router.replace(newUrl, { scroll: false });
            } else {
                // Remove the parameter if no skill is selected
                console.log('[ExperienceQueryParamHandler] Clearing URL parameter');
                lastUrlParamRef.current = null;
                router.replace(pathname, { scroll: false });
            }

            // Reset the flag after a short delay to allow the URL change to complete
            timeoutRef.current = setTimeout(() => {
                isUpdatingUrlRef.current = false;
                console.log('[ExperienceQueryParamHandler] URL update complete, reset isUpdatingUrlRef');
                timeoutRef.current = null;
            }, 200);
        } catch (error) {
            console.error('[ExperienceQueryParamHandler] Error updating URL:', error);
            isUpdatingUrlRef.current = false;
        }
    }, [currentSkill, router, isInitialLoad, lastProcessedSkill, pathname]);

    return null;
}

export default ExperienceQueryParamHandler; 