import httpx
from app.config import (
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    DISCORD_BOT_TOKEN,
    DISCORD_API_BASE,
)


async def exchange_code(code: str) -> dict:
    """Exchange authorization code for access token."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{DISCORD_API_BASE}/oauth2/token",
            data={
                "client_id": DISCORD_CLIENT_ID,
                "client_secret": DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": DISCORD_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_user_info(access_token: str) -> dict:
    """Get current user info from Discord."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DISCORD_API_BASE}/users/@me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_user_guilds(access_token: str) -> list:
    """Get guilds the user is in."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DISCORD_API_BASE}/users/@me/guilds",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_bot_guilds() -> list:
    """Get guilds the bot is in."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DISCORD_API_BASE}/users/@me/guilds",
            headers={"Authorization": f"Bot {DISCORD_BOT_TOKEN}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_guild_info(guild_id: str) -> dict:
    """Get guild info using bot token."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DISCORD_API_BASE}/guilds/{guild_id}",
            headers={"Authorization": f"Bot {DISCORD_BOT_TOKEN}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_guild_channels(guild_id: str) -> list:
    """Get guild channels using bot token."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DISCORD_API_BASE}/guilds/{guild_id}/channels",
            headers={"Authorization": f"Bot {DISCORD_BOT_TOKEN}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_guild_roles(guild_id: str) -> list:
    """Get guild roles using bot token."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DISCORD_API_BASE}/guilds/{guild_id}/roles",
            headers={"Authorization": f"Bot {DISCORD_BOT_TOKEN}"},
        )
        resp.raise_for_status()
        return resp.json()


async def check_user_is_admin(guild_id: str, user_id: str) -> bool:
    """Check if user has admin/manage_guild permission in a guild."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DISCORD_API_BASE}/guilds/{guild_id}/members/{user_id}",
            headers={"Authorization": f"Bot {DISCORD_BOT_TOKEN}"},
        )
        if resp.status_code != 200:
            return False
        member = resp.json()
        # Check if user is owner or has ADMINISTRATOR or MANAGE_GUILD permission
        guild_resp = await client.get(
            f"{DISCORD_API_BASE}/guilds/{guild_id}",
            headers={"Authorization": f"Bot {DISCORD_BOT_TOKEN}"},
        )
        if guild_resp.status_code == 200:
            guild = guild_resp.json()
            if guild.get("owner_id") == user_id:
                return True

        roles = member.get("roles", [])
        guild_roles_resp = await client.get(
            f"{DISCORD_API_BASE}/guilds/{guild_id}/roles",
            headers={"Authorization": f"Bot {DISCORD_BOT_TOKEN}"},
        )
        if guild_roles_resp.status_code == 200:
            guild_roles = guild_roles_resp.json()
            for role in guild_roles:
                if role["id"] in roles:
                    perms = int(role.get("permissions", 0))
                    # ADMINISTRATOR = 0x8, MANAGE_GUILD = 0x20
                    if perms & 0x8 or perms & 0x20:
                        return True
        return False
