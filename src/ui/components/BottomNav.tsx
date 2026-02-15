import type { ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  shortLabel?: string
  icon?: ReactNode
}

interface BottomNavProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function BottomNav({ tabs, activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)]/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="tablist"
      aria-label="Navegación principal"
      data-tour="tab-nav-mobile"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold
                transition-all duration-150
                ${
                  isActive
                    ? 'text-[color:var(--color-primary-main)]'
                    : 'text-[color:var(--color-text-muted)] active:scale-95'
                }
              `}
            >
              {isActive && (
                <span
                  className="absolute left-1/2 top-0 h-[3px] w-10 -translate-x-1/2 rounded-b-full bg-[color:var(--color-primary-main)]"
                  aria-hidden="true"
                />
              )}
              <span
                className={`
                  flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150
                  ${isActive ? 'bg-[color:var(--color-primary-soft)] scale-105' : ''}
                  [&_svg]:h-[18px] [&_svg]:w-[18px]
                `}
              >
                {tab.icon}
              </span>
              <span className="truncate max-w-[56px]">
                {tab.shortLabel ?? tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
