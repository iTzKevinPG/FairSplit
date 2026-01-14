import { ChevronDown, Plus, Receipt, Save, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '../../shared/components/ui/badge'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useTour } from '@reactour/tour'
import { Button } from '../../shared/components/ui/button'
import { Input } from '../../shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select'
import { MemberChip } from './MemberChip'
import { SectionCard } from './SectionCard'
import { InvoiceList } from './invoice/InvoiceList'
import { ConsumptionItemsSection } from './invoice/ConsumptionItemsSection'
import { InvoiceItemModal } from './invoice/InvoiceItemModal'
import { OcrDecisionModal } from './invoice/OcrDecisionModal'
import { ScanProgressBanner } from './invoice/ScanProgressBanner'
import type { InvoiceItem } from '../../domain/invoice/Invoice'
import type { InvoiceForUI, PersonForUI } from '../../shared/state/fairsplitStore'
import { createId } from '../../shared/utils/createId'
import { ActionMenu } from '../../shared/components/ActionMenu'
import {
  confirmScanApi,
  getScanStatusApi,
  rescanInvoiceApi,
  retryScanApi,
  scanInvoiceApi,
} from '../../infra/persistence/http/invoiceApi'
import { toast } from '../../shared/components/ui/sonner'

interface InvoiceSectionProps {
  eventId: string
  invoices: InvoiceForUI[]
  people: PersonForUI[]
  currency: string
  onRefreshEvent?: () => Promise<void>
  onAdd: (invoice: {
    description: string
    amount: number
    payerId: string
    participantIds: string[]
    divisionMethod?: 'equal' | 'consumption'
    consumptions?: Record<string, number>
    items?: InvoiceItem[]
    tipAmount?: number
    birthdayPersonId?: string
  }) => Promise<void>
  onUpdate: (invoice: {
    invoiceId: string
    description: string
    amount: number
    payerId: string
    participantIds: string[]
    divisionMethod?: 'equal' | 'consumption'
    consumptions?: Record<string, number>
    items?: InvoiceItem[]
    tipAmount?: number
    birthdayPersonId?: string
  }) => Promise<void>
  onRemove: (invoiceId: string) => Promise<void>
}

export function InvoiceSection({
  eventId,
  invoices,
  people,
  currency,
  onAdd,
  onUpdate,
  onRemove,
  onRefreshEvent,
}: InvoiceSectionProps) {
  const { isOpen: isTourOpen, meta: tourMeta, steps, setCurrentStep } = useTour()
  const optionsMenuRef = useRef<HTMLDetailsElement | null>(null)
  const formRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scanPollRef = useRef<number | null>(null)
  const scanStartRef = useRef<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState<string | undefined>(
    people[0]?.id ?? undefined,
  )
  const [participantIds, setParticipantIds] = useState<string[]>(
    people.map((person) => person.id),
  )
  const [error, setError] = useState<string | null>(null)
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [divisionMethod, setDivisionMethod] = useState<'equal' | 'consumption'>('equal')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemUnitPrice, setItemUnitPrice] = useState('')
  const [itemQuantity, setItemQuantity] = useState('1')
  const [itemParticipantIds, setItemParticipantIds] = useState<string[]>([])
  const [itemError, setItemError] = useState<string | null>(null)
  const [includeTip, setIncludeTip] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const [birthdayEnabled, setBirthdayEnabled] = useState(false)
  const [birthdayPersonId, setBirthdayPersonId] = useState<string>('')
  const [showParticipants, setShowParticipants] = useState(false)
  const [showConsumption, setShowConsumption] = useState(false)
  const [scanStatus, setScanStatus] = useState<'idle' | 'uploading' | 'processing'>('idle')
  const [scanProgress, setScanProgress] = useState<number | null>(null)
  const [scanWarnings, setScanWarnings] = useState<string[]>([])
  const [scanJobId, setScanJobId] = useState<string | null>(null)
  const [scanFromOcr, setScanFromOcr] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanIsGuest, setScanIsGuest] = useState(false)
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [rescanConfirmOpen, setRescanConfirmOpen] = useState(false)

  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0)
  const availablePersonIds = people.map((person) => person.id)
  const resolvedPayerId =
    payerId && availablePersonIds.includes(payerId) ? payerId : availablePersonIds[0]
  const participantIdsWithPayer = resolvedPayerId
    ? participantIds.includes(resolvedPayerId)
      ? participantIds
      : [...participantIds, resolvedPayerId]
    : participantIds
  const sanitizedParticipantIds = participantIdsWithPayer.filter((id) =>
    availablePersonIds.includes(id),
  )
  const effectiveParticipantIds = showParticipants
    ? sanitizedParticipantIds
    : availablePersonIds
  const birthdayOptions = showParticipants ? sanitizedParticipantIds : availablePersonIds

  const handlePayerChange = (nextPayerId: string) => {
    setPayerId(nextPayerId)
    setParticipantIds((current) =>
      current.includes(nextPayerId) ? current : [...current, nextPayerId],
    )
  }

  const handleToggleParticipant = (id: string) => {
    if (id === resolvedPayerId) return
    setParticipantIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
      setBirthdayPersonId((currentBirthday) =>
        currentBirthday && next.includes(currentBirthday) ? currentBirthday : '',
      )
      return next
    })
  }

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setPayerId(people[0]?.id ?? undefined)
    setParticipantIds(people.map((person) => person.id))
    setDivisionMethod('equal')
    setItems([])
    setExpandedItems({})
    setItemModalOpen(false)
    setEditingItemId(null)
    setItemName('')
    setItemUnitPrice('')
    setItemQuantity('1')
    setItemParticipantIds([])
    setItemError(null)
    setIncludeTip(false)
    setTipAmount('')
    setBirthdayEnabled(false)
    setBirthdayPersonId('')
    setShowParticipants(false)
    setShowConsumption(false)
    setEditingInvoiceId(null)
    setShowForm(false)
    setScanWarnings([])
    setScanJobId(null)
    setScanFromOcr(false)
    setScanProgress(null)
    setScanError(null)
    setScanModalOpen(false)
    setRescanConfirmOpen(false)
    setScanIsGuest(false)
  }

  const startEdit = (invoice: InvoiceForUI) => {
    setShowForm(true)
    setEditingInvoiceId(invoice.id)
    setDescription(invoice.description)
    setAmount(String(invoice.amount))
    setPayerId(invoice.payerId)
    setParticipantIds(invoice.participantIds)
    const method =
      invoice.divisionMethod ?? (invoice.consumptions ? 'consumption' : 'equal')
    setDivisionMethod(method)
    setShowConsumption(method === 'consumption')
    setIncludeTip(Boolean(invoice.tipAmount && invoice.tipAmount > 0))
    setTipAmount(invoice.tipAmount ? String(invoice.tipAmount) : '')
    setBirthdayEnabled(Boolean(invoice.birthdayPersonId))
    setBirthdayPersonId(invoice.birthdayPersonId ?? '')
    setShowParticipants(true)
    setItems(invoice.items ?? [])
    setExpandedItems({})
    setItemModalOpen(false)
    setEditingItemId(null)
    setItemName('')
    setItemUnitPrice('')
    setItemQuantity('1')
    setItemParticipantIds([])
    setItemError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedDescription = description.trim()
    const numericAmount = Number(amount)
    const effectiveParticipants = effectiveParticipantIds
    const effectivePayerId = resolvedPayerId

    if (!trimmedDescription) {
      setError('La descripcion es obligatoria.')
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('El monto debe ser mayor que 0.')
      return
    }
    if (!effectivePayerId) {
      setError('Debes seleccionar un pagador.')
      return
    }
    if (birthdayEnabled) {
      if (!birthdayPersonId) {
        setError('Selecciona a la persona invitada especial.')
        return
      }
      if (!effectiveParticipants.includes(birthdayPersonId)) {
        setError('El invitado especial debe estar en la lista de participantes.')
        return
      }
      if (effectiveParticipants.length < 2) {
        setError(
          'Se necesita al menos otra persona para repartir el consumo del invitado especial.',
        )
        return
      }
    }
    if (effectiveParticipants.length === 0) {
      setError('Selecciona al menos un participante.')
      return
    }
    const numericTip = Number(tipAmount || 0)
    if (includeTip && (!Number.isFinite(numericTip) || numericTip <= 0)) {
      setError('La propina debe ser mayor que 0.')
      return
    }

    let consumptionPayload: Record<string, number> | undefined
    let itemsPayload: InvoiceItem[] | undefined
    if (divisionMethod === 'consumption') {
      if (items.length === 0) {
        setError('Agrega al menos un item para repartir el consumo.')
        return
      }
      const normalizedItems = items.map((item) => ({
        ...item,
        participantIds: item.participantIds.filter((id) =>
          effectiveParticipants.includes(id),
        ),
      }))
      const invalidItem = normalizedItems.find(
        (item) => item.participantIds.length === 0,
      )
      if (invalidItem) {
        setError('Cada item debe tener al menos un participante asignado.')
        return
      }
      const totalRegistered = normalizedItems.reduce(
        (acc, item) => acc + getItemTotal(item),
        0,
      )
      if (totalRegistered <= 0) {
        setError('El total registrado debe ser mayor a 0.')
        return
      }
      const diff = Math.abs(numericAmount - totalRegistered)
      if (diff > 0.01) {
        setError('La suma de items no coincide con el total del gasto.')
        return
      }
      consumptionPayload = buildConsumptionsFromItems(
        normalizedItems,
        effectiveParticipants,
      )
      itemsPayload = normalizedItems
    }

    setError(null)
    if (editingInvoiceId) {
      await onUpdate({
        invoiceId: editingInvoiceId,
        description: trimmedDescription,
        amount: numericAmount,
        payerId: effectivePayerId,
        participantIds: effectiveParticipants,
        divisionMethod,
        consumptions: consumptionPayload,
        items: itemsPayload,
        tipAmount: includeTip ? numericTip : undefined,
        birthdayPersonId: birthdayEnabled ? birthdayPersonId : undefined,
      })
    } else {
      const hasAuthToken =
        typeof window !== 'undefined' &&
        Boolean(window.localStorage.getItem('fairsplit_auth_token'))
      if (scanJobId && hasAuthToken) {
        try {
          await confirmScanApi(scanJobId, {
            eventId,
            description: trimmedDescription,
            totalAmount: numericAmount,
            payerId: effectivePayerId,
            participantIds: effectiveParticipants,
            divisionMethod,
            consumptions: consumptionPayload,
            items: itemsPayload?.map((item) => ({
              name: item.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              participantIds: item.participantIds,
            })),
            tipAmount: includeTip ? numericTip : undefined,
            birthdayPersonId: birthdayEnabled ? birthdayPersonId : undefined,
          })
          if (onRefreshEvent) {
            await onRefreshEvent()
          }
        } catch (error) {
          const message = (error as Error).message || 'No se pudo confirmar el OCR.'
          if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('not found')) {
            toast.error(
              scanIsGuest
                ? 'El escaneo expiro en modo local. Vuelve a subir la factura.'
                : 'El escaneo expiro. Vuelve a escanear la factura.',
            )
          } else if (message.toLowerCase().includes('limit')) {
            toast.error('Alcanzaste el limite de lecturas OCR. Intenta mas tarde.')
          } else {
            toast.error(message)
          }
          return
        }
      } else {
        await onAdd({
          description: trimmedDescription,
          amount: numericAmount,
          payerId: effectivePayerId,
          participantIds: effectiveParticipants,
          divisionMethod,
          consumptions: consumptionPayload,
          items: itemsPayload,
          tipAmount: includeTip ? numericTip : undefined,
          birthdayPersonId: birthdayEnabled ? birthdayPersonId : undefined,
        })
      }
    }
    if (typeof window !== 'undefined' && isTourOpen && tourMeta === 'guided') {
      window.dispatchEvent(new CustomEvent('tour:go-tab', { detail: { tabId: 'summary' } }))
      if (steps && setCurrentStep) {
        setCurrentStep((current) => Math.min(current + 1, steps.length - 1))
      }
    }
    resetForm()
  }


  const startPolling = (jobId: string) => {
    if (scanPollRef.current) {
      window.clearInterval(scanPollRef.current)
    }
    const maxWaitMs = 120000
    scanStartRef.current = Date.now()
    scanPollRef.current = window.setInterval(async () => {
      try {
        if (scanStartRef.current && Date.now() - scanStartRef.current > maxWaitMs) {
          window.clearInterval(scanPollRef.current!)
          scanPollRef.current = null
          setScanStatus('idle')
          setScanJobId(null)
          setScanProgress(null)
          const message = scanIsGuest
            ? 'El escaneo esta tardando demasiado en modo local. Vuelve a subir la factura.'
            : 'El escaneo esta tardando demasiado. Intenta de nuevo.'
          setScanError(message)
          toast.error(message)
          return
        }
        const status = await getScanStatusApi(jobId)
        if (typeof status.progress === 'number') {
          setScanProgress(status.progress)
        }
        if (status.status === 'completed' && status.result) {
          window.clearInterval(scanPollRef.current!)
          scanPollRef.current = null
          const rawTotal = status.result.totalAmount ?? status.result.subtotal ?? 0
          const baseTotal = rawTotal
          setShowForm(true)
          setEditingInvoiceId(null)
          setDivisionMethod('equal')
          setShowConsumption(false)
          setShowParticipants(false)
          setBirthdayEnabled(false)
          setBirthdayPersonId('')
          setExpandedItems({})
          setItemError(null)
          setDescription(status.result.description ?? '')
          setAmount(rawTotal ? baseTotal.toFixed(2) : '')
          if (status.result.tipAmount && status.result.tipAmount > 0) {
            setIncludeTip(true)
            setTipAmount(status.result.tipAmount.toFixed(2))
          } else {
            setIncludeTip(false)
            setTipAmount('')
          }
          const rawItems = status.result.items ?? []
          const nextItems = rawItems
            .filter(
              (item) =>
                Number.isFinite(item.unitPrice) &&
                Number.isFinite(item.quantity) &&
                item.unitPrice > 0 &&
                item.quantity > 0,
            )
            .map((item) => ({
              id: createId(),
              name: item.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              participantIds: [],
            }))
          const droppedItemsCount = rawItems.length - nextItems.length
          setItems(nextItems)
          const warningMap: Array<[string, string]> = [
            [
              'Subtotal + tip does not match total.',
              'La propina no cuadra con el total. Revisa los valores.',
            ],
            [
              'Subtotal + tax does not match total.',
              'El subtotal e impuestos no cuadran con el total. Revisa los valores.',
            ],
            [
              'Subtotal inferred from items sum.',
              'El subtotal se infirio con la suma de items.',
            ],
            [
              'Tip inferred from items.',
              'La propina se infirio desde un item.',
            ],
            [
              'Tip inferred from total minus subtotal.',
              'La propina se infirio restando subtotal al total.',
            ],
            [
              'Total adjusted to exclude tip amount.',
              'El total se ajusto para excluir la propina.',
            ],
            [
              'Currency missing, using event currency.',
              'No se detecto moneda, usamos la del evento.',
            ],
            [
              'Currency does not match event currency. Using event currency.',
              'La moneda no coincide, usamos la del evento.',
            ],
          ]
          const mappedWarnings = (status.result.warnings ?? []).map((warning) => {
            const match = warningMap.find(([key]) => warning === key)
            return match ? match[1] : warning
          })
          if (droppedItemsCount > 0) {
            mappedWarnings.push(
              `Se omitieron ${droppedItemsCount} items incompletos. Completa manualmente si es necesario.`,
            )
          }
          setScanWarnings(mappedWarnings)
          setScanFromOcr(true)
          setScanStatus('idle')
          setScanProgress(null)
          setScanError(null)
          setScanModalOpen(true)
          setRescanConfirmOpen(false)
                scanStartRef.current = null
          toast.success('Lectura lista. Revisa y ajusta los datos.')
        } else if (status.status === 'failed') {
          window.clearInterval(scanPollRef.current!)
          scanPollRef.current = null
          setScanStatus('idle')
          setScanProgress(null)
          setScanError(status.failedReason ?? 'No se pudo procesar la factura.')
          scanStartRef.current = null
          toast.error(status.failedReason ?? 'No se pudo procesar la factura.')
        }
      } catch {
        window.clearInterval(scanPollRef.current!)
        scanPollRef.current = null
        setScanStatus('idle')
        setScanJobId(null)
        setScanProgress(null)
        const message = scanIsGuest
          ? 'El escaneo expiro en modo local. Vuelve a subir la factura.'
          : 'El escaneo expiro o no se pudo consultar el estado.'
        setScanError(message)
        scanStartRef.current = null
        toast.error(message)
      }
    }, 1500)
  }

  const startScan = async (file: File, useRescan: boolean) => {
    setError(null)
    setScanWarnings([])
    setScanFromOcr(false)
    setScanError(null)
    setScanProgress(null)
    setScanIsGuest(false)
    try {
      setScanStatus('uploading')
      const hasAuthToken =
        typeof window !== 'undefined' &&
        Boolean(window.localStorage.getItem('fairsplit_auth_token'))
      setScanIsGuest(!hasAuthToken)
      const jobId = useRescan && scanJobId
        ? (await rescanInvoiceApi(scanJobId, eventId, file)).jobId
        : (await scanInvoiceApi(eventId, file)).jobId
      setScanJobId(jobId)
      setScanStatus('processing')
      startPolling(jobId)
    } catch (scanError) {
      setScanStatus('idle')
      setScanJobId(null)
      setScanProgress(null)
      const message = (scanError as Error).message || 'No se pudo escanear la factura.'
      setScanError(message)
      scanStartRef.current = null
      if (message.toLowerCase().includes('limit')) {
        toast.error('Alcanzaste el limite de lecturas OCR. Intenta mas tarde.')
      } else {
        toast.error(message)
      }
    }
  }

  const detailInvoice = invoices.find((invoice) => invoice.id === detailInvoiceId) ?? null
  const participantShares = detailInvoice ? calculateShares(detailInvoice, people) : []
  const hasAuthToken =
    typeof window !== 'undefined' &&
    Boolean(window.localStorage.getItem('fairsplit_auth_token'))
  const isOcrConfirm = scanFromOcr && scanJobId && hasAuthToken && !editingInvoiceId
  const isScanning = scanStatus !== 'idle'
  const consumptionSum = useMemo(() => {
    if (divisionMethod !== 'consumption') return 0
    return roundToCents(items.reduce((acc, item) => acc + getItemTotal(item), 0))
  }, [divisionMethod, items])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = optionsMenuRef.current
      if (!menu || !menu.hasAttribute('open')) return
      const target = event.target as Node
      if (!menu.contains(target)) {
        menu.removeAttribute('open')
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (scanPollRef.current) {
        window.clearInterval(scanPollRef.current)
        scanPollRef.current = null
      }
      scanStartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!showForm) return
    const node = formRef.current
    if (!node) return
    const timeoutId = window.setTimeout(() => {
    }, 80)
    window.dispatchEvent(new CustomEvent('tour:invoice-form-open'))
    return () => window.clearTimeout(timeoutId)
  }, [showForm])

  const closeOptionsMenu = () => {
    optionsMenuRef.current?.removeAttribute('open')
  }

  const advanceTourStep = () => {
    if (!isTourOpen || tourMeta !== 'guided') return
    if (!steps || !setCurrentStep) return
    setCurrentStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const toggleConsumption = () => {
    setShowConsumption((current) => {
      const next = !current
      setDivisionMethod(next ? 'consumption' : 'equal')
      if (next) {
        setShowParticipants(true)
      }
      if (!next) {
        setItems([])
        setExpandedItems({})
        setItemModalOpen(false)
        setEditingItemId(null)
        setItemName('')
        setItemUnitPrice('')
        setItemQuantity('1')
        setItemParticipantIds([])
        setItemError(null)
        setError(null)
      }
      return next
    })
  }

  return (
    <>
      <InvoiceItemModal
        open={itemModalOpen}
        currency={currency}
        people={people}
        resolvedPayerId={resolvedPayerId}
        effectiveParticipantIds={effectiveParticipantIds}
        editingItemId={editingItemId}
        itemName={itemName}
        itemUnitPrice={itemUnitPrice}
        itemQuantity={itemQuantity}
        itemParticipantIds={itemParticipantIds}
        itemError={itemError}
        onItemNameChange={setItemName}
        onItemUnitPriceChange={setItemUnitPrice}
        onItemQuantityChange={setItemQuantity}
        onItemParticipantIdsChange={setItemParticipantIds}
        onErrorChange={setItemError}
        onClose={() => {
          setItemModalOpen(false)
          setItemError(null)
        }}
        onSave={(nextItem) => {
          setItems((current) => {
            if (editingItemId) {
              return current.map((item) =>
                item.id === editingItemId ? nextItem : item,
              )
            }
            return [...current, nextItem]
          })
          setItemModalOpen(false)
          setEditingItemId(null)
          setItemName('')
          setItemUnitPrice('')
          setItemQuantity('1')
          setItemParticipantIds([])
          setItemError(null)
        }}
      />

      <SectionCard
        title="Gastos"
        description="Registra cada gasto con su pagador y participantes. Elige reparto equitativo o por consumo real, con propina y invitado especial opcional."
        badge={`${invoices.length} gasto${invoices.length === 1 ? '' : 's'}`}
        action={
          invoices.length > 0 ? (
            <Badge variant="count">
              Total: {currency} {Math.round(totalAmount).toLocaleString('es-CO')}
            </Badge>
          ) : null
        }
      >
      <div className="space-y-5">
        <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/80 px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
          Registra cada gasto con pagador, participantes y tipo de reparto. Puedes
          incluir propina o invitado especial.
        </div>

        <div className="flex items-center justify-end">
          {showForm ? (
            editingInvoiceId ? null : (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowForm(false)}
              data-tour="invoice-close"
            >
              <X className="h-4 w-4" />
              Cerrar formulario
            </Button>
            )
          ) : (
            <div data-tour="invoice-add-menu">
              <ActionMenu
                label="Agregar gasto"
                align="right"
                items={[
                  {
                    label: 'Manual',
                    dataTour: 'invoice-add-manual',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => {
                      setShowForm(true)
                      setTimeout(() => {
                        advanceTourStep()
                      }, 100);
                    },
                  },
                  {
                    label: 'Escanear factura',
                    dataTour: 'invoice-add-scan',
                    icon: <Receipt className="h-4 w-4" />,
                    onClick: () => {
                      fileInputRef.current?.click()
                    },
                  },
                ]}
                renderTrigger={({ onClick, isOpen, ariaLabel, onKeyDown }) => (
                  <Button
                    type="button"
                    size="sm"
                    onClick={(event) => {
                      if (isScanning) {
                        event.preventDefault()
                        return
                      }
                      onClick(event)
                      if (!isOpen) {
                        setTimeout(() => {
                          advanceTourStep()
                        }, 100)
                      }
                    }}
                    onKeyDown={onKeyDown}
                    aria-label={ariaLabel}
                    aria-disabled={isScanning}
                    data-tour="invoice-add"
                    className={`gap-2 ${isScanning ? 'cursor-not-allowed opacity-60' : ''}`}
                    disabled={isScanning}
                  >
                    Agregar gasto
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            event.target.value = ''
            void startScan(file, Boolean(scanFromOcr))
          }}
        />
        <ScanProgressBanner status={scanStatus} progress={scanProgress} />

        {scanError && scanJobId ? (
          <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{scanError}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[color:var(--color-primary-main)] hover:text-[color:var(--color-primary-dark)]"
                onClick={async () => {
                  if (!scanJobId) return
                  try {
                    setScanError(null)
                    setScanStatus('processing')
                    const next = await retryScanApi(scanJobId)
                    setScanJobId(next.jobId)
                    startPolling(next.jobId)
                  } catch (error) {
                    setScanStatus('idle')
                    setScanError((error as Error).message || 'No se pudo reintentar el OCR.')
                  }
                }}
              >
                Reintentar
              </Button>
            </div>
          </div>
        ) : null}

        <OcrDecisionModal
          open={scanFromOcr && scanModalOpen}
          warnings={scanWarnings}
          description={description}
          currency={currency}
          amount={amount}
          includeTip={includeTip}
          tipAmount={tipAmount}
          items={items}
          divisionMethod={divisionMethod}
          scanIsGuest={scanIsGuest}
          rescanConfirmOpen={rescanConfirmOpen}
          onSelectEqual={() => {
            setDivisionMethod('equal')
            setShowConsumption(false)
            setScanModalOpen(false)
            setRescanConfirmOpen(false)
          }}
          onSelectConsumption={() => {
            setDivisionMethod('consumption')
            setShowConsumption(true)
            setShowParticipants(true)
            setScanModalOpen(false)
            setRescanConfirmOpen(false)
          }}
          onOpenRescanConfirm={() => setRescanConfirmOpen(true)}
          onCancelRescan={() => setRescanConfirmOpen(false)}
          onConfirmRescan={() => {
            setRescanConfirmOpen(false)
            setScanModalOpen(false)
            fileInputRef.current?.click()
          }}
        />

        {showForm ? (
          <div
            className="animate-fade-in rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4"
            data-tour="invoice-form"
            ref={formRef}
          >
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
              {divisionMethod === 'consumption' ? (
                <div className="md:col-span-4">
                  {items.length === 0 ? (
                    <p className="mt-2">No se detectaron items. Puedes agregarlos manualmente.</p>
                  ) : null}
                </div>
              ) : null}
              <Input
                placeholder="Concepto del gasto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="md:col-span-2"
                data-tour="invoice-description"
              />
              <div className="flex items-center md:col-span-2">
                <div className="flex w-full items-center rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-input)] focus-within:border-[color:var(--color-primary-main)] focus-within:ring-1 focus-within:ring-[color:var(--color-focus-ring)]">
                  <span className="flex h-10 items-center rounded-l-md border border-[color:var(--color-border-subtle)] border-r-0 bg-[color:var(--color-surface-muted)] px-3 text-xs font-semibold text-[color:var(--color-text-muted)]">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Monto"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full appearance-none rounded-r-md border-0 bg-transparent px-3 text-sm text-[color:var(--color-text-main)] outline-none focus:outline-none focus-visible:ring-0"
                    data-tour="invoice-amount"
                  />
                </div>
              </div>


            <Select
              value={resolvedPayerId || undefined}
              onValueChange={handlePayerChange}
              disabled={people.length === 0}
            >
              <SelectTrigger data-tour="invoice-payer">
                <SelectValue placeholder="Selecciona pagador" />
              </SelectTrigger>
              <SelectContent data-tour="invoice-payer-options" data-tour-select-content>
                {people.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    No hay personas
                  </SelectItem>
                ) : (
                  people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      Pago: {person.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {(includeTip || birthdayEnabled || showParticipants || showConsumption) ? (
              <span className="hidden" data-tour="invoice-advanced" />
            ) : null}

            {includeTip ? (
              <div className="md:col-span-2 space-y-2">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  Propina
                </p>
                <div className="flex items-center">
                  <div className="flex w-full items-center rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-input)] focus-within:border-[color:var(--color-primary-main)] focus-within:ring-1 focus-within:ring-[color:var(--color-focus-ring)]">
                    <span className="flex h-10 items-center rounded-l-md border border-[color:var(--color-border-subtle)] border-r-0 bg-[color:var(--color-surface-muted)] px-3 text-xs font-semibold text-[color:var(--color-text-muted)]">
                      {currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Monto de la propina"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="w-full appearance-none rounded-r-md border-0 bg-transparent px-3 text-sm text-[color:var(--color-text-main)] outline-none focus:outline-none focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {birthdayEnabled ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  Invitado especial
                </p>
                <Select
                  value={birthdayPersonId || undefined}
                  onValueChange={setBirthdayPersonId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona invitado especial" />
                  </SelectTrigger>
                  <SelectContent data-tour-select-content>
                    {birthdayOptions.map((id) => (
                      <SelectItem key={id} value={id}>
                        {resolvePersonName(id, people)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {showParticipants ? (
              <div className="md:col-span-4 space-y-2" data-tour="invoice-participants">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  Personas incluidas
                </p>
                <div className="flex flex-wrap gap-2">
                  {people.length === 0 ? (
                    <span className="text-sm text-[color:var(--color-text-muted)]">
                      Agrega personas para asignar participantes.
                    </span>
                  ) : (
                    people.map((person) => {
                      const checked = sanitizedParticipantIds.includes(person.id)
                      const isPayer = person.id === resolvedPayerId
                      return (
                        <MemberChip
                          key={person.id}
                          name={person.name}
                          isPayer={isPayer}
                          isSelected={checked}
                          isEditable
                          onToggle={
                            isPayer ? undefined : () => handleToggleParticipant(person.id)
                          }
                        />
                      )
                    })
                  )}
                </div>
              </div>
            ) : null}

            {showConsumption ? (
              <ConsumptionItemsSection
                currency={currency}
                people={people}
                items={items}
                expandedItems={expandedItems}
                effectiveParticipantIds={effectiveParticipantIds}
                consumptionSum={consumptionSum}
                onToggleExpanded={(itemId) =>
                  setExpandedItems((current) => ({
                    ...current,
                    [itemId]: !current[itemId],
                  }))
                }
                onEditItem={(item) => {
                  const nextParticipants = item.participantIds.filter((id) =>
                    effectiveParticipantIds.includes(id),
                  )
                  setEditingItemId(item.id)
                  setItemName(item.name)
                  setItemUnitPrice(String(item.unitPrice))
                  setItemQuantity(String(item.quantity))
                  setItemParticipantIds(nextParticipants)
                  setItemError(null)
                  setItemModalOpen(true)
                }}
                onRemoveItem={(itemId) =>
                  setItems((current) => current.filter((entry) => entry.id !== itemId))
                }
                onAddItem={() => {
                  setEditingItemId(null)
                  setItemName('')
                  setItemUnitPrice('')
                  setItemQuantity('1')
                  setItemParticipantIds([])
                  setItemError(null)
                  setItemModalOpen(true)
                }}
                resolvePersonName={resolvePersonName}
                getItemTotal={getItemTotal}
                buildItemShares={buildItemShares}
              />
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="md:col-span-4 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              {scanFromOcr ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setScanModalOpen(true)}
                >
                  Ver resumen de la lectura
                </Button>
              ) : null}
              <details className="relative w-full sm:w-auto" ref={optionsMenuRef}>
                <summary
                  className="flex w-full cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 text-xs font-semibold text-[color:var(--color-text-muted)] hover:border-[color:var(--color-primary-light)] hover:text-[color:var(--color-text-main)] sm:ml-auto sm:w-32 sm:inline-flex"
                  data-tour="invoice-advanced-toggle"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Opciones
                </summary>
                <div className="absolute left-0 right-0 z-10 mt-2 w-full rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-2 shadow-md sm:left-auto sm:right-0 sm:w-52">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setIncludeTip((current) => {
                        const next = !current
                        if (!next) setTipAmount('')
                        setError(null)
                        closeOptionsMenu()
                        return next
                      })
                    }
                    className={`w-full justify-between text-xs font-semibold ${
                      includeTip
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                    }`}
                  >
                    Propina
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setBirthdayEnabled((current) => {
                        const next = !current
                        if (!next) setBirthdayPersonId('')
                        setError(null)
                        closeOptionsMenu()
                        return next
                      })
                    }
                    className={`w-full justify-between text-xs font-semibold ${
                      birthdayEnabled
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                    }`}
                  >
                    Invitado especial
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowParticipants((current) => {
                        const next = !current
                        if (!next) setError(null)
                        return next
                      })
                      closeOptionsMenu()
                    }}
                    className={`w-full justify-between text-xs font-semibold ${
                      showParticipants
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                    }`}
                  >
                    Participantes
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleConsumption()
                      closeOptionsMenu()
                    }}
                    className={`w-full justify-between text-xs font-semibold ${
                      showConsumption
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                    }`}
                  >
                    Consumo
                  </Button>
                </div>
              </details>
              {editingInvoiceId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[color:var(--color-primary-main)] hover:text-[color:var(--color-primary-dark)]"
                  onClick={resetForm}
                >
                  Cancelar edicion
                </Button>
              ) : null}
              {isOcrConfirm ? (
                <span className="text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                  Confirma la lectura para guardar el gasto.
                </span>
              ) : null}
              <Button
                type="submit"
                disabled={people.length === 0 || isScanning}
                data-tour="invoice-save"
                className="w-full sm:w-44"
              >
                <Save className="h-4 w-4" />
                {editingInvoiceId
                  ? 'Guardar cambios'
                  : isOcrConfirm
                  ? 'Confirmar lectura'
                  : 'Guardar gasto'}
              </Button>
            </div>
          </form>
        </div>
        ) : null}

        {editingInvoiceId ? (
          <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
            <span>Editando gasto seleccionado.</span>
          </div>
        ) : null}
        <InvoiceList
          invoices={invoices}
          currency={currency}
          people={people}
          detailInvoiceId={detailInvoiceId}
          detailInvoice={detailInvoice}
          participantShares={participantShares}
          onToggleDetail={(invoiceId) =>
            setDetailInvoiceId((current) => (current === invoiceId ? null : invoiceId))
          }
          onCloseDetail={() => setDetailInvoiceId(null)}
          onEdit={startEdit}
          onRemove={onRemove}
          resolvePersonName={resolvePersonName}
          getItemTotal={getItemTotal}
        />
      </div>
      </SectionCard>
    </>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}

function getItemTotal(item: InvoiceItem) {
  return roundToCents(item.unitPrice * item.quantity)
}

function buildItemShares(item: InvoiceItem) {
  const participants = item.participantIds
  if (participants.length === 0) return []
  const total = getItemTotal(item)
  const rawShare = total / participants.length
  const share = roundToCents(rawShare)
  const totalRounded = roundToCents(share * participants.length)
  const diff = roundToCents(total - totalRounded)
  return participants.map((personId, index) => ({
    personId,
    amount: roundToCents(share + (index === participants.length - 1 ? diff : 0)),
  }))
}

function buildConsumptionsFromItems(items: InvoiceItem[], participantIds: string[]) {
  const base = participantIds.reduce<Record<string, number>>((acc, id) => {
    acc[id] = 0
    return acc
  }, {})
  return items.reduce<Record<string, number>>((acc, item) => {
    buildItemShares(item).forEach((share) => {
      acc[share.personId] = roundToCents((acc[share.personId] ?? 0) + share.amount)
    })
    return acc
  }, base)
}

function calculateShares(invoice: InvoiceForUI, people: PersonForUI[]) {
  const participantIds = invoice.participantIds
  if (participantIds.length === 0) return []
  const tip = roundToCents(invoice.tipAmount ?? 0)
  const tipReceivers = invoice.birthdayPersonId
    ? participantIds.filter((id) => id !== invoice.birthdayPersonId)
    : participantIds
  const tipShare =
    tipReceivers.length > 0 ? roundToCents(tip / tipReceivers.length) : 0
  const tipTotalRounded = roundToCents(tipShare * tipReceivers.length)
  const tipDiff = roundToCents(tip - tipTotalRounded)
  const birthdayPersonId = invoice.birthdayPersonId

  if (invoice.divisionMethod === 'consumption') {
    const consumptions = invoice.consumptions ?? {}
    const rounded = participantIds.map((id) =>
      roundToCents(Number(consumptions[id] ?? 0)),
    )
    const totalRounded = roundToCents(rounded.reduce((acc, val) => acc + val, 0))
    const diff = roundToCents(invoice.amount - totalRounded)
    const adjustedBases = rounded.map((base, index) =>
      roundToCents(base + (index === participantIds.length - 1 ? diff : 0)),
    )
    const withBirthday = redistributeBirthdayShares(
      adjustedBases,
      participantIds,
      birthdayPersonId,
    )

    return participantIds.map((personId, index) => {
      const adjustedBase = withBirthday[index] ?? 0
      const adjustedTip = buildTipPortion(
        personId,
        tipReceivers,
        tipShare,
        tipDiff,
      )
      return {
        personId,
        amount: roundToCents(adjustedBase + adjustedTip),
        tipPortion: adjustedTip,
        name: resolvePersonName(personId, people),
        isBirthday: personId === birthdayPersonId,
      }
    })
  }

  const count = participantIds.length
  const rawShare = invoice.amount / count
  const share = roundToCents(rawShare)
  const totalRounded = roundToCents(share * count)
  const diff = roundToCents(invoice.amount - totalRounded)
  const adjustedBases = participantIds.map((_, index) =>
    index === participantIds.length - 1 ? roundToCents(share + diff) : share,
  )
  const withBirthday = redistributeBirthdayShares(
    adjustedBases,
    participantIds,
    birthdayPersonId,
  )

  return participantIds.map((personId, index) => {
    const adjusted = withBirthday[index] ?? 0
    const adjustedTip = buildTipPortion(personId, tipReceivers, tipShare, tipDiff)
    return {
      personId,
      amount: roundToCents(adjusted + adjustedTip),
      tipPortion: adjustedTip,
      name: resolvePersonName(personId, people),
      isBirthday: personId === birthdayPersonId,
    }
  })
}

const roundToCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100

function redistributeBirthdayShares(
  baseShares: number[],
  participants: string[],
  birthdayPersonId?: string,
) {
  if (!birthdayPersonId) return baseShares
  const birthdayIndex = participants.findIndex((id) => id === birthdayPersonId)
  if (birthdayIndex === -1 || participants.length <= 1) return baseShares

  const updated = [...baseShares]
  const birthdayBase = updated[birthdayIndex] ?? 0
  updated[birthdayIndex] = 0

  const others = participants.filter((id) => id !== birthdayPersonId)
  const perOther = roundToCents(birthdayBase / others.length)
  const totalRounded = roundToCents(perOther * others.length)
  const diff = roundToCents(birthdayBase - totalRounded)

  others.forEach((id, idx) => {
    const target = participants.indexOf(id)
    updated[target] = roundToCents(
      (updated[target] ?? 0) + perOther + (idx === others.length - 1 ? diff : 0),
    )
  })

  return updated
}

function buildTipPortion(
  personId: string,
  tipReceivers: string[],
  tipShare: number,
  tipDiff: number,
) {
  if (!tipReceivers.includes(personId)) return 0
  const isLastTip =
    tipReceivers.length > 0 &&
    personId === tipReceivers[tipReceivers.length - 1]
  return roundToCents(tipShare + (isLastTip ? tipDiff : 0))
}
