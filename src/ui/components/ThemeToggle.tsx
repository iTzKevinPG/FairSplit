import { useTheme } from '../../shared/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="ds-btn ds-btn-secondary !py-2 !px-3 text-xs"
      aria-label="Cambiar tema"
    >
      {isDark ? 'Modo claro' : 'Modo oscuro'}
    </button>
  )
}
