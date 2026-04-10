from fastapi import APIRouter, HTTPException, Depends
from app.services.auth import get_current_user, verify_guild_admin
from app.database import get_db
from app.models.schemas import (
    LogsSettings, WelcomeSettings, LeaveSettings, LevelSettings,
    VCSettings, AntiCheatSettings, ModerationSettings, AutoRoleSettings,
    TicketSettings, EconomySettings, ShopSettings, ShopItem,
    CompanyUpdate, AliasesUpdate, PermissionsSettings,
    EmbedStyleSettings, EmbedButtonsConfig, CaptchaSettings,
    GeneralSettings, AutoReply, GuildSettings,
)

router = APIRouter(prefix="/settings", tags=["settings"])


async def get_guild_settings(guild_id: str) -> dict:
    db = get_db()
    settings = await db.guild_settings.find_one({"guild_id": guild_id})
    if not settings:
        default = GuildSettings(guild_id=guild_id).model_dump()
        await db.guild_settings.update_one(
            {"guild_id": guild_id},
            {"$setOnInsert": default},
            upsert=True,
        )
        settings = await db.guild_settings.find_one({"guild_id": guild_id})
        settings.pop("_id", None)
        return settings
    return settings


async def update_section(guild_id: str, section: str, data: dict):
    db = get_db()
    result = await db.guild_settings.update_one(
        {"guild_id": guild_id},
        {"$set": {section: data}},
        upsert=True,
    )
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to save settings")
    return {"status": "ok", "section": section}


# ---- Get All Settings ----
@router.get("/{guild_id}")
async def get_all_settings(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    settings.pop("_id", None)
    return settings


# ---- General ----
@router.get("/{guild_id}/general")
async def get_general(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("general", GeneralSettings().model_dump())


@router.put("/{guild_id}/general")
async def update_general(guild_id: str, data: GeneralSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "general", data.model_dump())


# ---- Logs ----
@router.get("/{guild_id}/logs")
async def get_logs(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("logs", LogsSettings().model_dump())


@router.put("/{guild_id}/logs")
async def update_logs(guild_id: str, data: LogsSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "logs", data.model_dump())


# ---- Welcome ----
@router.get("/{guild_id}/welcome")
async def get_welcome(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("welcome", WelcomeSettings().model_dump())


@router.put("/{guild_id}/welcome")
async def update_welcome(guild_id: str, data: WelcomeSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "welcome", data.model_dump())


# ---- Leave ----
@router.get("/{guild_id}/leave")
async def get_leave(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("leave", LeaveSettings().model_dump())


@router.put("/{guild_id}/leave")
async def update_leave(guild_id: str, data: LeaveSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "leave", data.model_dump())


# ---- Level ----
@router.get("/{guild_id}/level")
async def get_level(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("level", LevelSettings().model_dump())


@router.put("/{guild_id}/level")
async def update_level(guild_id: str, data: LevelSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "level", data.model_dump())


# ---- VC XP ----
@router.get("/{guild_id}/vc")
async def get_vc(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("vc", VCSettings().model_dump())


@router.put("/{guild_id}/vc")
async def update_vc(guild_id: str, data: VCSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "vc", data.model_dump())


# ---- Anti-Cheat ----
@router.get("/{guild_id}/anti_cheat")
async def get_anti_cheat(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("anti_cheat", AntiCheatSettings().model_dump())


@router.put("/{guild_id}/anti_cheat")
async def update_anti_cheat(guild_id: str, data: AntiCheatSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "anti_cheat", data.model_dump())


# ---- Moderation ----
@router.get("/{guild_id}/moderation")
async def get_moderation(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("moderation", ModerationSettings().model_dump())


@router.put("/{guild_id}/moderation")
async def update_moderation(guild_id: str, data: ModerationSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "moderation", data.model_dump())


# ---- Auto Roles ----
@router.get("/{guild_id}/auto_roles")
async def get_auto_roles(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("auto_roles", AutoRoleSettings().model_dump())


@router.put("/{guild_id}/auto_roles")
async def update_auto_roles(guild_id: str, data: AutoRoleSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "auto_roles", data.model_dump())


# ---- Tickets ----
@router.get("/{guild_id}/tickets")
async def get_tickets(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("tickets", TicketSettings().model_dump())


@router.put("/{guild_id}/tickets")
async def update_tickets(guild_id: str, data: TicketSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "tickets", data.model_dump())


# ---- Economy ----
@router.get("/{guild_id}/economy")
async def get_economy(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("economy", EconomySettings().model_dump())


@router.put("/{guild_id}/economy")
async def update_economy(guild_id: str, data: EconomySettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "economy", data.model_dump())


# ---- Shop ----
@router.get("/{guild_id}/shop")
async def get_shop(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("shop", ShopSettings().model_dump())


@router.put("/{guild_id}/shop")
async def update_shop(guild_id: str, data: ShopSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "shop", data.model_dump())


# ---- Auto Replies ----
@router.get("/{guild_id}/auto_replies")
async def get_auto_replies(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("auto_replies", [])


@router.put("/{guild_id}/auto_replies")
async def update_auto_replies(guild_id: str, data: list[AutoReply], user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "auto_replies", [r.model_dump() for r in data])


# ---- Companies ----
@router.get("/{guild_id}/companies")
async def get_companies(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("companies", {})


@router.put("/{guild_id}/companies")
async def update_companies(guild_id: str, data: dict, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "companies", data)


# ---- Aliases ----
@router.get("/{guild_id}/aliases")
async def get_aliases(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("aliases", {})


@router.put("/{guild_id}/aliases")
async def update_aliases(guild_id: str, data: dict, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "aliases", data)


# ---- Permissions ----
@router.get("/{guild_id}/permissions")
async def get_permissions(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("permissions", PermissionsSettings().model_dump())


@router.put("/{guild_id}/permissions")
async def update_permissions(guild_id: str, data: PermissionsSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "permissions", data.model_dump())


# ---- Embed Style ----
@router.get("/{guild_id}/embed_style")
async def get_embed_style(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("embed_style", EmbedStyleSettings().model_dump())


@router.put("/{guild_id}/embed_style")
async def update_embed_style(guild_id: str, data: EmbedStyleSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "embed_style", data.model_dump())


# ---- Embed Buttons ----
@router.get("/{guild_id}/embed_buttons")
async def get_embed_buttons(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("embed_buttons", EmbedButtonsConfig().model_dump())


@router.put("/{guild_id}/embed_buttons")
async def update_embed_buttons(guild_id: str, data: EmbedButtonsConfig, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "embed_buttons", data.model_dump())


# ---- Captcha ----
@router.get("/{guild_id}/captcha")
async def get_captcha(guild_id: str, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    settings = await get_guild_settings(guild_id)
    return settings.get("captcha", CaptchaSettings().model_dump())


@router.put("/{guild_id}/captcha")
async def update_captcha(guild_id: str, data: CaptchaSettings, user: dict = Depends(get_current_user)):
    await verify_guild_admin(guild_id, user)
    return await update_section(guild_id, "captcha", data.model_dump())
