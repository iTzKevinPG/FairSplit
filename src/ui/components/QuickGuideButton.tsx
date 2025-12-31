import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTour, type PopoverContentProps, type StepType } from '@reactour/tour'
import { Sparkles } from 'lucide-react'
import { Button } from '../../shared/components/ui/button'
import { useFairSplitStore } from '../../shared/state/fairsplitStore'

type RequirementKey =
  | 'none'
  | 'event-created'
  | 'people-added'
  | 'invoice-added'
  | 'invoice-description'
  | 'invoice-amount'
  | 'tab-people'
  | 'tab-invoices'
  | 'tab-summary'
  | 'tab-transfers'
  | 'tab-overview'

type GuideStepConfig = {
  selector: string
  title: string
  description: string
  requirement: RequirementKey
  tabId?: 'people' | 'invoices' | 'summary' | 'transfers' | 'overview'
  bypassElem?: boolean
  highlightedSelectors?: string[]
  mutationObservables?: string[]
  resizeObservables?: string[]
  hint?: string
}

const homeSteps: GuideStepConfig[] = [
  {
    selector: '[data-tour="mode-banner"]',
    title: 'Modo de uso',
    description: 'Aqui ves si estas en modo invitado o con perfil activo.',
    requirement: 'none',
  },
  {
    selector: '[data-tour="profile-card"]',
    title: 'Tu perfil',
    description: 'Activa tu perfil si quieres guardar los datos en la nube.',
    requirement: 'none',
  },
  {
    selector: '[data-tour="event-create"]',
    title: 'Crear evento',
    description: 'Crea un evento con nombre y moneda para empezar.',
    requirement: 'event-created',
    hint: 'Completa el formulario y crea un evento para continuar.',
  },
]

const eventSteps: GuideStepConfig[] = [
  {
    selector: '[data-tour="tab-nav"]',
    title: 'Navegacion',
    description: 'Usa estas pestanas para moverte por el evento.',
    requirement: 'none',
  },
  {
    selector: '[data-tour="people-section"]',
    title: 'Integrantes',
    description: 'Agrega personas para poder registrar gastos.',
    requirement: 'people-added',
    tabId: 'people',
    hint: 'Agrega al menos dos integrantes para continuar.',
  },
  {
    selector: '[data-tour-tab="invoices"]',
    title: 'Gastos',
    description: 'Abre la pestana de gastos para registrar un gasto.',
    requirement: 'tab-invoices',
    tabId: 'invoices',
    hint: 'Cambia a la pestana Gastos para continuar.',
  },
  {
    selector: '[data-tour="invoice-description"]',
    title: 'Concepto',
    description: 'Escribe el concepto del gasto.',
    requirement: 'invoice-description',
    tabId: 'invoices',
  },
  {
    selector: '[data-tour="invoice-amount"]',
    title: 'Monto',
    description: 'Ingresa el monto total del gasto.',
    requirement: 'invoice-amount',
    tabId: 'invoices',
  },
  {
    selector: '[data-tour="invoice-payer"]',
    title: 'Pagador',
    description: 'Selecciona quien pago este gasto.',
    requirement: 'none',
    tabId: 'invoices',
    bypassElem: true,
  },
  {
    selector: '[data-tour="invoice-participants"]',
    title: 'Participantes',
    description: 'Selecciona a quienes se les reparte el gasto.',
    requirement: 'none',
    tabId: 'invoices',
    bypassElem: true,
  },
  {
    selector: '[data-tour="invoice-save"]',
    title: 'Guardar gasto',
    description: 'Guarda el gasto para ver el resumen.',
    requirement: 'invoice-added',
    tabId: 'invoices',
    hint: 'Guarda el gasto para continuar.',
    mutationObservables: ['[data-tour="invoice-section"]'],
    resizeObservables: ['[data-tour="invoice-section"]'],
  },
  {
    selector: '[data-tour-tab="summary"]',
    title: 'Resumen',
    description: 'Revisa los saldos netos por persona.',
    requirement: 'tab-summary',
    tabId: 'summary',
    hint: 'Cambia a la pestana Resumen para continuar.',
  },
  {
    selector: '[data-tour-tab="transfers"]',
    title: 'Transferencias',
    description: 'Aqui ves quien paga a quien para saldar cuentas.',
    requirement: 'tab-transfers',
    tabId: 'transfers',
    hint: 'Cambia a la pestana Transferencias para continuar.',
  },
  {
    selector: '[data-tour-tab="overview"]',
    title: 'Vista general',
    description: 'Resumen rapido de todo el evento.',
    requirement: 'tab-overview',
    tabId: 'overview',
    hint: 'Cambia a la pestana Vista general para continuar.',
  },
]

function hasVisibleSection(selector: string) {
  if (typeof document === 'undefined') return false
  return Boolean(document.querySelector(selector))
}

function getInputValue(selector: string) {
  if (typeof document === 'undefined') return ''
  const input = document.querySelector<HTMLInputElement>(selector)
  return input?.value ?? ''
}

function getConfigsForPath(pathname: string): GuideStepConfig[] {
  if (pathname === '/') return homeSteps
  if (pathname.startsWith('/events/')) return eventSteps
  return []
}

function getStepContent(config: GuideStepConfig): StepType['content'] {
  return (props) => <GuideStepContent {...props} config={config} />
}

function GuideStepContent({
  config,
  setCurrentStep,
  currentStep,
  steps,
  setIsOpen,
  setMeta,
}: PopoverContentProps & { config: GuideStepConfig }) {
  const { isOpen } = useTour()
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const selectedEvent = useFairSplitStore((state) => state.getSelectedEvent())
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const lastAutoAdvanceRef = useRef<number | null>(null)
  const peopleCount = selectedEvent?.people.length ?? 0
  const invoiceCount = selectedEvent?.invoices.length ?? 0

  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof CustomEvent)) return
      const tabId = event.detail?.tabId as string | undefined
      if (!tabId) return
      setActiveTab(tabId)
    }
    window.addEventListener('tour:active-tab', handler)
    return () => {
      window.removeEventListener('tour:active-tab', handler)
    }
  }, [])

  const [requirementTick, setRequirementTick] = useState(0)

  useEffect(() => {
    if (!isOpen) return
    const intervalId = window.setInterval(() => {
      setRequirementTick((tick) => tick + 1)
    }, 250)
    return () => {
      window.clearInterval(intervalId)
    }
  }, [isOpen])

  void requirementTick

  useEffect(() => {
    if (!isOpen) return
    const markSelectPopovers = () => {
      document.querySelectorAll('[data-tour="active-select-popover"]').forEach((el) => {
        el.removeAttribute('data-tour')
      })
      document.querySelectorAll('[data-tour-select-content]').forEach((content) => {
        const wrapper =
          content.closest('[data-radix-popper-content-wrapper]') ??
          content.parentElement
        if (!wrapper) return
        wrapper.setAttribute('data-tour', 'active-select-popover')
      })
    }

    markSelectPopovers()
    const observer = new MutationObserver(markSelectPopovers)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      document.querySelectorAll('[data-tour="active-select-popover"]').forEach((el) => {
        el.removeAttribute('data-tour')
      })
    }
  }, [isOpen])
  const requirementMet = (() => {
    switch (config.requirement) {
      case 'none':
        return true
      case 'event-created':
        return pathname.startsWith('/events/')
      case 'people-added':
        return peopleCount >= 2
      case 'invoice-added':
        return invoiceCount > 0
      case 'invoice-description': {
        const value = getInputValue('[data-tour="invoice-description"]')
        return value.trim().length > 0
      }
      case 'invoice-amount': {
        const value = getInputValue('[data-tour="invoice-amount"]')
        const numeric = Number(value)
        return Number.isFinite(numeric) && numeric > 0
      }
      case 'tab-people':
        return activeTab === 'people' || hasVisibleSection('[data-tour="people-section"]')
      case 'tab-invoices':
        return activeTab === 'invoices' || hasVisibleSection('[data-tour="invoice-section"]')
      case 'tab-summary':
        return activeTab === 'summary' || hasVisibleSection('[data-tour="summary-section"]')
      case 'tab-transfers':
        return activeTab === 'transfers' || hasVisibleSection('[data-tour="transfers-section"]')
      case 'tab-overview':
        return activeTab === 'overview' || hasVisibleSection('[data-tour="overview-section"]')
      default:
        return true
    }
  })()

  useEffect(() => {
    if (!isOpen) return
    document.querySelectorAll('[data-tour-select-content]').forEach((content) => {
      const wrapper =
        content.closest('[data-radix-popper-content-wrapper]') ??
        content.parentElement
      wrapper?.setAttribute('data-tour', 'active-select-popover')
    })
  }, [isOpen, requirementTick])

  const isLastStep = steps && currentStep === steps.length - 1
  const autoAdvance = config.requirement === 'event-created'

  const handleStepChange = useCallback(
    (nextIndex: number) => {
      const target = steps?.[nextIndex] as (StepType & { tabId?: string }) | undefined
      if (target?.tabId) {
        window.dispatchEvent(
          new CustomEvent('tour:go-tab', { detail: { tabId: target.tabId } }),
        )
      }
      setCurrentStep(nextIndex)
    },
    [setCurrentStep, steps],
  )

  useEffect(() => {
    if (
      config.requirement !== 'invoice-added' ||
      !requirementMet ||
      !steps ||
      currentStep >= steps.length - 1
    ) {
      return
    }
    if (lastAutoAdvanceRef.current === currentStep) return
    lastAutoAdvanceRef.current = currentStep
    handleStepChange(currentStep + 1)
  }, [config.requirement, currentStep, requirementMet, steps, handleStepChange])

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
          {config.title}
        </p>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          {config.description}
        </p>
      </div>
      {!requirementMet && config.hint ? (
        <div className="rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
          {config.hint}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-main)]"
          onClick={() => {
            setIsOpen(false)
            setMeta?.('')
          }}
        >
          Salir
        </button>
        <div className="flex items-center gap-2">
          {!autoAdvance && currentStep > 0 ? (
            <button
              type="button"
              className="text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-main)]"
              onClick={() => handleStepChange(Math.max(currentStep - 1, 0))}
            >
              Anterior
            </button>
          ) : null}
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              requirementMet
                ? 'bg-[color:var(--color-primary-main)] text-[color:var(--color-text-on-primary)]'
                : 'cursor-not-allowed bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]'
            }`}
            onClick={() => {
              if (!requirementMet) return
              if (isLastStep) {
                setIsOpen(false)
                setMeta?.('')
                return
              }
              handleStepChange(currentStep + 1)
            }}
            disabled={!requirementMet || autoAdvance}
          >
            {isLastStep ? 'Finalizar' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function QuickGuideButton() {
  const location = useLocation()
  const { setIsOpen, setSteps, setCurrentStep, isOpen, meta, setMeta } = useTour()
  const lastPathRef = useRef('')

  const steps = useMemo(() => {
    const configs = getConfigsForPath(location.pathname)
    const interactiveRequirements: RequirementKey[] = [
      'event-created',
      'people-added',
      'invoice-added',
      'tab-invoices',
      'invoice-description',
      'invoice-amount',
      'none',
    ]
    return configs.map((config) => {
      const interactive = interactiveRequirements.includes(config.requirement)
      const highlightedSelectors = [
        ...(interactive ? ['[data-tour="active-select-popover"]'] : []),
        ...(config.highlightedSelectors ?? []),
      ]
      const mutationObservables = [
        ...(interactive ? ['[data-tour="active-select-popover"]'] : []),
        ...(config.mutationObservables ?? []),
      ]
      const resizeObservables = [
        ...(interactive ? ['[data-tour="active-select-popover"]'] : []),
        ...(config.resizeObservables ?? []),
      ]

      return {
        selector: config.selector,
        content: getStepContent(config),
        stepInteraction: interactive,
        bypassElem: config.bypassElem,
        highlightedSelectors: highlightedSelectors.length ? highlightedSelectors : undefined,
        mutationObservables: mutationObservables.length ? mutationObservables : undefined,
        resizeObservables: resizeObservables.length ? resizeObservables : undefined,
        tabId: config.tabId,
      }
    })
  }, [location.pathname])

  useEffect(() => {
    if (meta !== 'guided' || !setSteps) return
    if (lastPathRef.current === location.pathname) return
    setSteps(steps)
    setCurrentStep(0)
    if (!isOpen) {
      setIsOpen(true)
    }
    lastPathRef.current = location.pathname
  }, [isOpen, location.pathname, meta, setCurrentStep, setIsOpen, setSteps, steps])

  const handleOpen = () => {
    if (steps.length === 0 || !setSteps) return
    setMeta?.('guided')
    setSteps(steps)
    setCurrentStep(0)
    setIsOpen(true)
    if (location.pathname.startsWith('/events/')) {
      window.dispatchEvent(
        new CustomEvent('tour:go-tab', { detail: { tabId: 'people' } }),
      )
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="soft"
      className="ring-1 ring-[color:var(--color-primary-light)]"
      onClick={handleOpen}
      disabled={steps.length === 0}
      data-tour="guide-button"
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">Guia rapida</span>
      <span className="sr-only">Guia rapida</span>
    </Button>
  )
}
