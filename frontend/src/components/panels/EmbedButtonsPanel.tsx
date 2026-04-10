import { useState } from 'react';
import SettingsPanel, { SettingCard, InputField, TextAreaField, SelectField, ColorField } from '../SettingsPanel';

interface Props {
  s: any;
  update: (section: string, field: string, value: any) => void;
  save: () => void;
  saving: boolean;
  saved: boolean;
}

export default function EmbedButtonsPanel({ s, update, save, saving, saved }: Props) {
  const buttons = s.buttons || [];
  const [form, setForm] = useState({ label: '', emoji: '', style: 'primary', title: '', description: '', footer: '' });

  const addButton = () => {
    if (!form.label) return;
    update('embed_buttons', 'buttons', [...buttons, { ...form, fields: [] }]);
    setForm({ label: '', emoji: '', style: 'primary', title: '', description: '', footer: '' });
  };

  const removeButton = (idx: number) => {
    update('embed_buttons', 'buttons', buttons.filter((_: any, i: number) => i !== idx));
  };

  return (
    <SettingsPanel title="Embed Buttons" description="Manage /setup_embeds buttons" icon="📜" onSave={save} saving={saving} saved={saved}>
      <SettingCard title="Main Embed">
        <InputField label="Title" value={s.embed_title || ''} onChange={(v) => update('embed_buttons', 'embed_title', v)} />
        <TextAreaField label="Description" value={s.embed_description || ''} onChange={(v) => update('embed_buttons', 'embed_description', v)} />
        <InputField label="Footer" value={s.embed_footer || ''} onChange={(v) => update('embed_buttons', 'embed_footer', v)} />
        <ColorField label="Color" value={s.embed_color || '#5865F2'} onChange={(v) => update('embed_buttons', 'embed_color', v)} />
      </SettingCard>
      <SettingCard title="Buttons">
        <div className="space-y-2">
          {buttons.map((btn: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-lg">{btn.emoji}</span>
              <div className="flex-1">
                <span className="text-white text-sm font-medium">{btn.label}</span>
                {btn.title && <p className="text-gray-400 text-xs">{btn.title}</p>}
              </div>
              <button onClick={() => removeButton(idx)} className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
            </div>
          ))}
        </div>
      </SettingCard>
      <SettingCard title="Add Button">
        <InputField label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Button label" />
        <InputField label="Emoji" value={form.emoji} onChange={(v) => setForm({ ...form, emoji: v })} placeholder="🎉" />
        <SelectField label="Style" value={form.style} onChange={(v) => setForm({ ...form, style: v })} options={[
          { value: 'primary', label: 'Blue' }, { value: 'secondary', label: 'Gray' },
          { value: 'success', label: 'Green' }, { value: 'danger', label: 'Red' },
        ]} />
        <InputField label="Embed Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Title when clicked" />
        <TextAreaField label="Embed Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Content when clicked" />
        <InputField label="Footer" value={form.footer} onChange={(v) => setForm({ ...form, footer: v })} />
        <button onClick={addButton} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors">
          + Add Button
        </button>
      </SettingCard>
    </SettingsPanel>
  );
}
