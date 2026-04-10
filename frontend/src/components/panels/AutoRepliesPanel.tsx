import { useState } from 'react';
import SettingsPanel, { SettingCard, InputField, TextAreaField, ToggleField } from '../SettingsPanel';
import { updateSectionSettings } from '../../services/api';

interface Props {
  guildId: string;
  settings: any;
  setSettings: (fn: (prev: any) => any) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  saved: boolean;
  setSaved: (v: boolean) => void;
}

export default function AutoRepliesPanel({ guildId, settings, setSettings, saving, setSaving, saved, setSaved }: Props) {
  const replies = settings.auto_replies || [];
  const [form, setForm] = useState({ trigger: '', response: '', exact_match: false, enabled: true });

  const addReply = () => {
    if (!form.trigger || !form.response) return;
    const newReplies = [...replies, { ...form }];
    setSettings((prev: any) => ({ ...prev, auto_replies: newReplies }));
    setForm({ trigger: '', response: '', exact_match: false, enabled: true });
    setSaved(false);
  };

  const removeReply = (idx: number) => {
    const newReplies = replies.filter((_: any, i: number) => i !== idx);
    setSettings((prev: any) => ({ ...prev, auto_replies: newReplies }));
    setSaved(false);
  };

  const saveReplies = async () => {
    setSaving(true);
    try {
      await updateSectionSettings(guildId, 'auto_replies', settings.auto_replies);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <SettingsPanel title="Auto Replies" description="Configure automatic responses" icon="💬" onSave={saveReplies} saving={saving} saved={saved}>
      <SettingCard title="Existing Replies">
        <div className="space-y-2">
          {replies.map((r: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <div className="flex-1">
                <span className="text-indigo-400 text-sm font-medium">"{r.trigger}"</span>
                <span className="text-gray-400 text-sm"> → </span>
                <span className="text-gray-300 text-sm">{r.response}</span>
                {r.exact_match && <span className="text-xs text-yellow-400 ml-2">(exact)</span>}
              </div>
              <button onClick={() => removeReply(idx)} className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
            </div>
          ))}
          {replies.length === 0 && <p className="text-gray-500 text-sm">No auto replies configured</p>}
        </div>
      </SettingCard>
      <SettingCard title="Add Auto Reply">
        <InputField label="Trigger" value={form.trigger} onChange={(v) => setForm({ ...form, trigger: v })} placeholder="Type trigger word/phrase..." />
        <TextAreaField label="Response" value={form.response} onChange={(v) => setForm({ ...form, response: v })} placeholder="Bot response..." />
        <ToggleField label="Exact Match" value={form.exact_match} onChange={(v) => setForm({ ...form, exact_match: v })} />
        <button onClick={addReply} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors">
          + Add Reply
        </button>
      </SettingCard>
    </SettingsPanel>
  );
}
