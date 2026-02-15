import { Users, Receipt, BarChart3, Handshake, CalendarPlus } from 'lucide-react'

type IllustrationVariant = 'people' | 'invoices' | 'summary' | 'transfers' | 'events'

const config: Record<
  IllustrationVariant,
  { Icon: typeof Users; accent: string; bgClass: string }
> = {
  people: {
    Icon: Users,
    accent: 'text-[color:var(--color-primary-main)]',
    bgClass: 'bg-[color:var(--color-primary-soft)]',
  },
  invoices: {
    Icon: Receipt,
    accent: 'text-[color:var(--color-accent-coral)]',
    bgClass: 'bg-[color:var(--color-accent-coral-soft)]',
  },
  summary: {
    Icon: BarChart3,
    accent: 'text-[color:var(--color-accent-lila)]',
    bgClass: 'bg-[color:var(--color-accent-lila-soft)]',
  },
  transfers: {
    Icon: Handshake,
    accent: 'text-[color:var(--color-accent-success)]',
    bgClass: 'bg-[color:var(--color-success-bg)]',
  },
  events: {
    Icon: CalendarPlus,
    accent: 'text-[color:var(--color-primary-main)]',
    bgClass: 'bg-[color:var(--color-primary-soft)]',
  },
}

interface Props {
  variant: IllustrationVariant
}

export function EmptyStateIllustration({ variant }: Props) {
  const { Icon, accent, bgClass } = config[variant]

  return (
    <div
      className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full ${bgClass}`}
    >
      <Icon className={`h-9 w-9 ${accent}`} strokeWidth={1.5} />
    </div>
  )
}
