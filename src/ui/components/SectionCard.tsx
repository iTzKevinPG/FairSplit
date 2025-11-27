import type { PropsWithChildren, ReactNode } from 'react'

interface SectionCardProps extends PropsWithChildren {
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export function SectionCard({
  title,
  description,
  actions,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
