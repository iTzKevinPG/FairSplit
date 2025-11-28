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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="ds-card__title">{title}</h2>
          {description ? (
            <p className="ds-card__subtitle">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
