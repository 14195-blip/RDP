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

export default function CompaniesPanel({ s, update, setSettings, setSaved, save, saving, saved }: Props) {
  const companies = s || {};
  const [name, setName] = useState('');

  const addCompany = () => {
    if (!name) return;
    const id = `company_${Date.now()}`;
    update('companies', id, name);
    setName('');
  };

  return (
    <SettingsPanel title="Companies" description="Manage custom company names for your server" icon="🏢" onSave={save} saving={saving} saved={saved}>
      <SettingCard title="Current Companies" description="Companies will auto-update in bank info">
        <div className="space-y-2">
          {Object.entries(companies).filter(([k]) => k !== '_id' && k !== 'guild_id').map(([id, companyName]) => (
            <div key={id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-white text-sm">{companyName as string}</span>
              <button onClick={() => {
                const newCompanies = { ...companies };
                delete newCompanies[id];
                setSettings((prev: any) => ({ ...prev, companies: newCompanies }));
                setSaved(false);
              }} className="ml-auto text-red-400 hover:text-red-300 text-sm">🗑️</button>
            </div>
          ))}
          {Object.keys(companies).filter(k => k !== '_id' && k !== 'guild_id').length === 0 && (
            <p className="text-gray-500 text-sm">No companies added yet</p>
          )}
        </div>
      </SettingCard>
      <SettingCard title="Add Company">
        <InputField label="Company Name" value={name} onChange={setName} placeholder="Enter company name..." />
        <button onClick={addCompany} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors">
          + Add Company
        </button>
      </SettingCard>
    </SettingsPanel>
  );
}
