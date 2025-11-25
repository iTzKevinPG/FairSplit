function App() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
            FairSplit
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Divide gastos entre amigos sin dolores de cabeza.
          </h1>
          <p className="max-w-3xl text-base text-slate-600">
            Ingresa eventos, facturas, pagadores y participantes. Calculamos
            saldos netos y sugerimos las transferencias para cerrar cuentas con
            confianza. Todo en memoria en esta primera versión.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">
              MVP en camino
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Gestiona eventos con moneda y lista de participantes.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Registra facturas con pagador y participantes.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Calcula saldos netos y transferencias sugeridas.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">
              Próximos pasos
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              Configura la arquitectura limpia: dominio + casos de uso +
              infraestructura en memoria + UI con React y Zustand. Lista para
              conectar un backend cuando llegue el momento.
            </p>
          </div>
        </section>

        <footer className="text-sm text-slate-500">
          Iteración 1: bootstrap del proyecto con Vite, Tailwind, ESLint,
          Prettier y pruebas listas con Vitest.
        </footer>
      </div>
    </main>
  )
}

export default App
