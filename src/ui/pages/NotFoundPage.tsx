import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'

type NotFoundPageProps = {
  message?: string
}

export default function NotFoundPage({ message }: NotFoundPageProps) {
  return (
    <main className="min-h-screen bg-[color:var(--color-app-bg)] text-[color:var(--color-text-main)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16 text-center">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">404</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Página no encontrada</h1>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            {message ??
              'No pudimos encontrar la ruta solicitada. Vuelve al inicio para seleccionar un evento.'}
          </p>
        </div>
        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
