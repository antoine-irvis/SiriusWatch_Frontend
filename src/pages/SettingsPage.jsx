import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Settings, User, Bell, Shield, Database, Palette } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="col-span-full">
        <div className="flex items-center gap-3 mb-4">
          <Settings size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white/90">Settings</h3>
        </div>
        <p className="text-sm text-white/50">
          App preferences, user profiles, and system configuration.
        </p>
      </Card>

      {[
        { icon: User, label: 'User Profile', desc: 'Name, role, and preferences' },
        { icon: Bell, label: 'Notifications', desc: 'Alert thresholds and channels' },
        { icon: Shield, label: 'Permissions', desc: 'Access control and roles' },
        { icon: Database, label: 'Data Management', desc: 'Export, backup, and retention' },
        { icon: Palette, label: 'Appearance', desc: 'Theme and display settings' },
        { icon: Settings, label: 'System', desc: 'Advanced configuration' },
      ].map((item) => (
        <Card key={item.label} className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <item.icon size={18} className="text-white/50" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white/80">{item.label}</h4>
            <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
          </div>
          <Button variant="secondary" className="text-xs shrink-0">Configure</Button>
        </Card>
      ))}
    </div>
  )
}
