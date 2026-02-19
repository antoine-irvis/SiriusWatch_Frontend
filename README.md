# SiriusWatch

**Customisable inspection & quality control dashboard for robotic systems.**

SiriusWatch is a modern web interface designed for industrial inspection workflows. It connects to robot arms (typically 5-DOF) equipped with multiple cameras to perform automated visual inspection and quality control on manufactured parts.

The software is built to be adaptable — configure it for different products, inspection sequences, robot setups, and camera systems depending on the use case.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

## Features

### Inspection
- **Multi-camera feed** — switch between main camera, hand-eye, microscope, and thermal views with live overlays
- **Interactive test point selection** — click components on the PCB map to choose where to inspect
- **Inspection sequence runner** — select inspection types, start/pause/stop, real-time progress and logs
- **Export results** as JSON

### Calibration
- **Camera calibration wizard** — 5-step guided flow with simulated camera feed, image capture gallery, coverage heatmap, reprojection error gauge, and distortion comparison
- **Hand-eye calibration wizard** — robot pose recording, transform matrix computation, rotation/translation error verification
- **Calibration history** with localStorage persistence, stale warnings, and import/export

### Manual Control
- **Jog controls** — Cartesian (X/Y/Z) and Joint (J1–J6) modes with configurable step sizes
- **Gripper control** — animated open/close visual with adjustable force
- **Position management** — save, name, and recall positions
- **Freedrive mode** and **E-Stop** with visual feedback
- **Speed slider** and coordinate frame selection (World/Base/Tool)

### Results & Analytics
- **Historical inspection table** — sortable, filterable, with expandable row details showing per-test results vs thresholds
- **Stats overview** — total inspections, pass rate, avg cycle time, top failure mode
- **Failure breakdown** — ranked bar chart of most common failures
- **Pass/fail distribution** — visual timeline of recent runs
- **Export filtered results** as JSON

### Configuration
- **Product information** — custom fields, import/export product definitions
- **Environment setup** — robot and sensor catalog with 40+ robot models and 15+ sensor models, configurable parameters per device

## Screenshots

*Coming soon*

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-username/SiriusWatch_Frontend.git
cd SiriusWatch_Frontend
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` (or next available port).

### Production Build

```bash
npm run build
npm run preview
```

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [Vite](https://vite.dev) | 7 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first CSS |
| [React Router](https://reactrouter.com) | 7 | Client-side routing |
| [Recharts](https://recharts.org) | 3 | Charts & data visualization |
| [Lucide React](https://lucide.dev) | 0.563 | Icon set |

## Project Structure

```
src/
├── main.jsx                     # App entry point
├── App.jsx                      # Route definitions
├── index.css                    # Global styles + Tailwind
├── data/                        # Mock data & navigation config
├── components/
│   ├── layout/                  # AppShell, Sidebar, TopBar
│   ├── ui/                      # Card, Button, DonutChart, StatusBadge
│   ├── dashboard/               # Inspection widgets & viewers
│   └── calibration/             # Calibration wizard modal
└── pages/
    ├── InspectionPage.jsx       # Camera feed + test points + sequence runner
    ├── ResultsPage.jsx          # Historical results & analytics
    ├── CalibrationPage.jsx      # Camera & hand-eye calibration
    ├── ManualControlPage.jsx    # Robot jog & gripper control
    ├── ProductPage.jsx          # Product configuration
    ├── EnvironmentSetupPage.jsx # Robot & sensor setup
    └── SettingsPage.jsx         # Settings (placeholder)
```

## Design

Dark glassmorphism theme with frosted glass surfaces, subtle borders, and a blue/emerald/rose/amber color system for status indication.

- **Background**: Near-black (`gray-950`)
- **Surfaces**: Semi-transparent white with backdrop blur
- **Font**: Inter
- **Status colors**: Emerald = pass, Rose = fail, Amber = warning, Blue = active/primary

## Roadmap

- [ ] Backend API integration (robot control, camera streams, test execution)
- [ ] Real camera feed via WebRTC/MJPEG
- [ ] User authentication & role-based access
- [ ] Report generation (PDF export)
- [ ] Settings page implementation
- [ ] Multi-language support
- [ ] Real-time WebSocket updates during inspection

## License

This project is proprietary. All rights reserved.
