from bson import ObjectId
from datetime import datetime, timezone

class Account:
    def __init__(self, account_id: str, user_id: str, account_type: str, balance: float = 0.0, created_at: datetime = None):
        self.id = str(account_id) if account_id else None
        self.user_id = str(user_id)  # References the ID of the User model
        self.account_type = account_type
        self.balance = float(balance)
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "account_type": self.account_type,
            "balance": self.balance,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

    @staticmethod
    def from_mongo(doc):
        if not doc:
            return None
        return Account(
            account_id=doc.get("_id"),
            user_id=doc.get("user_id"),
            account_type=doc.get("account_type"),
            balance=doc.get("balance", 0.0),
            created_at=doc.get("created_at")
        )