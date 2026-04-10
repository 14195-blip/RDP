import { useState } from 'react';

interface SettingsPanelProps {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}

export default function SettingsPanel({ title, description, icon, children, onSave, saving, saved }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : saving
              ? 'bg-indigo-500/20 text-indigo-300 cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
          }`}
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className="h-px bg-white/10" />
      {/* Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

// Reusable form components
export function SettingCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-xs mb-4">{description}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-300 text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-indigo-600' : 'bg-gray-700'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${value ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-gray-300 text-sm mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
      />
    </div>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="text-gray-300 text-sm mb-1.5 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
      />
    </div>
  );
}

export function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-gray-300 text-sm mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
      >
        <option value="">-- Select --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function NumberField({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="text-gray-300 text-sm mb-1.5 block">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
      />
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-gray-300 text-sm mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#5865F2'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#5865F2"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>
    </div>
  );
}

export function MultiSelectField({ label, selected, options, onChange }: {
  label: string; selected: string[]; options: { value: string; label: string }[]; onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div>
      <label className="text-gray-300 text-sm mb-1.5 block">{label}</label>
      <div className="max-h-48 overflow-y-auto space-y-1 bg-white/5 border border-white/10 rounded-lg p-2">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
              className="accent-indigo-500"
            />
            <span className="text-gray-300 text-sm">{o.label}</span>
          </label>
        ))}
        {options.length === 0 && (
          <p className="text-gray-500 text-sm px-2 py-1">No options available</p>
        )}
      </div>
    </div>
  );
}

export function ListEditor({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [newItem, setNewItem] = useState('');

  const add = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  return (
    <div>
      <label className="text-gray-300 text-sm mb-1.5 block">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={placeholder || 'Add item...'}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
        <button onClick={add} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm transition-colors">
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 text-xs px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {item}
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="hover:text-red-400 ml-1">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
