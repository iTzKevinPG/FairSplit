import { useLoadingStore } from "@/shared/state/loadingStore"

export async function withLoading<T>(work: () => Promise<T>): Promise<T> {
  const { start, end } = useLoadingStore.getState()
  start()
  try {
    return await work()
  } finally {
    end()
  }
}
