interface ScanProgressBannerProps {
  status: 'idle' | 'uploading' | 'processing'
  progress: number | null
}

export function ScanProgressBanner({ status, progress }: ScanProgressBannerProps) {
  if (status !== 'uploading' && status !== 'processing') return null

  return (
    <div className="relative overflow-hidden rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
      {status === 'processing' && typeof progress === 'number' ? (
        <div
          className="absolute inset-y-0 left-0 bg-[color:var(--color-primary-soft)] transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          aria-hidden="true"
        />
      ) : null}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[scan-shimmer_2.2s_ease-in-out_infinite]" />
      <span className="relative">
        {status === 'uploading'
          ? 'Subiendo factura...'
          : `Procesando factura con OCR${
              typeof progress === 'number' ? ` - ${Math.round(progress)}%` : '...'
            }`}
      </span>
    </div>
  )
}
