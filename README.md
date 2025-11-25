# FairSplit

Bootstrap inicial del proyecto para dividir gastos entre amigos. Primera versión solo front-end en memoria, lista para crecer con arquitectura limpia.

## Stack
- Vite + React + TypeScript
- Tailwind CSS
- ESLint + Prettier
- Vitest + Testing Library (entorno `jsdom`)

## Requisitos
- Node 18+
- npm (incluido con Node)

## Scripts
- `npm install` — instala dependencias.
- `npm run dev` — arranca el servidor de desarrollo.
- `npm run lint` — corre ESLint.
- `npm run test` — corre Vitest en modo CLI.
- `npm run build` — build de producción (incluye chequeo de tipos).

## Notas de arquitectura
- La lógica de dominio y casos de uso se mantendrá desacoplada de React para poder conectar un backend más adelante sin reescribir la UI.
- En esta iteración todo el estado vive en memoria; la capa de infraestructura tendrá repositorios en memoria como primer paso.

## Próximos pasos
- Armar estructura de carpetas por capas (domain / application / infra / ui).
- Añadir Zustand para estado in-memory alineado al dominio.
- Configurar CI en GitHub Actions con lint + test + build y despliegue en Vercel.
