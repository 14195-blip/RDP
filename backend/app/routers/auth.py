from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from app.config import DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI, FRONTEND_URL
from app.services.discord import exchange_code, get_user_info, get_user_guilds, get_bot_guilds
from app.services.auth import create_token
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login")
async def login():
    """Redirect to Discord OAuth2 login."""
    scope = "identify guilds"
    url = (
        f"https://discord.com/api/oauth2/authorize"
        f"?client_id={DISCORD_CLIENT_ID}"
        f"&redirect_uri={DISCORD_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scope}"
    )
    return RedirectResponse(url)


@router.get("/callback")
async def callback(code: str = Query(...)):
    """Handle Discord OAuth2 callback."""
    try:
        token_data = await exchange_code(code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to exchange code: {str(e)}")

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token received")

    try:
        user_info = await get_user_info(access_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get user info: {str(e)}")

    db = get_db()
    await db.users.update_one(
        {"discord_id": user_info["id"]},
        {
            "$set": {
                "discord_id": user_info["id"],
                "username": user_info.get("username", ""),
                "discriminator": user_info.get("discriminator", ""),
                "avatar": user_info.get("avatar"),
                "global_name": user_info.get("global_name"),
                "discord_access_token": access_token,
            }
        },
        upsert=True,
    )

    jwt_token = create_token(user_info["id"], user_info.get("username", ""))
    return RedirectResponse(f"{FRONTEND_URL}/callback?token={jwt_token}")


@router.get("/me")
async def get_me(user: dict = None):
    """Get current user info. Called from frontend with token."""
    from app.services.auth import get_current_user
    from fastapi import Depends
    # This will be called via dependency injection
    pass


@router.get("/guilds")
async def get_guilds_endpoint(token: str = Query(...)):
    """Get user's guilds that the bot is also in."""
    from app.services.auth import decode_token
    payload = decode_token(token)
    user_id = payload["sub"]

    db = get_db()
    user = await db.users.find_one({"discord_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    discord_token = user.get("discord_access_token")
    if not discord_token:
        raise HTTPException(status_code=401, detail="No Discord token found")

    try:
        user_guilds = await get_user_guilds(discord_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Failed to fetch guilds. Please re-login.")

    try:
        bot_guilds = await get_bot_guilds()
        bot_guild_ids = {g["id"] for g in bot_guilds}
    except Exception:
        bot_guild_ids = set()

    result = []
    for guild in user_guilds:
        perms = int(guild.get("permissions", 0))
        # ADMINISTRATOR = 0x8, MANAGE_GUILD = 0x20
        is_admin = bool(perms & 0x8) or bool(perms & 0x20) or guild.get("owner", False)
        if is_admin:
            result.append({
                "id": guild["id"],
                "name": guild["name"],
                "icon": guild.get("icon"),
                "owner": guild.get("owner", False),
                "permissions": perms,
                "bot_in_guild": guild["id"] in bot_guild_ids,
            })

    return result
