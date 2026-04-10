import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const getGuilds = (_token?: string) =>
  api.get('/auth/guilds');

// Guild info
export const getGuildInfo = (guildId: string) =>
  api.get(`/guilds/${guildId}/info`);

export const getGuildChannels = (guildId: string) =>
  api.get(`/guilds/${guildId}/channels`);

export const getGuildRoles = (guildId: string) =>
  api.get(`/guilds/${guildId}/roles`);

// Settings
export const getSettings = (guildId: string) =>
  api.get(`/settings/${guildId}`);

export const getSectionSettings = (guildId: string, section: string) =>
  api.get(`/settings/${guildId}/${section}`);

export const updateSectionSettings = (guildId: string, section: string, data: any) =>
  api.put(`/settings/${guildId}/${section}`, data);

export default api;
