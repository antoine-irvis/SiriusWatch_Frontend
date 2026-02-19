# SiriusWatch Frontend

## What is this project?

SiriusWatch is a **customisable inspection and quality control software** built for industrial robotic inspection systems. It is designed to be adapted to different use cases — typically a **5-DOF robot arm** equipped with cameras (hand-eye, top-down, microscope, thermal) performing automated visual inspection and testing of manufactured parts (PCBs, assemblies, etc.). The software is used by the operator or client to configure, run, and review inspections.

**This is the frontend only.** There is no backend — all data is mocked. The app is intended to eventually connect to a real robot + camera system via API.

## Tech Stack

- **React 19** + **Vite 7** (ESM-only, `"type": "module"`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — **no `tailwind.config.js`**, styles imported via `@import "tailwindcss"` in `src/index.css`
- **React Router v7** (flat route API, `<BrowserRouter>` + `<Routes>`)
- **Recharts 3** for charts (AreaChart, ComposedChart, PieChart)
- **Lucide React** for all icons
- **No TypeScript** — plain JavaScript/JSX throughout
- **No global state library** — all state is local `useState`/`useRef`/`useMemo`
- **localStorage** used only in CalibrationPage for persistence

## Project Structure

```
src/
├── main.jsx                    # ReactDOM root + BrowserRouter
├── App.jsx                     # Route definitions (all under AppShell)
├── index.css                   # Tailwind import + Inter font + base styles
├── assets/                     # Logo, images
├── data/
│   ├── mockData.js             # All mock data exports
│   └── navItems.js             # Sidebar navigation config
├── components/
│   ├── layout/                 # AppShell, Sidebar, TopBar
│   ├── ui/                     # Card, Button, DonutChart, StatusBadge
│   ├── dashboard/              # Inspection widgets (viewers, charts, panels)
│   └── calibration/            # CalibrationWizard modal
└── pages/                      # One file per route
    ├── InspectionPage.jsx      # Main inspection workspace
    ├── ResultsPage.jsx         # Historical results + analytics
    ├── ProductPage.jsx         # Product info + custom fields
    ├── CalibrationPage.jsx     # Camera + hand-eye calibration
    ├── EnvironmentSetupPage.jsx# Robot + sensor configuration
    ├── ManualControlPage.jsx   # Robot jog, gripper, positions
    └── SettingsPage.jsx        # Placeholder
```

## Routes

| Path | Page | Status |
|------|------|--------|
| `/` | Redirects to `/inspection` | |
| `/product` | ProductPage | Complete |
| `/inspection` | InspectionPage | Complete |
| `/environment` | EnvironmentSetupPage | Complete |
| `/calibration` | CalibrationPage | Complete |
| `/manual-control` | ManualControlPage | Complete |
| `/results` | ResultsPage | Complete |
| `/settings` | SettingsPage | Stub/placeholder |

## Design System

### Theme: Dark Glassmorphism

- **Background**: `bg-gray-950` (#030712)
- **Surfaces**: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl`
- **Font**: Inter (Google Fonts, weights 300–700), `-webkit-font-smoothing: antialiased`
- **All text is white with varying opacity** — primary `text-white/90`, muted `text-white/40`, disabled `text-white/20`

### Color Palette

| Color | Token | Usage |
|-------|-------|-------|
| Blue | `blue-400`/`blue-500` | Primary accent, active states, links |
| Emerald | `emerald-400`/`emerald-500` | Pass, success, connected |
| Rose | `rose-400`/`rose-500` | Fail, danger, E-stop |
| Amber | `amber-400`/`amber-500` | Warning, paused, caution |
| Purple | `purple-400`/`purple-500` | Gripper, hand-eye calibration |

### Key UI Components

- **Card** (`ui/Card.jsx`): Glassmorphism container. Used everywhere. Has hover brightening.
- **Button** (`ui/Button.jsx`): `rounded-full` pill with variants: `primary` (blue gradient), `secondary`, `success`, `danger`. Lift-on-hover effect.
- **StatusBadge** (`ui/StatusBadge.jsx`): Inline pill for pass/fail/warning.
- **DonutChart** (`ui/DonutChart.jsx`): SVG ring chart via Recharts.

## Critical Tailwind v4 Rules

1. **NO dynamic class interpolation.** Tailwind v4 cannot detect `bg-${color}-500`. Always use full static class strings. Use lookup objects:
   ```js
   const colorMap = { pass: 'bg-emerald-500', fail: 'bg-rose-500' }
   // then: className={colorMap[status]}
   ```

2. **Fractional opacity with arbitrary values** is used extensively: `bg-white/[0.03]`, `bg-white/[0.07]`, etc.

3. **No `tailwind.config.js`** — Tailwind v4 uses the Vite plugin directly. Custom values are done via arbitrary syntax `[...]`.

## Code Conventions

- **File naming**: PascalCase for components, camelCase for data/utility files
- **All components use default export**
- **Sub-components** are defined in the same file (not exported), e.g. `SegmentToggle`, `JogButton`, `CameraFeed`
- **Constants**: UPPER_SNAKE_CASE for module-level arrays/objects (`TESTS`, `CAMERAS`, `POINTS`)
- **Color/style lookup tables**: Object literals keyed by status (`statusColor`, `statusBg`, `priorityColors`)
- **Timer callbacks use `useRef`** to avoid stale closures (pattern: `statusRef.current` checked inside `setTimeout`)
- **File export pattern**: `Blob` → `URL.createObjectURL` → programmatic `<a>` click → `revokeObjectURL`
- **Inline SVG** for all diagrams (PCB schematics, calibration visuals, gauges)
- **No TypeScript, no PropTypes, no JSDoc** — keep it lightweight
- **No barrel files / index re-exports** — direct relative imports

## Layout Architecture

- **AppShell**: Fixed sidebar (w-64, left) + sticky TopBar + `<Outlet />` main content
- **Sidebar**: Glass panel with logo, nav links (from `navItems.js`), robot status indicator
- **TopBar**: `sticky top-0`, shows current page title + notification bell + avatar
- **Main content**: `flex-1 p-4 md:p-6`, pages handle their own internal layout
- **Full-page pattern**: `min-h-[calc(100vh-7rem)]` with `flex flex-col` to fill the viewport

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```
