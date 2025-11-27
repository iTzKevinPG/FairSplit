# FairSplit

Mini app para dividir gastos entre amigos. Primera version solo front-end, estado en memoria y arquitectura lista para conectar un backend luego.

## Stack
- Vite + React + TypeScript
- Tailwind CSS
- Zustand para estado global
- ESLint + Prettier
- Vitest + Testing Library (jsdom)

## Scripts
- `npm install` - instala dependencias.
- `npm run dev` - servidor de desarrollo Vite.
- `npm run lint` - ESLint.
- `npm run test` - Vitest en CLI.
- `npm run build` - build de produccion (incluye chequeo de tipos).
- `npm run preview` - sirve el build localmente.

## Estructura de carpetas
```
src/
  app/                 # (futuro) providers/router
  application/         # casos de uso y puertos
    dto/               # DTOs de entrada
    ports/             # interfaces de repositorio
    use-cases/         # orquestacion de dominio
  domain/              # modelos y servicios de negocio puros
    services/          # reglas de negocio (saldos, transfers)
  infra/               # adaptadores concretos (in-memory, http)
    persistence/in-memory/
  shared/              # utilidades y tipos compartidos
  state/               # store global (Zustand) que usa casos de uso
  ui/                  # componentes y paginas React
    components/
    pages/
  main.tsx             # entrypoint Vite/React
```

## Arquitectura en limpio
- **Domain**: entidades (`Event`, `Person`, `Invoice`, `Balance`, `SettlementTransfer`) y servicios puros (`calculateBalances`, `suggestTransfers`).
- **Application**: casos de uso (`createEvent`, `addPersonToEvent`, `addInvoiceToEvent`, `calculateSettlement`, etc.) que usan puertos (`EventRepository`).
- **Infra**: implementaciones concretas de los puertos. En V1 solo `InMemoryEventRepository`, listo para ser reemplazado por HTTP/DB.
- **UI**: componentes React que interactuan con el store. El store orquesta casos de uso y mantiene el estado de la vista.

## Despliegue y CI
- Hosting sugerido: **Vercel** (SPA de Vite lista para previews por PR).
- CI en GitHub Actions: job basico `lint + test + build` en cada push/PR. (Se puede añadir un workflow en `.github/workflows/ci.yml` con Node 18+, `npm ci`, `npm run lint`, `npm run test`, `npm run build`).

## Como correr en local
1) Node 18+ y npm.
2) Instala deps: `npm install`
3) Corre dev server: `npm run dev` y abre la URL que muestra Vite.

## Notas rapidas
- Todo el estado vive en memoria; el repositorio in-memory implementa la interfaz de dominio para facilitar swap por una API.
- Reparto de facturas igualitario en V1. Saldos netos y transferencias sugeridas se calculan a partir de deudores/acreedores.
- El store de Zustand expone acciones alineadas a casos de uso; la UI no conoce detalles de persistencia.
