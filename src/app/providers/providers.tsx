import type { PropsWithChildren } from 'react'
import { Toaster as Sonner } from '../../shared/components/ui/sonner'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Sonner />
    </>
  )
}
