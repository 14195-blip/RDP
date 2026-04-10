"""
Bot Integration Module
======================
This module provides functions for the Discord bot to read settings from MongoDB.
Import this in your bot_fixed.py to use MongoDB-backed settings.

Usage in bot:
    from bot_integration import BotSettingsManager
    
    settings_manager = BotSettingsManager("mongodb://localhost:27017", "kingdom_bot")
    await settings_manager.connect()
    
    # Get guild settings
    guild_settings = await settings_manager.get_guild_settings(guild_id)
    logs_config = guild_settings.get("logs", {})
    welcome_config = guild_settings.get("welcome", {})
    
    # Update a setting
    await settings_manager.update_setting(guild_id, "logs", {"msg": "channel_id"})
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient


class BotSettingsManager:
    def __init__(self, mongodb_uri: str = "mongodb://localhost:27017", db_name: str = "kingdom_bot"):
        self.mongodb_uri = mongodb_uri
        self.db_name = db_name
        self.client = None
        self.db = None
        self._cache = {}  # Simple in-memory cache

    async def connect(self):
        """Connect to MongoDB."""
        self.client = AsyncIOMotorClient(self.mongodb_uri)
        self.db = self.client[self.db_name]
        print(f"[BotSettings] Connected to MongoDB: {self.db_name}")

    async def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()

    async def get_guild_settings(self, guild_id: str) -> dict:
        """Get all settings for a guild. Returns empty dict sections if not found."""
        if guild_id in self._cache:
            return self._cache[guild_id]

        settings = await self.db.guild_settings.find_one({"guild_id": str(guild_id)})
        if settings:
            settings.pop("_id", None)
            self._cache[guild_id] = settings
            return settings

        # Return default settings
        return {
            "guild_id": str(guild_id),
            "general": {"prefix": "!", "language": "ar"},
            "logs": {},
            "welcome": {"enabled": True, "channel": "", "message": "Welcome {user} to {server}!", "embed": True, "image_url": ""},
            "leave": {"enabled": False, "channel": "", "message": "{user} has left {server}."},
            "level": {"enabled": True, "xp_rate": 1.0, "level_up_message": "", "announcement_channel": "", "role_rewards": {}},
            "vc": {"enabled": True, "xp_per_minute": 1.0, "min_members": 2, "mute_xp": False},
            "anti_cheat": {"anti_spam": False, "anti_link": False, "anti_badwords": False, "badwords": [], "link_whitelist": [], "exempt_roles": []},
            "moderation": {"mod_roles": [], "mute_role": "", "ban_enabled": True, "kick_enabled": True, "mute_enabled": True, "warn_enabled": True, "cooldown": 5},
            "auto_roles": {"enabled": False, "roles": []},
            "tickets": {"enabled": False},
            "economy": {"enabled": True, "currency_name": "coins", "starting_balance": 0, "daily_amount": 100, "daily_cooldown": 86400},
            "shop": {"enabled": True, "items": []},
            "auto_replies": [],
            "companies": {},
            "aliases": {},
            "permissions": {"admin_roles": [], "mod_roles": [], "dj_roles": []},
            "embed_style": {"use_embeds": True, "default_color": "#5865F2"},
            "embed_buttons": {"buttons": []},
            "captcha": {"enabled": False},
        }

    async def get_section(self, guild_id: str, section: str) -> dict:
        """Get a specific settings section for a guild."""
        settings = await self.get_guild_settings(guild_id)
        return settings.get(section, {})

    async def update_setting(self, guild_id: str, section: str, data: dict):
        """Update a settings section for a guild."""
        await self.db.guild_settings.update_one(
            {"guild_id": str(guild_id)},
            {"$set": {section: data}},
            upsert=True,
        )
        # Invalidate cache
        self._cache.pop(guild_id, None)

    def invalidate_cache(self, guild_id: str = None):
        """Invalidate cached settings."""
        if guild_id:
            self._cache.pop(guild_id, None)
        else:
            self._cache.clear()

    # Convenience methods matching existing bot config patterns
    async def get_logs_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "logs")

    async def get_welcome_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "welcome")

    async def get_level_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "level")

    async def get_vc_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "vc")

    async def get_economy_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "economy")

    async def get_shop_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "shop")

    async def get_companies(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "companies")

    async def get_aliases(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "aliases")

    async def get_anti_cheat_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "anti_cheat")

    async def get_auto_roles(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "auto_roles")

    async def get_ticket_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "tickets")

    async def get_moderation_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "moderation")

    async def get_permissions_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "permissions")

    async def get_embed_buttons(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "embed_buttons")

    async def get_captcha_config(self, guild_id: str) -> dict:
        return await self.get_section(guild_id, "captcha")

    # Bank/economy data methods
    async def get_user_bank(self, guild_id: str, user_id: str) -> dict:
        data = await self.db.bank_data.find_one({"guild_id": str(guild_id), "user_id": str(user_id)})
        if data:
            data.pop("_id", None)
            return data
        return {"guild_id": str(guild_id), "user_id": str(user_id), "balance": 0, "bank": 0}

    async def update_user_bank(self, guild_id: str, user_id: str, data: dict):
        await self.db.bank_data.update_one(
            {"guild_id": str(guild_id), "user_id": str(user_id)},
            {"$set": data},
            upsert=True,
        )

    # User XP/level data methods
    async def get_user_data(self, guild_id: str, user_id: str) -> dict:
        data = await self.db.user_data.find_one({"guild_id": str(guild_id), "user_id": str(user_id)})
        if data:
            data.pop("_id", None)
            return data
        return {"guild_id": str(guild_id), "user_id": str(user_id), "xp": 0, "level": 0, "vc_xp": 0, "vc_level": 0}

    async def update_user_data(self, guild_id: str, user_id: str, data: dict):
        await self.db.user_data.update_one(
            {"guild_id": str(guild_id), "user_id": str(user_id)},
            {"$set": data},
            upsert=True,
        )

    # Warnings
    async def get_warnings(self, guild_id: str, user_id: str) -> list:
        cursor = self.db.warnings.find({"guild_id": str(guild_id), "user_id": str(user_id)})
        warnings = []
        async for w in cursor:
            w.pop("_id", None)
            warnings.append(w)
        return warnings

    async def add_warning(self, guild_id: str, user_id: str, reason: str, mod_id: str):
        import datetime
        await self.db.warnings.insert_one({
            "guild_id": str(guild_id),
            "user_id": str(user_id),
            "reason": reason,
            "mod_id": str(mod_id),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        })
