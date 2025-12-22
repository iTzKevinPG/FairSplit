import type { PropsWithChildren } from 'react'
import { ToastHost } from '../../ui/components/ToastHost'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <ToastHost />
    </>
  )
}
