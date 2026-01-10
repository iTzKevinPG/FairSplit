import { type PropsWithChildren, useEffect, useRef } from 'react'
import { TourProvider, useTour } from '@reactour/tour'
import { Toaster as Sonner } from '../../shared/components/ui/sonner'

function TourScrollLock() {
  const { isOpen } = useTour()
  const previousOverflow = useRef<string | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      if (previousOverflow.current === null) {
        previousOverflow.current = document.body.style.overflow || ''
      }
      document.body.style.overflow = 'hidden'
    } else if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current
      previousOverflow.current = null
    }
  }, [isOpen])

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
      <TourScrollLock />
      {children}
      <Sonner />
    </TourProvider>
  )
}
