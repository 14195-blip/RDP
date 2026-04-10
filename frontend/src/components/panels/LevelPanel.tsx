import { useState } from 'react';
import SettingsPanel, { SettingCard, ToggleField, NumberField, TextAreaField, SelectField } from '../SettingsPanel';

interface Props {
  s: any;
  roles: { id: string; name: string }[];
  channelOptions: { value: string; label: string }[];
  roleOptions: { value: string; label: string }[];
  update: (section: string, field: string, value: any) => void;
  save: () => void;
  saving: boolean;
  saved: boolean;
}

export default function LevelPanel({ s, roles, channelOptions, roleOptions, update, save, saving, saved }: Props) {
  const [newLevelStr, setNewLevelStr] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const rewards = s.role_rewards || {};

  return (
    <SettingsPanel title="Level System" description="Configure XP and leveling" icon="⭐" onSave={save} saving={saving} saved={saved}>
      <SettingCard title="Level Settings">
        <ToggleField label="Enable Level System" value={s.enabled ?? true} onChange={(v) => update('level', 'enabled', v)} />
        <NumberField label="XP Rate Multiplier" value={s.xp_rate ?? 1.0} onChange={(v) => update('level', 'xp_rate', v)} min={0.1} max={10} step={0.1} />
        <TextAreaField label="Level Up Message" value={s.level_up_message || ''} onChange={(v) => update('level', 'level_up_message', v)} placeholder="Congratulations {user}! Level {level}!" />
        <SelectField label="Announcement Channel" value={s.announcement_channel || ''} onChange={(v) => update('level', 'announcement_channel', v)} options={channelOptions} />
      </SettingCard>
      <SettingCard title="Role Rewards" description="Assign roles when members reach certain levels">
        <div className="space-y-2">
          {Object.entries(rewards).map(([level, roleId]) => (
            <div key={level} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
              <span className="text-indigo-400 text-sm font-medium">Level {level}</span>
              <span className="text-gray-400 text-sm">→</span>
              <span className="text-gray-300 text-sm">{roles.find(r => r.id === roleId)?.name || roleId as string}</span>
              <button onClick={() => {
                const newRewards = { ...rewards };
                delete newRewards[level];
                update('level', 'role_rewards', newRewards);
              }} className="ml-auto text-red-400 hover:text-red-300 text-sm">×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input type="number" placeholder="Level" value={newLevelStr} onChange={(e) => setNewLevelStr(e.target.value)}
            className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
          <select value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)}
            className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50">
            <option value="">Select role</option>
            {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button onClick={() => {
            if (newLevelStr && newRoleId) {
              update('level', 'role_rewards', { ...rewards, [newLevelStr]: newRoleId });
              setNewLevelStr(''); setNewRoleId('');
            }
          }} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm">Add</button>
        </div>
      </SettingCard>
    </SettingsPanel>
  );
}
