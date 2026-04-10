import { useState } from 'react';
import SettingsPanel, { SettingCard, ToggleField, InputField, NumberField, SelectField } from '../SettingsPanel';

interface Props {
  s: any;
  roleOptions: { value: string; label: string }[];
  update: (section: string, field: string, value: any) => void;
  save: () => void;
  saving: boolean;
  saved: boolean;
}

export default function ShopPanel({ s, roleOptions, update, save, saving, saved }: Props) {
  const items = s.items || [];
  const [form, setForm] = useState({ name: '', description: '', price: 0, role_id: '', stock: -1, item_type: 'role' });

  const addItem = () => {
    if (!form.name) return;
    update('shop', 'items', [...items, { ...form }]);
    setForm({ name: '', description: '', price: 0, role_id: '', stock: -1, item_type: 'role' });
  };

  const removeItem = (idx: number) => {
    update('shop', 'items', items.filter((_: any, i: number) => i !== idx));
  };

  return (
    <SettingsPanel title="Shop" description="Manage shop items" icon="🛒" onSave={save} saving={saving} saved={saved}>
      <SettingCard title="Shop Status">
        <ToggleField label="Enable Shop" value={s.enabled ?? true} onChange={(v) => update('shop', 'enabled', v)} />
      </SettingCard>
      <SettingCard title="Shop Items">
        <div className="space-y-2">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <div className="flex-1">
                <span className="text-white text-sm font-medium">{item.name}</span>
                <span className="text-gray-400 text-xs ml-2">— {item.price} coins</span>
                {item.description && <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>}
                <span className="text-xs text-indigo-400 ml-1">({item.item_type})</span>
                {item.stock >= 0 && <span className="text-xs text-yellow-400 ml-1">Stock: {item.stock}</span>}
              </div>
              <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 text-sm px-2">🗑️</button>
            </div>
          ))}
        </div>
      </SettingCard>
      <SettingCard title="Add New Item">
        <InputField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Item name" />
        <InputField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Item description" />
        <NumberField label="Price" value={form.price} onChange={(v) => setForm({ ...form, price: v })} min={0} />
        <SelectField label="Type" value={form.item_type} onChange={(v) => setForm({ ...form, item_type: v })} options={[
          { value: 'role', label: 'Role' }, { value: 'perk', label: 'Perk' }, { value: 'item', label: 'Item' },
        ]} />
        {form.item_type === 'role' && (
          <SelectField label="Role" value={form.role_id} onChange={(v) => setForm({ ...form, role_id: v })} options={roleOptions} />
        )}
        <NumberField label="Stock (-1 = unlimited)" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} min={-1} />
        <button onClick={addItem} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors">
          + Add Item
        </button>
      </SettingCard>
    </SettingsPanel>
  );
}
