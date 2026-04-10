import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGuildChannels, getGuildRoles, getSettings, updateSectionSettings } from '../services/api';
import Sidebar from '../components/Sidebar';
import SettingsPanel, {
  SettingCard, ToggleField, InputField, TextAreaField, SelectField,
  NumberField, ColorField, MultiSelectField, ListEditor,
} from '../components/SettingsPanel';
import LevelPanel from '../components/panels/LevelPanel';
import ShopPanel from '../components/panels/ShopPanel';
import AutoRepliesPanel from '../components/panels/AutoRepliesPanel';
import AliasesPanel from '../components/panels/AliasesPanel';
import CompaniesPanel from '../components/panels/CompaniesPanel';
import EmbedButtonsPanel from '../components/panels/EmbedButtonsPanel';

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
      case 'level':
        return <LevelPanel s={s} roles={roles} channelOptions={channelOptions} roleOptions={roleOptions} update={update} save={save} saving={saving} saved={saved} />;
      case 'vc': return renderVC();
      case 'economy': return renderEconomy();
      case 'shop':
        return <ShopPanel s={s} roleOptions={roleOptions} update={update} save={save} saving={saving} saved={saved} />;
      case 'auto_replies':
        return <AutoRepliesPanel guildId={guildId!} settings={settings} setSettings={setSettings} saving={saving} setSaving={setSaving} saved={saved} setSaved={setSaved} />;
      case 'permissions': return renderPermissions();
      case 'aliases':
        return <AliasesPanel s={s} update={update} setSettings={setSettings} setSaved={setSaved} save={save} saving={saving} saved={saved} />;
      case 'companies':
        return <CompaniesPanel s={s} update={update} setSettings={setSettings} setSaved={setSaved} save={save} saving={saving} saved={saved} />;
      case 'embed_style': return renderEmbedStyle();
      case 'embed_buttons':
        return <EmbedButtonsPanel s={s} update={update} save={save} saving={saving} saved={saved} />;
      case 'anti_cheat': return renderAntiCheat();
      case 'captcha': return renderCaptcha();
      default: return <div className="text-white">Select a section</div>;
    }
  }

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
