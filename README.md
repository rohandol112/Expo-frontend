# Expo Frontend

React + Vite + TypeScript frontend application.

## Tech Stack

- **Framework**: React 19
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **Build Tool**: Vite
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Routing**: React Router v7
- **Notifications**: Sonner

## Project Structure

```
src/
├── components/      # Reusable UI components (ui/ holds shadcn components)
├── constants/       # App-wide constants (routes, permissions, etc.)
├── hooks/           # Custom React hooks
├── layouts/         # Layout components used by the router
├── lib/             # Shared utilities, http client, api endpoints
├── pages/           # Route-level page components
├── router/          # React Router config
├── services/        # API service modules
├── store/           # Zustand stores
├── styles/          # Page/feature-specific CSS
├── types/           # Shared TypeScript types
├── utils/           # Pure helper functions
├── validations/     # Zod schemas
├── App.tsx          # Root component
├── main.tsx         # Entry point
└── index.css        # Tailwind + global styles
```

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in values
npm run dev
```

## Scripts

- `npm run dev` — start dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview production build
- `npm run lint` — run ESLint
- `npm run format` — format with Prettier

## Adding shadcn components

```bash
npx shadcn@latest add button input dialog
```
