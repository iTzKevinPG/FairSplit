import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../shared/hooks/useTheme'
import { Button } from '../../components/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="toggle"
      size="sm"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
    </Button>
  )
}
