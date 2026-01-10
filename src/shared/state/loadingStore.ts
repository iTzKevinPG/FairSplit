import { create } from 'zustand'

type LoadingState = {
  pendingCount: number
  start: () => void
  end: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  pendingCount: 0,
  start: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
  end: () =>
    set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
}))
