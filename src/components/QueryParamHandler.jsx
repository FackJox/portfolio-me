'use client'

import React, { useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { 
  focusedMagazineAtom, 
  smackAtom, 
  engineerAtom, 
  vagueAtom 
} from '@/state/atoms/magazines'
import { 
  SmackContents, 
  EngineerContents, 
  VagueContents 
} from '@/constants/contents/config'

const QueryParamHandler = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [focusedMagazine, setFocusedMagazine] = useAtom(focusedMagazineAtom)
  const [smackPage, setSmackPage] = useAtom(smackAtom)
  const [engineerPage, setEngineerPage] = useAtom(engineerAtom)
  const [vaguePage, setVaguePage] = useAtom(vagueAtom)

  const findArticlePageIndex = useCallback((magazine, articleTitle) => {
    let contentSource
    switch (magazine) {
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
        return null
    }

    // Find the article in the content source
    const article = Object.values(contentSource).find((section) => section.title === articleTitle)

    if (article && article.pages) {
      // Get the first available page index
      const firstPage = Object.values(article.pages)[0]
      if (firstPage && typeof firstPage.pageIndex === 'number') {
        // Convert content config page index to magazine spread index
        // Add 1 to make Contents spread 1, Editorial spread 2, etc.
        return Math.floor(firstPage.pageIndex / 2) + 1
      }
    }
    return null
  }, [])

  const findArticleByPageIndex = useCallback((magazine, spreadIndex) => {
    let contentSource
    switch (magazine) {
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
        return null
    }

    // Convert spread index to content config page index range
    // Subtract 1 from spreadIndex to align with content config indices
    const startPageIndex = (spreadIndex - 1) * 2
    const endPageIndex = startPageIndex + 1

    // Find the article that contains this page index range
    const article = Object.values(contentSource).find((section) => {
      if (!section.pages) return false
      const pageIndices = Object.values(section.pages).map((page) => page.pageIndex)
      return pageIndices.some((index) => index === startPageIndex || index === endPageIndex)
    })

    return article ? article.title : null
  }, [])

  // Effect for URL -> State synchronization
  useEffect(() => {
    const magazine = searchParams.get('magazine')
    const article = searchParams.get('article')

   

    if (magazine && article) {
      const pageIndex = findArticlePageIndex(magazine, article)

      if (pageIndex !== null) {
        setFocusedMagazine(magazine)
        switch (magazine) {
          case 'smack':
            setSmackPage(pageIndex)
            break
          case 'engineer':
            setEngineerPage(pageIndex)
            break
          case 'vague':
            setVaguePage(pageIndex)
            break
        }
      } else {
        console.warn(`Article "${article}" not found in magazine "${magazine}"`)
      }
    }
  }, [searchParams, findArticlePageIndex, setFocusedMagazine, setSmackPage, setEngineerPage, setVaguePage])

  // Effect for State -> URL synchronization
  useEffect(() => {
   
    // Skip if no magazine is focused
    if (!focusedMagazine) {
      router.replace('/')
      return
    }

    // Get the current page based on the focused magazine
    let currentPage
    switch (focusedMagazine) {
      case 'smack':
        currentPage = smackPage
        break
      case 'engineer':
        currentPage = engineerPage
        break
      case 'vague':
        currentPage = vaguePage
        break
      default:
        return
    }

    // Find the article title for the current page (including page 0 for Contents)
    const articleTitle = findArticleByPageIndex(focusedMagazine, currentPage)

    if (articleTitle) {
      const params = new URLSearchParams()
      params.set('magazine', focusedMagazine)
      params.set('article', articleTitle)

      const newUrl = `?${params.toString()}`
      router.replace(newUrl)
    }
  }, [focusedMagazine, smackPage, engineerPage, vaguePage, findArticleByPageIndex, router])

  return null
}

export default QueryParamHandler
