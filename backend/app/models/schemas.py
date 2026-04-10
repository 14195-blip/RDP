from pydantic import BaseModel, Field
from typing import Optional


# ---- Auth ----
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    username: str
    discriminator: str = ""
    avatar: Optional[str] = None
    global_name: Optional[str] = None


class GuildInfo(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    owner: bool = False
    permissions: int = 0
    bot_in_guild: bool = False


# ---- Logs Settings ----
class LogsSettings(BaseModel):
    msg: Optional[str] = ""
    join_leave: Optional[str] = ""
    shop: Optional[str] = ""
    ban: Optional[str] = ""
    kick: Optional[str] = ""
    timeout_mute: Optional[str] = ""
    bank: Optional[str] = ""
    roles: Optional[str] = ""


# ---- Welcome Settings ----
class WelcomeSettings(BaseModel):
    enabled: bool = True
    channel: Optional[str] = ""
    message: str = "Welcome {user} to {server}!"
    embed: bool = True
    image_url: Optional[str] = ""


# ---- Leave Settings ----
class LeaveSettings(BaseModel):
    enabled: bool = False
    channel: Optional[str] = ""
    message: str = "{user} has left {server}."


# ---- Level Settings ----
class LevelSettings(BaseModel):
    enabled: bool = True
    xp_rate: float = 1.0
    level_up_message: str = "Congratulations {user}! You reached level {level}!"
    announcement_channel: Optional[str] = ""
    role_rewards: dict = Field(default_factory=dict)


# ---- VC XP Settings ----
class VCSettings(BaseModel):
    enabled: bool = True
    xp_per_minute: float = 1.0
    min_members: int = 2
    mute_xp: bool = False
    activity_roles: dict = Field(default_factory=dict)


# ---- Anti-Cheat Settings ----
class AntiCheatSettings(BaseModel):
    anti_spam: bool = False
    anti_link: bool = False
    anti_badwords: bool = False
    spam_threshold: int = 5
    spam_interval: int = 5
    badwords: list = Field(default_factory=list)
    link_whitelist: list = Field(default_factory=list)
    exempt_roles: list = Field(default_factory=list)


# ---- Moderation Settings ----
class ModerationSettings(BaseModel):
    mod_roles: list = Field(default_factory=list)
    mute_role: Optional[str] = ""
    ban_enabled: bool = True
    kick_enabled: bool = True
    mute_enabled: bool = True
    warn_enabled: bool = True
    cooldown: int = 5


# ---- Auto Roles ----
class AutoRoleSettings(BaseModel):
    enabled: bool = False
    roles: list = Field(default_factory=list)


# ---- Ticket Settings ----
class TicketSettings(BaseModel):
    enabled: bool = False
    category: Optional[str] = ""
    support_roles: list = Field(default_factory=list)
    panel_channel: Optional[str] = ""
    panel_message: str = "Click the button below to create a ticket!"
    panel_title: str = "Support Tickets"
    panel_color: str = "#5865F2"
    panel_image: Optional[str] = ""
    log_channel: Optional[str] = ""
    max_tickets: int = 1


# ---- Economy / Bank Settings ----
class EconomySettings(BaseModel):
    enabled: bool = True
    currency_name: str = "coins"
    currency_symbol: str = "🪙"
    starting_balance: int = 0
    daily_amount: int = 100
    daily_cooldown: int = 86400
    work_min: int = 50
    work_max: int = 200
    work_cooldown: int = 3600
    transfer_enabled: bool = True
    transfer_tax: float = 0.0
    max_balance: int = 1000000


# ---- Shop Item ----
class ShopItem(BaseModel):
    name: str
    description: str = ""
    price: int = 0
    role_id: Optional[str] = ""
    stock: int = -1  # -1 = unlimited
    item_type: str = "role"  # role, perk, item


class ShopSettings(BaseModel):
    enabled: bool = True
    items: list = Field(default_factory=list)


# ---- Auto Reply ----
class AutoReply(BaseModel):
    trigger: str
    response: str
    exact_match: bool = False
    enabled: bool = True


# ---- Companies ----
class CompanyUpdate(BaseModel):
    companies: dict = Field(default_factory=dict)


# ---- Aliases ----
class AliasesUpdate(BaseModel):
    aliases: dict = Field(default_factory=dict)


# ---- Command Settings ----
class CommandSetting(BaseModel):
    name: str
    enabled: bool = True
    cooldown: int = 0
    required_roles: list = Field(default_factory=list)
    disabled_channels: list = Field(default_factory=list)


# ---- Permissions ----
class PermissionsSettings(BaseModel):
    admin_roles: list = Field(default_factory=list)
    mod_roles: list = Field(default_factory=list)
    dj_roles: list = Field(default_factory=list)


# ---- Embed Settings ----
class EmbedStyleSettings(BaseModel):
    use_embeds: bool = True
    default_color: str = "#5865F2"
    footer_text: str = ""
    footer_icon: Optional[str] = ""


# ---- Embed Buttons Config ----
class EmbedButton(BaseModel):
    label: str
    emoji: str = ""
    style: str = "primary"
    title: str = ""
    description: str = ""
    fields: list = Field(default_factory=list)
    footer: str = ""
    color: Optional[str] = None


class EmbedButtonsConfig(BaseModel):
    embed_title: str = "Server Information"
    embed_description: str = "Click the buttons below for more info"
    embed_footer: str = ""
    embed_color: str = "#5865F2"
    buttons: list = Field(default_factory=list)


# ---- Captcha / Verification ----
class CaptchaSettings(BaseModel):
    enabled: bool = False
    channel: Optional[str] = ""
    verified_role: Optional[str] = ""
    captcha_type: str = "reaction"  # reaction, button, text
    message: str = "Please verify yourself to access the server."


# ---- General Settings ----
class GeneralSettings(BaseModel):
    prefix: str = "!"
    language: str = "ar"


# ---- Full Guild Settings ----
class GuildSettings(BaseModel):
    guild_id: str
    general: GeneralSettings = Field(default_factory=GeneralSettings)
    logs: LogsSettings = Field(default_factory=LogsSettings)
    welcome: WelcomeSettings = Field(default_factory=WelcomeSettings)
    leave: LeaveSettings = Field(default_factory=LeaveSettings)
    level: LevelSettings = Field(default_factory=LevelSettings)
    vc: VCSettings = Field(default_factory=VCSettings)
    anti_cheat: AntiCheatSettings = Field(default_factory=AntiCheatSettings)
    moderation: ModerationSettings = Field(default_factory=ModerationSettings)
    auto_roles: AutoRoleSettings = Field(default_factory=AutoRoleSettings)
    tickets: TicketSettings = Field(default_factory=TicketSettings)
    economy: EconomySettings = Field(default_factory=EconomySettings)
    shop: ShopSettings = Field(default_factory=ShopSettings)
    auto_replies: list = Field(default_factory=list)
    companies: dict = Field(default_factory=dict)
    aliases: dict = Field(default_factory=dict)
    commands: list = Field(default_factory=list)
    permissions: PermissionsSettings = Field(default_factory=PermissionsSettings)
    embed_style: EmbedStyleSettings = Field(default_factory=EmbedStyleSettings)
    embed_buttons: EmbedButtonsConfig = Field(default_factory=EmbedButtonsConfig)
    captcha: CaptchaSettings = Field(default_factory=CaptchaSettings)
