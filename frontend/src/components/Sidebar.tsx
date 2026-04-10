import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  guildName: string;
  guildIcon: string | null;
  guildId: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'general', icon: '⚙️', label: 'General' },
  { id: 'welcome', icon: '👋', label: 'Welcome' },
  { id: 'leave', icon: '🚪', label: 'Leave' },
  { id: 'logs', icon: '📋', label: 'Logs' },
  { id: 'auto_roles', icon: '🎭', label: 'Auto Roles' },
  { id: 'moderation', icon: '🛡️', label: 'Moderation' },
  { id: 'tickets', icon: '🎫', label: 'Tickets' },
  { id: 'level', icon: '⭐', label: 'Level System' },
  { id: 'vc', icon: '🎙️', label: 'Voice Level' },
  { id: 'economy', icon: '🏦', label: 'Economy / Bank' },
  { id: 'shop', icon: '🛒', label: 'Shop' },
  { id: 'auto_replies', icon: '💬', label: 'Auto Replies' },
  { id: 'permissions', icon: '🔑', label: 'Permissions' },
  { id: 'aliases', icon: '🔤', label: 'Aliases' },
  { id: 'companies', icon: '🏢', label: 'Companies' },
  { id: 'embed_style', icon: '🎨', label: 'Message Style' },
  { id: 'embed_buttons', icon: '📜', label: 'Embed Buttons' },
  { id: 'anti_cheat', icon: '🛡️', label: 'Anti-Spam/Link' },
  { id: 'captcha', icon: '🔐', label: 'Captcha / Verify' },
];

export default function Sidebar({ guildName, guildIcon, activeSection, onSectionChange }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-[#0f0f23] border-r border-white/10 flex flex-col h-screen sticky top-0">
      {/* Server info */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={() => navigate('/servers')}
          className="text-gray-400 hover:text-white text-sm mb-3 flex items-center gap-1 transition-colors"
        >
          ← Back to servers
        </button>
        <div className="flex items-center gap-3">
          {guildIcon ? (
            <img src={guildIcon} alt={guildName} className="w-10 h-10 rounded-lg" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-indigo-400">{guildName.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{guildName}</h3>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              activeSection === s.id
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-base">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full text-sm text-gray-500 hover:text-red-400 transition-colors py-2"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
