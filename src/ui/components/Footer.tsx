export function Footer() {
  return (
    <footer className="mt-12 border-t border-[color:var(--color-border-subtle)] py-6 text-sm text-[color:var(--color-text-muted)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-2 px-6 text-center">
        <p>
          (c) {new Date().getFullYear()} FairSplit - Creado por{' '}
          <a
            href="https://itzkevindev.tech"
            target="_blank"
            rel="noreferrer"
            className="text-[color:var(--color-primary-main)] hover:text-[color:var(--color-primary-light)]"
          >
            itzkevindev.tech
          </a>
        </p>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          Divide gastos entre amigos con claridad.
        </span>
      </div>
    </footer>
  )
}
