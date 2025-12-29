import { Link } from 'react-router-dom'
import { buttonVariants } from '../../components/ui/button'
import { ThemeToggle } from '../components/ThemeToggle'

type NotFoundPageProps = {
  message?: string
}

export default function NotFoundPage({ message }: NotFoundPageProps) {
  return (
    <main className="min-h-screen bg-[color:var(--color-app-bg)] text-[color:var(--color-text-main)]">
      <div className="flex items-center justify-end px-6 pt-8 pb-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-3xl flex-col items-center justify-center px-6 pb-16 text-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary-600">
            4 0 4
          </p>
          <h1 className="text-3xl font-semibold text-[color:var(--color-text-main)] sm:text-4xl">
            Pagina no encontrada
          </h1>
          <p className="max-w-md text-sm text-[color:var(--color-text-muted)]">
            {message ??
              'No pudimos encontrar la ruta solicitada. Vuelve al inicio para seleccionar un evento.'}
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className={buttonVariants({ variant: 'default', size: 'lg' })}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
