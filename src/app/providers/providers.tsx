import { type PropsWithChildren, useEffect, useRef } from 'react'
import { TourProvider, useTour } from '@reactour/tour'
import { Toaster as Sonner } from '../../shared/components/ui/sonner'
import { LoadingOverlay } from '../../ui/components/LoadingOverlay'
import { WelcomeModal } from '../../ui/components/WelcomeModal'

function TourScrollLock() {
  const { isOpen, currentStep } = useTour()
  const isOpenRef = useRef(false)
  const lockedRef = useRef(false)

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      lockedRef.current = false
      return
    }
    // Unlock briefly so reactour's scrollSmooth can scroll to the element
    lockedRef.current = false
    const timer = window.setTimeout(() => {
      if (isOpenRef.current) lockedRef.current = true
    }, 600)
    return () => window.clearTimeout(timer)
  }, [isOpen, currentStep])

  useEffect(() => {
    const prevent = (e: Event) => {
      if (isOpenRef.current && lockedRef.current) e.preventDefault()
    }
    window.addEventListener('wheel', prevent, { passive: false })
    window.addEventListener('touchmove', prevent, { passive: false })
    return () => {
      window.removeEventListener('wheel', prevent)
      window.removeEventListener('touchmove', prevent)
    }
  }, []) // Mount once, check refs inside

  return null
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <TourProvider
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
        popover: (base) => ({
          ...base,
          backgroundColor: 'var(--color-surface-card)',
          color: 'var(--color-text-main)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          overflow: 'visible',
          maxWidth: 'min(90vw, 360px)',
        }),
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
