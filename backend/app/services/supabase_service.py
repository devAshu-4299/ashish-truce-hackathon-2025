from supabase import create_client, Client
from app.core.config import settings
from typing import Optional, List, Dict

class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        self.consents_table = "user_consents"
        self.consent_history_table = "consent_history"

    async def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate user with email and password"""
        try:
            response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return response.user if response else None
        except Exception as e:
            print(f"Error authenticating user: {e}")
            return None

    async def create_user(self, email: str, password: str) -> Optional[Dict]:
        """Create a new user"""
        try:
            response = self.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "email_confirm": True,  # Enable email verification
                    "data": {
                        "email_confirmed": False
                    }
                }
            })
            return response.user if response else None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None

    async def verify_email(self, token: str) -> bool:
        """Verify user's email"""
        try:
            response = self.client.auth.verify_email(token)
            return bool(response)
        except Exception as e:
            print(f"Error verifying email: {e}")
            return False

    async def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        try:
            response = self.client.table('users').select('*').eq('id', user_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None

    async def create_summary(self, summary_data: Dict) -> Dict:
        """Create a new AI summary"""
        try:
            response = self.client.table('ai_summaries').insert(summary_data).execute()
            return response.data[0]
        except Exception as e:
            raise Exception(f"Error creating summary: {e}")

    async def get_user_summaries(self, user_id: str) -> List[Dict]:
        """Get all summaries for a user"""
        try:
            response = self.client.table('ai_summaries')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .execute()
            return response.data
        except Exception as e:
            raise Exception(f"Error getting summaries: {e}")

    async def get_summary(self, summary_id: str, user_id: str) -> Optional[Dict]:
        """Get a specific summary"""
        try:
            response = self.client.table('ai_summaries')\
                .select('*')\
                .eq('id', summary_id)\
                .eq('user_id', user_id)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            return None

    async def delete_summary(self, summary_id: str, user_id: str) -> bool:
        """Delete a summary"""
        try:
            response = self.client.table('ai_summaries')\
                .delete()\
                .eq('id', summary_id)\
                .eq('user_id', user_id)\
                .execute()
            return bool(response.data)
        except Exception as e:
            return False

    async def update_summary(self, summary_id: str, user_id: str, data: Dict) -> Optional[Dict]:
        """Update a summary"""
        try:
            response = self.client.table('ai_summaries')\
                .update(data)\
                .eq('id', summary_id)\
                .eq('user_id', user_id)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            return None

    async def create_consent(self, data: dict) -> dict:
        """Create a new consent record"""
        response = await self.client.table(self.consents_table).insert(data).execute()
        consent = response.data[0]

        # Create history record
        history_data = {
            "consent_id": consent["id"],
            "cookie_categories": data["cookie_categories"],
            "consent_timestamp": data["consent_timestamp"]
        }
        await self.client.table(self.consent_history_table).insert(history_data).execute()

        return consent

    async def get_user_consents(self, user_id: str, limit: int = 10, offset: int = 0) -> list:
        """Get all consents for a user with pagination"""
        response = await self.client.table(self.consents_table)\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        return response.data

    async def get_consent(self, consent_id: str, user_id: str) -> dict:
        """Get a specific consent by ID"""
        response = await self.client.table(self.consents_table)\
            .select("*")\
            .eq("id", consent_id)\
            .eq("user_id", user_id)\
            .limit(1)\
            .execute()
        return response.data[0] if response.data else None

    async def update_consent(self, consent_id: str, user_id: str, data: dict) -> dict:
        """Update a consent record and create history entry"""
        # Update consent
        response = await self.client.table(self.consents_table)\
            .update(data)\
            .eq("id", consent_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not response.data:
            return None

        consent = response.data[0]

        # Create history record
        history_data = {
            "consent_id": consent_id,
            "cookie_categories": data["cookie_categories"],
            "consent_timestamp": data["consent_timestamp"]
        }
        await self.client.table(self.consent_history_table).insert(history_data).execute()

        return consent

    async def delete_consent(self, consent_id: str, user_id: str) -> bool:
        """Delete a consent record"""
        response = await self.client.table(self.consents_table)\
            .delete()\
            .eq("id", consent_id)\
            .eq("user_id", user_id)\
            .execute()
        return bool(response.data)

    async def get_consent_history(self, consent_id: str, user_id: str, limit: int = 10) -> list:
        """Get history of changes for a consent"""
        # First verify user owns the consent
        consent = await self.get_consent(consent_id, user_id)
        if not consent:
            return []

        response = await self.client.table(self.consent_history_table)\
            .select("*")\
            .eq("consent_id", consent_id)\
            .order("consent_timestamp", desc=True)\
            .limit(limit)\
            .execute()
        return response.data

    async def get_consent_stats(self, user_id: str) -> dict:
        """Get consent statistics for a user"""
        # Get total consents
        total = await self.client.table(self.consents_table)\
            .select("id", count="exact")\
            .eq("user_id", user_id)\
            .execute()

        # Get consents by category
        consents = await self.client.table(self.consents_table)\
            .select("cookie_categories")\
            .eq("user_id", user_id)\
            .execute()

        # Calculate category stats
        category_counts = {}
        for consent in consents.data:
            for category, value in consent["cookie_categories"].items():
                if value:  # Only count accepted categories
                    category_counts[category] = category_counts.get(category, 0) + 1

        # Get recent changes
        recent_changes = await self.client.table(self.consent_history_table)\
            .select("consent_id, cookie_categories, consent_timestamp")\
            .in_("consent_id", [c["id"] for c in consents.data])\
            .order("consent_timestamp", desc=True)\
            .limit(5)\
            .execute()

        # Calculate most common cookies
        cookie_counts = []
        for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
            cookie_counts.append({category: count})

        return {
            "total_consents": total.count,
            "consents_by_category": category_counts,
            "recent_changes": recent_changes.data,
            "most_common_cookies": cookie_counts[:5]  # Top 5 most common
        }
