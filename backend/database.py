"""
Database Connection
"""
from motor.motor_asyncio import AsyncIOMotorClient
from ..config import settings


class Database:
    client: AsyncIOMotorClient = None
    
    async def connect(self):
        """Connect to database"""
        self.client = AsyncIOMotorClient(settings.DATABASE_URL)
        
    async def disconnect(self):
        """Disconnect from database"""
        if self.client:
            self.client.close()
    
    @property
    def db(self):
        return self.client.embpay
    
    @property
    def merchants(self):
        return self.db.merchants
    
    @property
    def checkout_sessions(self):
        return self.db.checkout_sessions
    
    @property
    def orders(self):
        return self.db.orders
    
    @property
    def products(self):
        return self.db.products


db = Database()


async def get_db():
    """Dependency for FastAPI"""
    return db.db
