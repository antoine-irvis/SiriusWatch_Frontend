import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import ProductPage from './pages/ProductPage'
import InspectionPage from './pages/InspectionPage'
import EnvironmentSetupPage from './pages/EnvironmentSetupPage'
import CalibrationPage from './pages/CalibrationPage'
import ManualControlPage from './pages/ManualControlPage'
import ResultsPage from './pages/ResultsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/inspection" element={<InspectionPage />} />
        <Route path="/environment" element={<EnvironmentSetupPage />} />
        <Route path="/calibration" element={<CalibrationPage />} />
        <Route path="/manual-control" element={<ManualControlPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
