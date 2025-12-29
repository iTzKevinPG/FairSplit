import type { PropsWithChildren, ReactNode } from 'react'
import { Badge } from '../../shared/components/ui/badge'

interface SectionCardProps extends PropsWithChildren {
  title: string
  description?: ReactNode
  badge?: string | number
  action?: ReactNode
  actions?: ReactNode
}

export function SectionCard({
  title,
  description,
  badge,
  action,
  actions,
  children,
}: SectionCardProps) {
  const headerAction = action ?? actions

  return (
    <section className="ds-card animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="ds-card__title">{title}</h2>
            {badge !== undefined ? (
              <Badge variant="count">{badge}</Badge>
            ) : null}
          </div>
          {description ? <p className="ds-card__subtitle">{description}</p> : null}
        </div>
        {headerAction ? (
          <div className="shrink-0 sm:max-w-xs sm:text-right">
            <div className="inline-flex max-w-full flex-wrap justify-end gap-2 text-sm">
              {headerAction}
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
