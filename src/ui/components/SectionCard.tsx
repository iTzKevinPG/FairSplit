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
    <section className="ds-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="ds-card__title">{title}</h2>
          {description ? <p className="ds-card__subtitle">{description}</p> : null}
        </div>
        {actions ? (
          <div className="shrink-0 sm:max-w-xs sm:text-right">
            <div className="inline-flex max-w-full flex-wrap justify-end gap-2 text-sm">
              {actions}
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
