import { type PropsWithChildren, useEffect, useRef } from 'react'
import { TourProvider, useTour } from '@reactour/tour'
import { Toaster as Sonner } from '../../shared/components/ui/sonner'
import { LoadingOverlay } from '../../ui/components/LoadingOverlay'
import { WelcomeModal } from '../../ui/components/WelcomeModal'

function TourScrollLock() {
  const { isOpen, currentStep } = useTour()
  const isOpenRef = useRef(isOpen)
  const isLockedRef = useRef(false)
  const restoreScrollRef = useRef<null | (() => void)>(null)

  const unlockScroll = () => {
    isLockedRef.current = false
    restoreScrollRef.current?.()
    restoreScrollRef.current = null
  }

  const lockScroll = () => {
    isLockedRef.current = true
    if (restoreScrollRef.current || typeof document === 'undefined') return
    const body = document.body
    const html = document.documentElement
    const prevBodyOverflow = body.style.overflow
    const prevBodyOverscroll = body.style.overscrollBehavior
    const prevHtmlOverscroll = html.style.overscrollBehavior
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    html.style.overscrollBehavior = 'none'
    html.setAttribute('data-tour-scroll-lock', 'true')
    restoreScrollRef.current = () => {
      body.style.overflow = prevBodyOverflow
      body.style.overscrollBehavior = prevBodyOverscroll
      html.style.overscrollBehavior = prevHtmlOverscroll
      html.removeAttribute('data-tour-scroll-lock')
    }
  }

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      unlockScroll()
      return
    }
    // Unlock briefly so reactour's scrollSmooth can scroll to the element
    unlockScroll()
    const timer = window.setTimeout(() => {
      lockScroll()
    }, 600)
    return () => {
      window.clearTimeout(timer)
      if (!isOpenRef.current) unlockScroll()
    }
  }, [isOpen, currentStep])

  useEffect(() => {
    const prevent = (e: Event) => {
      if (!isOpenRef.current || !isLockedRef.current) return
      const target = e.target
      if (
        target instanceof Element &&
        target.closest('.fair-tour-popover, [data-tour="active-select-popover"]')
      ) {
        return
      }
      e.preventDefault()
    }
    document.addEventListener('wheel', prevent, { passive: false, capture: true })
    document.addEventListener('touchmove', prevent, { passive: false, capture: true })
    return () => {
      document.removeEventListener('wheel', prevent, { capture: true })
      document.removeEventListener('touchmove', prevent, { capture: true })
      unlockScroll()
    }
  }, [])

  return null
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <TourProvider
      className="fair-tour-popover"
      steps={[]}
      showNavigation={false}
      showPrevNextButtons={false}
      showDots={false}
      disableDotsNavigation
      showCloseButton={false}
      scrollSmooth
      padding={{ popover: [16, 12], mask: [6, 6] }}
      onClickMask={() => {
        // No-op to prevent closing when clicking outside the tour.
      }}
      onClickClose={(clickProps) => {
        clickProps.setIsOpen(false)
        clickProps.setMeta?.('')
      }}
      styles={{
        popover: (base) => {
          const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640
          return {
            ...base,
            backgroundColor: 'var(--color-surface-card)',
            color: 'var(--color-text-main)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            overflowY: 'auto',
            overflowX: 'hidden',
            maxWidth: 'min(90vw, 360px)',
            maxHeight: isMobile ? '48vh' : 'min(70vh, 560px)',
          }
        },
        badge: (base) => ({
          ...base,
          backgroundColor: 'var(--color-primary-main)',
          color: 'var(--color-text-on-primary)',
          left: 'auto',
          right: 8,
          top: 8,
        }),
        maskArea: (base) => ({
          ...base,
          rx: 12,
        }),
        maskWrapper: (base) => ({
          ...base,
          color: 'var(--color-tour-mask)',
        }),
      }}
    >
      {children}
      <TourScrollLock />
      <LoadingOverlay />
      <Sonner />
      <WelcomeModal />
    </TourProvider>
  )
}
