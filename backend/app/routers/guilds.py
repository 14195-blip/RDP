from fastapi import APIRouter, HTTPException, Depends
from app.services.auth import get_current_user
from app.services.discord import get_guild_channels, get_guild_roles, get_guild_info, check_user_is_admin
from app.database import get_db

router = APIRouter(prefix="/guilds", tags=["guilds"])


@router.get("/{guild_id}/info")
async def guild_info(guild_id: str, user: dict = Depends(get_current_user)):
    """Get guild info (name, icon, member count)."""
    try:
        info = await get_guild_info(guild_id)
        return {
            "id": info["id"],
            "name": info["name"],
            "icon": info.get("icon"),
            "member_count": info.get("approximate_member_count", 0),
            "description": info.get("description", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Guild not found: {str(e)}")


@router.get("/{guild_id}/channels")
async def guild_channels(guild_id: str, user: dict = Depends(get_current_user)):
    """Get guild channels."""
    try:
        channels = await get_guild_channels(guild_id)
        return [
            {
                "id": ch["id"],
                "name": ch["name"],
                "type": ch["type"],
                "position": ch.get("position", 0),
                "parent_id": ch.get("parent_id"),
            }
            for ch in channels
        ]
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{guild_id}/roles")
async def guild_roles(guild_id: str, user: dict = Depends(get_current_user)):
    """Get guild roles."""
    try:
        roles = await get_guild_roles(guild_id)
        return [
            {
                "id": r["id"],
                "name": r["name"],
                "color": r.get("color", 0),
                "position": r.get("position", 0),
                "permissions": r.get("permissions", "0"),
                "managed": r.get("managed", False),
            }
            for r in sorted(roles, key=lambda x: x.get("position", 0), reverse=True)
        ]
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
