import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGuilds } from '../services/api';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  bot_in_guild: boolean;
}

export default function ServerSelect() {
  const { token, user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadGuilds();
  }, [isAuthenticated, navigate]);

  const loadGuilds = async () => {
    try {
      setLoading(true);
      const res = await getGuilds(token!);
      setGuilds(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load servers');
    } finally {
      setLoading(false);
    }
  };

  const getGuildIcon = (guild: Guild) => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Kingdom Bot</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.username}</span>
            <button onClick={logout} className="text-gray-400 hover:text-white transition-colors text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Select a Server</h1>
        <p className="text-gray-400 mb-8">Choose a server to manage its settings</p>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guilds.map((guild) => (
            <button
              key={guild.id}
              onClick={() => guild.bot_in_guild && navigate(`/dashboard/${guild.id}`)}
              className={`group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-xl p-6 text-left transition-all duration-200 ${
                !guild.bot_in_guild ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10'
              }`}
            >
              <div className="flex items-center gap-4">
                {getGuildIcon(guild) ? (
                  <img
                    src={getGuildIcon(guild)!}
                    alt={guild.name}
                    className="w-14 h-14 rounded-xl"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-400">
                      {guild.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{guild.name}</h3>
                  <p className="text-sm text-gray-400">
                    {guild.owner ? 'Owner' : 'Admin'}
                  </p>
                </div>
              </div>
              {!guild.bot_in_guild && (
                <div className="mt-3 text-xs text-yellow-400/80 bg-yellow-400/10 rounded-lg px-3 py-1.5 text-center">
                  Bot not in this server
                </div>
              )}
              {guild.bot_in_guild && (
                <div className="mt-3 text-xs text-green-400/80 bg-green-400/10 rounded-lg px-3 py-1.5 text-center">
                  Click to manage
                </div>
              )}
            </button>
          ))}
        </div>

        {!loading && guilds.length === 0 && !error && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl mb-2">No servers found</p>
            <p className="text-sm">You need to be an admin in a server to manage it</p>
          </div>
        )}
      </main>
    </div>
  );
}
