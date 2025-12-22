import { create } from 'zustand'

export type ToastTone = 'info' | 'success' | 'warning' | 'error'

export type Toast = {
  id: string
  message: string
  tone: ToastTone
}

type ToastState = {
  toasts: Toast[]
  push: (toast: Toast) => void
  remove: (id: string) => void
}

const DEFAULT_DURATION_MS = 3000

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, toast],
    })),
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))

export function showToast(
  message: string,
  tone: ToastTone = 'info',
  durationMs: number = DEFAULT_DURATION_MS,
) {
  const id = makeId()
  useToastStore.getState().push({ id, message, tone })
  if (durationMs > 0) {
    setTimeout(() => useToastStore.getState().remove(id), durationMs)
  }
  return id
}
