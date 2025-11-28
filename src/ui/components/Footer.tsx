export function Footer() {
  return (
    <footer className="mt-10 border-t border-[color:var(--color-border-subtle)] pt-4 text-sm text-[color:var(--color-text-muted)]">
      <p>
        © {new Date().getFullYear()} FairSplit · Creado por{' '}
        <a
          href="https://itzkevindev.tech"
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:text-primary-400"
        >
          itzkevindev.tech
        </a>
      </p>
    </footer>
  )
}
