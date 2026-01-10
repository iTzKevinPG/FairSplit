import type { ReactNode } from 'react'
import { Button } from '../../shared/components/ui/button'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabNavProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function TabNav({ tabs, activeTab, onTabChange, className }: TabNavProps) {
  const baseClass = 'no-scrollbar flex gap-2 overflow-x-auto pb-1'
  const wrapperClass = className ? `${baseClass} ${className}` : baseClass

  return (
    <div className={wrapperClass}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <Button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={`shrink-0 ${isActive ? 'ring-1 ring-[color:var(--color-primary-light)] ring-offset-0' : ''}`}
            data-tour-tab={tab.id}
          >
            {tab.icon}
            {tab.label}
          </Button>
        )
      })}
    </div>
  )
}
