import type { PropsWithChildren } from 'react'
import { TourProvider } from '@reactour/tour'
import { Toaster as Sonner } from '../../shared/components/ui/sonner'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <TourProvider
      steps={[]}
      showNavigation={false}
      showPrevNextButtons={false}
      showDots={false}
      disableDotsNavigation
      showCloseButton
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
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: 'var(--color-primary-main)',
          color: 'var(--color-text-on-primary)',
        }),
        maskArea: (base) => ({
          ...base,
          rx: 12,
        }),
      }}
    >
      {children}
      <Sonner />
    </TourProvider>
  )
}
