import { Check, Users, Receipt, BarChart3, ArrowRightLeft, LayoutGrid } from 'lucide-react'

interface EventStepperProps {
  peopleCount: number
  invoiceCount: number
  hasBalances: boolean
  allSettled: boolean
  activeTab: string
  onStepClick: (tabId: string) => void
}

const steps = [
  { id: 'people', label: 'Grupo', icon: Users, requiredLabel: 'Agrega personas' },
  { id: 'invoices', label: 'Gastos', icon: Receipt, requiredLabel: 'Anota un gasto' },
  { id: 'summary', label: 'Balance', icon: BarChart3, requiredLabel: 'Revisa el balance' },
  { id: 'transfers', label: 'Pagos', icon: ArrowRightLeft, requiredLabel: 'Salda las cuentas' },
]

export function EventStepper({
  peopleCount,
  invoiceCount,
  hasBalances,
  allSettled,
  activeTab,
  onStepClick,
}: EventStepperProps) {
  const completed = [
    peopleCount >= 2,
    invoiceCount >= 1,
    peopleCount >= 2 && invoiceCount >= 1 && hasBalances,
    allSettled,
  ]

  // Find current suggested step (first incomplete)
  const currentStepIndex = completed.findIndex((c) => !c)
  const suggestedStep = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex

  return (
    <div className="w-full" data-tour="tab-nav">
      {/* Desktop stepper — tab-style navigation */}
      <div className="hidden sm:flex flex-col items-center">
        <div className="flex w-full items-stretch rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-1 shadow-[var(--shadow-sm)]">
          {steps.map((step, index) => {
            const isCompleted = completed[index]
            const isCurrent = index === suggestedStep && !completed[index]
            const isActive = activeTab === step.id
            const Icon = step.icon

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick(step.id)}
                title={`Ir a ${step.label}`}
                className={`
                  group relative flex flex-1 cursor-pointer flex-col lg:flex-row items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[11px] font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)] shadow-[var(--shadow-sm)]'
                    : isCompleted
                      ? 'text-[color:var(--color-accent-success)] hover:bg-[color:var(--color-success-bg)]'
                      : isCurrent
                        ? 'text-[color:var(--color-accent-coral)] hover:bg-[color:var(--color-accent-coral-soft)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                  }
                `}
              >
                <span
                  className={`
                    flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-200
                    group-hover:scale-110
                    ${isCompleted
                      ? 'bg-[color:var(--color-accent-success)] text-white'
                      : isCurrent
                        ? 'bg-[color:var(--color-accent-coral)] text-white animate-pulse'
                        : isActive
                          ? 'bg-[color:var(--color-primary-main)] text-white'
                          : 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]'
                    }
                  `}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span>{step.label}</span>

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[color:var(--color-primary-main)] transition-all duration-300" />
                )}
              </button>
            )
          })}

          {/* Separator */}
          <div className="flex items-center mx-0.5">
            <div className="h-5 w-[1px] bg-[color:var(--color-border-subtle)]" />
          </div>

          {/* Overview tab */}
          <button
            type="button"
            onClick={() => onStepClick('overview')}
            title="Ir a General"
            className={`
              group relative flex cursor-pointer flex-col lg:flex-row items-center gap-1.5 rounded-lg px-4 py-2.5 text-[11px] font-semibold transition-all duration-200
              ${activeTab === 'overview'
                ? 'bg-[color:var(--color-accent-lila-soft)] text-[color:var(--color-accent-lila)] shadow-[var(--shadow-sm)]'
                : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
              }
            `}
          >
            <span
              className={`
                flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200
                group-hover:scale-110
                ${activeTab === 'overview'
                  ? 'bg-[color:var(--color-accent-lila)] text-white'
                  : 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]'
                }
              `}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </span>
            <span>General</span>
            {activeTab === 'overview' && (
              <span className="absolute -bottom-1 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[color:var(--color-accent-lila)] transition-all duration-300" />
            )}
          </button>
        </div>

        {/* Progress dots below */}
        <div className="mt-2 flex items-center gap-1.5">
          {steps.map((step, index) => {
            const isCompleted = completed[index]
            const isCurrent = index === suggestedStep && !completed[index]
            return (
              <div
                key={step.id}
                className={`
                  h-1.5 w-6 rounded-full transition-all duration-300
                  ${isCompleted
                    ? 'bg-[color:var(--color-accent-success)]'
                    : isCurrent
                      ? 'bg-[color:var(--color-accent-coral)]'
                      : 'bg-[color:var(--color-border-subtle)]'
                  }
                `}
              />
            )
          })}
          <span className="ml-1 text-[10px] font-semibold text-[color:var(--color-text-muted)]">
            {completed.filter(Boolean).length}/{steps.length}
          </span>
        </div>
      </div>

      {/* Mobile compact progress bar */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="flex flex-1 items-center gap-1.5">
          {steps.map((step, index) => {
            const isCompleted = completed[index]
            const isCurrent = index === suggestedStep && !completed[index]
            return (
              <div
                key={step.id}
                className={`
                  h-1.5 flex-1 rounded-full transition-all duration-300
                  ${isCompleted
                    ? 'bg-[color:var(--color-accent-success)]'
                    : isCurrent
                      ? 'bg-[color:var(--color-accent-coral)]'
                      : 'bg-[color:var(--color-border-subtle)]'
                  }
                `}
              />
            )
          })}
        </div>
        <span className="text-[11px] font-semibold text-[color:var(--color-text-muted)] whitespace-nowrap">
          {completed.filter(Boolean).length}/{steps.length}
        </span>
      </div>

      {/* Hint message */}
      {currentStepIndex !== -1 && (
        <p className="mt-2 text-xs text-[color:var(--color-text-muted)] sm:text-center">
          👉 Siguiente: <span className="font-semibold text-[color:var(--color-accent-coral)]">{steps[suggestedStep].requiredLabel}</span>
        </p>
      )}
      {currentStepIndex === -1 && (
        <p className="mt-2 text-xs text-[color:var(--color-accent-success)] sm:text-center font-semibold">
          🎉 ¡Todo saldado! El grupo está en paz.
        </p>
      )}
    </div>
  )
}
