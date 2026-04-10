from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI, MONGODB_DB

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB]
    # Create indexes
    await db.guild_settings.create_index("guild_id", unique=True)
    await db.users.create_index("discord_id", unique=True)
    await db.user_data.create_index([("guild_id", 1), ("user_id", 1)], unique=True)
    await db.bank_data.create_index([("guild_id", 1), ("user_id", 1)], unique=True)
    await db.warnings.create_index([("guild_id", 1), ("user_id", 1)])
    await db.shop_items.create_index([("guild_id", 1)])
    await db.auto_replies.create_index([("guild_id", 1)])
    await db.invite_data.create_index([("guild_id", 1), ("user_id", 1)], unique=True)
    print(f"Connected to MongoDB: {MONGODB_DB}")


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db
