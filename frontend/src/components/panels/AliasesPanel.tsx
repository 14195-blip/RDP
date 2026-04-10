import { useState } from 'react';
import SettingsPanel, { SettingCard, InputField } from '../SettingsPanel';

interface Props {
  s: any;
  update: (section: string, field: string, value: any) => void;
  setSettings: (fn: (prev: any) => any) => void;
  setSaved: (v: boolean) => void;
  save: () => void;
  saving: boolean;
  saved: boolean;
}

export default function AliasesPanel({ s, update, setSettings, setSaved, save, saving, saved }: Props) {
  const aliases = s || {};
  const [cmd, setCmd] = useState('');
  const [alias, setAlias] = useState('');

  const addAlias = () => {
    if (!cmd || !alias) return;
    const existing = aliases[cmd] || '';
    const newVal = existing ? `${existing}, ${alias}` : alias;
    update('aliases', cmd, newVal);
    setAlias('');
  };

  return (
    <SettingsPanel title="Command Aliases" description="Create shortcuts for commands" icon="🔤" onSave={save} saving={saving} saved={saved}>
      <SettingCard title="Current Aliases">
        <div className="space-y-2">
          {Object.entries(aliases).filter(([k]) => k !== '_id' && k !== 'guild_id').map(([command, aliasList]) => (
            <div key={command} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-indigo-400 text-sm font-medium">/{command}</span>
              <span className="text-gray-400 text-sm">→</span>
              <span className="text-gray-300 text-sm">{aliasList as string}</span>
              <button onClick={() => {
                const newAliases = { ...aliases };
                delete newAliases[command];
                setSettings((prev: any) => ({ ...prev, aliases: newAliases }));
                setSaved(false);
              }} className="ml-auto text-red-400 hover:text-red-300 text-sm">×</button>
            </div>
          ))}
        </div>
      </SettingCard>
      <SettingCard title="Add Alias">
        <InputField label="Command" value={cmd} onChange={setCmd} placeholder="e.g., ban" />
        <InputField label="Alias(es)" value={alias} onChange={setAlias} placeholder="e.g., b, حظر" />
        <button onClick={addAlias} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors">
          + Add Alias
        </button>
      </SettingCard>
    </SettingsPanel>
  );
}
