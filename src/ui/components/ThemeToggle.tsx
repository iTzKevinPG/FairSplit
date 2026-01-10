import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../shared/hooks/useTheme'
import { Button } from '../../shared/components/ui/button'

interface ThemeToggleProps {
  showLabelOnMobile?: boolean
}

export function ThemeToggle({ showLabelOnMobile = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className={showLabelOnMobile ? 'inline' : 'hidden sm:inline'}>
        {isDark ? 'Modo claro' : 'Modo oscuro'}
      </span>
    </Button>
  )
}
