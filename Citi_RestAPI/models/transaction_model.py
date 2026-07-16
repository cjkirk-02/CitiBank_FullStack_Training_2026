from bson import ObjectId
from datetime import datetime, timezone

class Transaction:
    def __init__(self, transaction_id: str, account_id: str, transaction_type: str, amount: float, timestamp: datetime = None):
        self.id = str(transaction_id) if transaction_id else None
        self.account_id = str(account_id)
        self.transaction_type = transaction_type  # "deposit" or "withdrawal"
        self.amount = float(amount)
        self.timestamp = timestamp or datetime.now(timezone.utc)

    def to_dict(self):
        return {
            "id": self.id,
            "account_id": self.account_id,
            "transaction_type": self.transaction_type,
            "amount": self.amount,
            "timestamp": self.timestamp.isoformat() if isinstance(self.timestamp, datetime) else self.timestamp
        }

    @staticmethod
    def from_mongo(doc):
        if not doc:
            return None
        return Transaction(
            transaction_id=doc.get("_id"),
            account_id=doc.get("account_id"),
            transaction_type=doc.get("transaction_type"),
            amount=doc.get("amount"),
            timestamp=doc.get("timestamp")
        )