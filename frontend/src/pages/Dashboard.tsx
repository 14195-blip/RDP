import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGuildChannels, getGuildRoles, getSettings, updateSectionSettings } from '../services/api';
import Sidebar from '../components/Sidebar';
import SettingsPanel, {
  SettingCard, ToggleField, InputField, TextAreaField, SelectField,
  NumberField, ColorField, MultiSelectField, ListEditor,
} from '../components/SettingsPanel';

interface Channel { id: string; name: string; type: number; }
interface Role { id: string; name: string; color: number; managed: boolean; }

export default function Dashboard() {
  const { guildId } = useParams<{ guildId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState<any>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildIcon] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/'); return; }
    loadData();
  }, [guildId, isAuthenticated]);

  const loadData = async () => {
    if (!guildId) return;
    setLoading(true);
    try {
      const [settingsRes, channelsRes, rolesRes] = await Promise.all([
        getSettings(guildId),
        getGuildChannels(guildId),
        getGuildRoles(guildId),
      ]);
      setSettings(settingsRes.data);
      setChannels(channelsRes.data);
      setRoles(rolesRes.data);
      setGuildName(settingsRes.data.guild_id || guildId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const textChannels = channels.filter(c => c.type === 0);
  const channelOptions = textChannels.map(c => ({ value: c.id, label: `#${c.name}` }));
  const allChannelOptions = channels.filter(c => c.type === 0 || c.type === 2 || c.type === 4).map(c => ({
    value: c.id, label: c.type === 0 ? `#${c.name}` : c.type === 2 ? `🔊 ${c.name}` : `📁 ${c.name}`,
  }));
  const roleOptions = roles.filter(r => !r.managed && r.name !== '@everyone').map(r => ({ value: r.id, label: r.name }));

  const update = useCallback((section: string, field: string, value: any) => {
    setSaved(false);
    setSettings((prev: any) => {
      if (!prev) return prev;
      const sectionData = prev[section] || {};
      return { ...prev, [section]: { ...sectionData, [field]: value } };
    });
  }, []);

  const save = async () => {
    if (!guildId || !settings) return;
    setSaving(true);
    try {
      await updateSectionSettings(guildId, activeSection, settings[activeSection]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-red-400">
        Failed to load settings
      </div>
    );
  }

  const s = settings[activeSection] || {};

  return (
    <div className="flex min-h-screen bg-[#0a0a1a]">
      <Sidebar
        guildName={guildName}
        guildIcon={guildIcon}
        guildId={guildId!}
        activeSection={activeSection}
        onSectionChange={(sec) => { setActiveSection(sec); setSaved(false); }}
      />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {renderSection()}
      </main>
    </div>
  );

  function renderSection() {
    switch (activeSection) {
      case 'general': return renderGeneral();
      case 'welcome': return renderWelcome();
      case 'leave': return renderLeave();
      case 'logs': return renderLogs();
      case 'auto_roles': return renderAutoRoles();
      case 'moderation': return renderModeration();
      case 'tickets': return renderTickets();
      case 'level': return renderLevel();
      case 'vc': return renderVC();
      case 'economy': return renderEconomy();
      case 'shop': return renderShop();
      case 'auto_replies': return renderAutoReplies();
      case 'permissions': return renderPermissions();
      case 'aliases': return renderAliases();
      case 'companies': return renderCompanies();
      case 'embed_style': return renderEmbedStyle();
      case 'embed_buttons': return renderEmbedButtons();
      case 'anti_cheat': return renderAntiCheat();
      case 'captcha': return renderCaptcha();
      default: return <div className="text-white">Select a section</div>;
    }
  }

  // ========== GENERAL ==========
  function renderGeneral() {
    return (
      <SettingsPanel title="General Settings" description="Configure basic bot settings" icon="⚙️" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Bot Configuration">
          <InputField label="Prefix" value={s.prefix || '!'} onChange={(v) => update('general', 'prefix', v)} placeholder="!" />
          <SelectField label="Language" value={s.language || 'ar'} onChange={(v) => update('general', 'language', v)} options={[
            { value: 'ar', label: 'العربية' }, { value: 'en', label: 'English' },
          ]} />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== WELCOME ==========
  function renderWelcome() {
    return (
      <SettingsPanel title="Welcome System" description="Configure welcome messages for new members" icon="👋" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Welcome Settings">
          <ToggleField label="Enable Welcome System" value={s.enabled ?? true} onChange={(v) => update('welcome', 'enabled', v)} />
          <SelectField label="Welcome Channel" value={s.channel || ''} onChange={(v) => update('welcome', 'channel', v)} options={channelOptions} />
          <TextAreaField label="Welcome Message" value={s.message || ''} onChange={(v) => update('welcome', 'message', v)} placeholder="Welcome {user} to {server}!" />
          <p className="text-xs text-gray-500">Variables: {'{user}'} {'{server}'} {'{member_count}'}</p>
          <ToggleField label="Use Embed" value={s.embed ?? true} onChange={(v) => update('welcome', 'embed', v)} />
          <InputField label="Welcome Image URL" value={s.image_url || ''} onChange={(v) => update('welcome', 'image_url', v)} placeholder="https://..." />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== LEAVE ==========
  function renderLeave() {
    return (
      <SettingsPanel title="Leave System" description="Configure leave messages" icon="🚪" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Leave Settings">
          <ToggleField label="Enable Leave System" value={s.enabled ?? false} onChange={(v) => update('leave', 'enabled', v)} />
          <SelectField label="Leave Channel" value={s.channel || ''} onChange={(v) => update('leave', 'channel', v)} options={channelOptions} />
          <TextAreaField label="Leave Message" value={s.message || ''} onChange={(v) => update('leave', 'message', v)} placeholder="{user} has left {server}." />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== LOGS ==========
  function renderLogs() {
    const logTypes = [
      { key: 'msg', label: 'Message Logs (delete/edit)' },
      { key: 'join_leave', label: 'Join/Leave Logs' },
      { key: 'shop', label: 'Shop Logs' },
      { key: 'ban', label: 'Ban Logs' },
      { key: 'kick', label: 'Kick Logs' },
      { key: 'timeout_mute', label: 'Timeout/Mute Logs' },
      { key: 'bank', label: 'Bank Logs' },
      { key: 'roles', label: 'Role Logs' },
    ];
    return (
      <SettingsPanel title="Logs System" description="Configure logging channels" icon="📋" onSave={save} saving={saving} saved={saved}>
        {logTypes.map((lt) => (
          <SettingCard key={lt.key} title={lt.label}>
            <SelectField label="Channel" value={s[lt.key] || ''} onChange={(v) => update('logs', lt.key, v)} options={channelOptions} />
          </SettingCard>
        ))}
      </SettingsPanel>
    );
  }

  // ========== AUTO ROLES ==========
  function renderAutoRoles() {
    return (
      <SettingsPanel title="Auto Roles" description="Automatically assign roles when members join" icon="🎭" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Auto Role Settings">
          <ToggleField label="Enable Auto Roles" value={s.enabled ?? false} onChange={(v) => update('auto_roles', 'enabled', v)} />
          <MultiSelectField label="Roles to assign on join" selected={s.roles || []} options={roleOptions} onChange={(v) => update('auto_roles', 'roles', v)} />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== MODERATION ==========
  function renderModeration() {
    return (
      <SettingsPanel title="Moderation" description="Configure moderation commands and roles" icon="🛡️" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Command Toggles">
          <ToggleField label="Ban Command" value={s.ban_enabled ?? true} onChange={(v) => update('moderation', 'ban_enabled', v)} />
          <ToggleField label="Kick Command" value={s.kick_enabled ?? true} onChange={(v) => update('moderation', 'kick_enabled', v)} />
          <ToggleField label="Mute Command" value={s.mute_enabled ?? true} onChange={(v) => update('moderation', 'mute_enabled', v)} />
          <ToggleField label="Warn Command" value={s.warn_enabled ?? true} onChange={(v) => update('moderation', 'warn_enabled', v)} />
        </SettingCard>
        <SettingCard title="Moderator Roles">
          <MultiSelectField label="Mod Roles" selected={s.mod_roles || []} options={roleOptions} onChange={(v) => update('moderation', 'mod_roles', v)} />
        </SettingCard>
        <SettingCard title="Other Settings">
          <SelectField label="Mute Role" value={s.mute_role || ''} onChange={(v) => update('moderation', 'mute_role', v)} options={roleOptions} />
          <NumberField label="Command Cooldown (seconds)" value={s.cooldown ?? 5} onChange={(v) => update('moderation', 'cooldown', v)} min={0} max={300} />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== TICKETS ==========
  function renderTickets() {
    return (
      <SettingsPanel title="Ticket System" description="Configure support tickets" icon="🎫" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Ticket Settings">
          <ToggleField label="Enable Ticket System" value={s.enabled ?? false} onChange={(v) => update('tickets', 'enabled', v)} />
          <InputField label="Panel Title" value={s.panel_title || ''} onChange={(v) => update('tickets', 'panel_title', v)} />
          <TextAreaField label="Panel Message" value={s.panel_message || ''} onChange={(v) => update('tickets', 'panel_message', v)} />
          <ColorField label="Panel Color" value={s.panel_color || '#5865F2'} onChange={(v) => update('tickets', 'panel_color', v)} />
          <InputField label="Panel Image URL" value={s.panel_image || ''} onChange={(v) => update('tickets', 'panel_image', v)} placeholder="https://..." />
        </SettingCard>
        <SettingCard title="Channels & Roles">
          <SelectField label="Panel Channel" value={s.panel_channel || ''} onChange={(v) => update('tickets', 'panel_channel', v)} options={channelOptions} />
          <SelectField label="Category (for new tickets)" value={s.category || ''} onChange={(v) => update('tickets', 'category', v)} options={allChannelOptions} />
          <SelectField label="Log Channel" value={s.log_channel || ''} onChange={(v) => update('tickets', 'log_channel', v)} options={channelOptions} />
          <MultiSelectField label="Support Roles" selected={s.support_roles || []} options={roleOptions} onChange={(v) => update('tickets', 'support_roles', v)} />
          <NumberField label="Max Tickets per User" value={s.max_tickets ?? 1} onChange={(v) => update('tickets', 'max_tickets', v)} min={1} max={10} />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== LEVEL ==========
  function renderLevel() {
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
                <button
                  onClick={() => {
                    const newRewards = { ...rewards };
                    delete newRewards[level];
                    update('level', 'role_rewards', newRewards);
                  }}
                  className="ml-auto text-red-400 hover:text-red-300 text-sm"
                >×</button>
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

  // ========== VC XP ==========
  function renderVC() {
    return (
      <SettingsPanel title="Voice Level System" description="Configure voice channel XP" icon="🎙️" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Voice XP Settings">
          <ToggleField label="Enable Voice XP" value={s.enabled ?? true} onChange={(v) => update('vc', 'enabled', v)} />
          <NumberField label="XP per Minute" value={s.xp_per_minute ?? 1.0} onChange={(v) => update('vc', 'xp_per_minute', v)} min={0.1} max={50} step={0.1} />
          <NumberField label="Minimum Members in VC" value={s.min_members ?? 2} onChange={(v) => update('vc', 'min_members', v)} min={1} max={10} />
          <ToggleField label="Give XP while Muted" value={s.mute_xp ?? false} onChange={(v) => update('vc', 'mute_xp', v)} />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== ECONOMY ==========
  function renderEconomy() {
    return (
      <SettingsPanel title="Economy / Bank" description="Configure the economy system" icon="🏦" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="General">
          <ToggleField label="Enable Economy" value={s.enabled ?? true} onChange={(v) => update('economy', 'enabled', v)} />
          <InputField label="Currency Name" value={s.currency_name || 'coins'} onChange={(v) => update('economy', 'currency_name', v)} />
          <InputField label="Currency Symbol" value={s.currency_symbol || '🪙'} onChange={(v) => update('economy', 'currency_symbol', v)} />
          <NumberField label="Starting Balance" value={s.starting_balance ?? 0} onChange={(v) => update('economy', 'starting_balance', v)} min={0} />
          <NumberField label="Max Balance" value={s.max_balance ?? 1000000} onChange={(v) => update('economy', 'max_balance', v)} min={0} />
        </SettingCard>
        <SettingCard title="Daily Reward">
          <NumberField label="Daily Amount" value={s.daily_amount ?? 100} onChange={(v) => update('economy', 'daily_amount', v)} min={0} />
          <NumberField label="Daily Cooldown (seconds)" value={s.daily_cooldown ?? 86400} onChange={(v) => update('economy', 'daily_cooldown', v)} min={0} />
        </SettingCard>
        <SettingCard title="Work Command">
          <NumberField label="Work Min Reward" value={s.work_min ?? 50} onChange={(v) => update('economy', 'work_min', v)} min={0} />
          <NumberField label="Work Max Reward" value={s.work_max ?? 200} onChange={(v) => update('economy', 'work_max', v)} min={0} />
          <NumberField label="Work Cooldown (seconds)" value={s.work_cooldown ?? 3600} onChange={(v) => update('economy', 'work_cooldown', v)} min={0} />
        </SettingCard>
        <SettingCard title="Transfers">
          <ToggleField label="Enable Transfers" value={s.transfer_enabled ?? true} onChange={(v) => update('economy', 'transfer_enabled', v)} />
          <NumberField label="Transfer Tax (%)" value={(s.transfer_tax ?? 0) * 100} onChange={(v) => update('economy', 'transfer_tax', v / 100)} min={0} max={100} step={1} />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== SHOP ==========
  function renderShop() {
    const items = s.items || [];
    const [form, setForm] = useState({ name: '', description: '', price: 0, role_id: '', stock: -1, item_type: 'role' });

    const addItem = () => {
      if (!form.name) return;
      const newItems = [...items, { ...form }];
      update('shop', 'items', newItems);
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

  // ========== AUTO REPLIES ==========
  function renderAutoReplies() {
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
      if (!guildId) return;
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

  // ========== PERMISSIONS ==========
  function renderPermissions() {
    return (
      <SettingsPanel title="Permissions" description="Configure role-based permissions" icon="🔑" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Admin Roles" description="Roles with full bot admin access">
          <MultiSelectField label="Admin Roles" selected={s.admin_roles || []} options={roleOptions} onChange={(v) => update('permissions', 'admin_roles', v)} />
        </SettingCard>
        <SettingCard title="Moderator Roles" description="Roles with moderation access">
          <MultiSelectField label="Mod Roles" selected={s.mod_roles || []} options={roleOptions} onChange={(v) => update('permissions', 'mod_roles', v)} />
        </SettingCard>
        <SettingCard title="DJ Roles" description="Roles with music/DJ access">
          <MultiSelectField label="DJ Roles" selected={s.dj_roles || []} options={roleOptions} onChange={(v) => update('permissions', 'dj_roles', v)} />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== ALIASES ==========
  function renderAliases() {
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

  // ========== COMPANIES ==========
  function renderCompanies() {
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

  // ========== EMBED STYLE ==========
  function renderEmbedStyle() {
    return (
      <SettingsPanel title="Message Style" description="Customize how bot messages look" icon="🎨" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Embed Settings">
          <ToggleField label="Use Embeds" value={s.use_embeds ?? true} onChange={(v) => update('embed_style', 'use_embeds', v)} />
          <ColorField label="Default Embed Color" value={s.default_color || '#5865F2'} onChange={(v) => update('embed_style', 'default_color', v)} />
          <InputField label="Footer Text" value={s.footer_text || ''} onChange={(v) => update('embed_style', 'footer_text', v)} placeholder="Custom footer text" />
          <InputField label="Footer Icon URL" value={s.footer_icon || ''} onChange={(v) => update('embed_style', 'footer_icon', v)} placeholder="https://..." />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== EMBED BUTTONS ==========
  function renderEmbedButtons() {
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

  // ========== ANTI CHEAT ==========
  function renderAntiCheat() {
    return (
      <SettingsPanel title="Anti-Spam / Link / BadWords" description="Protect your server" icon="🛡️" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Anti-Spam">
          <ToggleField label="Enable Anti-Spam" value={s.anti_spam ?? false} onChange={(v) => update('anti_cheat', 'anti_spam', v)} />
          <NumberField label="Spam Threshold (messages)" value={s.spam_threshold ?? 5} onChange={(v) => update('anti_cheat', 'spam_threshold', v)} min={2} max={20} />
          <NumberField label="Spam Interval (seconds)" value={s.spam_interval ?? 5} onChange={(v) => update('anti_cheat', 'spam_interval', v)} min={1} max={30} />
        </SettingCard>
        <SettingCard title="Anti-Link">
          <ToggleField label="Enable Anti-Link" value={s.anti_link ?? false} onChange={(v) => update('anti_cheat', 'anti_link', v)} />
          <ListEditor label="Whitelisted Domains" items={s.link_whitelist || []} onChange={(v) => update('anti_cheat', 'link_whitelist', v)} placeholder="discord.gg" />
        </SettingCard>
        <SettingCard title="Anti-BadWords">
          <ToggleField label="Enable Anti-BadWords" value={s.anti_badwords ?? false} onChange={(v) => update('anti_cheat', 'anti_badwords', v)} />
          <ListEditor label="Bad Words" items={s.badwords || []} onChange={(v) => update('anti_cheat', 'badwords', v)} placeholder="Add bad word..." />
        </SettingCard>
        <SettingCard title="Exempt Roles" description="Roles that bypass anti-cheat">
          <MultiSelectField label="Exempt Roles" selected={s.exempt_roles || []} options={roleOptions} onChange={(v) => update('anti_cheat', 'exempt_roles', v)} />
        </SettingCard>
      </SettingsPanel>
    );
  }

  // ========== CAPTCHA ==========
  function renderCaptcha() {
    return (
      <SettingsPanel title="Captcha / Verification" description="Verify new members" icon="🔐" onSave={save} saving={saving} saved={saved}>
        <SettingCard title="Captcha Settings">
          <ToggleField label="Enable Captcha" value={s.enabled ?? false} onChange={(v) => update('captcha', 'enabled', v)} />
          <SelectField label="Verification Channel" value={s.channel || ''} onChange={(v) => update('captcha', 'channel', v)} options={channelOptions} />
          <SelectField label="Verified Role" value={s.verified_role || ''} onChange={(v) => update('captcha', 'verified_role', v)} options={roleOptions} />
          <SelectField label="Captcha Type" value={s.captcha_type || 'reaction'} onChange={(v) => update('captcha', 'captcha_type', v)} options={[
            { value: 'reaction', label: 'Reaction' }, { value: 'button', label: 'Button Click' }, { value: 'text', label: 'Text Input' },
          ]} />
          <TextAreaField label="Verification Message" value={s.message || ''} onChange={(v) => update('captcha', 'message', v)} placeholder="Please verify yourself..." />
        </SettingCard>
      </SettingsPanel>
    );
  }
}
