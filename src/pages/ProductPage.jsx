import { useState } from 'react'
import { Upload, Download, Plus, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const defaultFields = [
  { id: 1, label: 'Serial Number', value: '' },
  { id: 2, label: 'Batch / Lot', value: '' },
  { id: 3, label: 'Manufacturer', value: '' },
  { id: 4, label: 'Category', value: '' },
]

export default function ProductPage() {
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState(defaultFields)
  const [nextId, setNextId] = useState(5)

  const addField = () => {
    setFields([...fields, { id: nextId, label: '', value: '' }])
    setNextId(nextId + 1)
  }

  const removeField = (id) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const updateField = (id, key, val) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: val } : f)))
  }

  const handleExport = () => {
    const data = { productName, description, fields }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${productName || 'product'}-config.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          if (data.productName) setProductName(data.productName)
          if (data.description) setDescription(data.description)
          if (data.fields) {
            setFields(data.fields)
            const maxId = Math.max(...data.fields.map((f) => f.id), 0)
            setNextId(maxId + 1)
          }
        } catch {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with import/export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Product Information</h2>
          <p className="text-sm text-white/40 mt-1">Define product details and custom fields</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleImport}>
            <Upload size={16} className="mr-2" />
            Import
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Product name & description */}
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. PCB Assembly Rev. 3"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/20 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief product description, specifications, notes..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/20 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Custom fields */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/70">Product Fields</h3>
          <button
            onClick={addField}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Add Field
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center gap-3">
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(field.id, 'label', e.target.value)}
                placeholder="Field name"
                className="w-40 shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 placeholder-white/20 outline-none focus:border-blue-500/50 transition-all"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateField(field.id, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/20 outline-none focus:border-blue-500/50 transition-all"
              />
              <button
                onClick={() => removeField(field.id)}
                className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
