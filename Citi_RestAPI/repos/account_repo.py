from pymongo import MongoClient
from db import accounts_db
from bson import ObjectId
from models.account_model import Account  # Ensure imports are correct

class AccountRepository:
    def __init__(self):
        self.collection = accounts_db["accounts"]

    def get_all(self):
        docs = self.collection.find()
        return [Account.from_mongo(doc) for doc in docs]
    
    def find_by_user_id(self, user_id: str):
        docs = self.collection.find({"user_id": ObjectId(user_id)})
        return [Account.from_mongo(doc) for doc in docs]

    def find_by_id(self, account_id: str):
        doc = self.collection.find_one({"_id": ObjectId(account_id)})
        return Account.from_mongo(doc) if doc else None

    def save(self, account: Account):
        account_document = {
            "user_id": ObjectId(account.user_id),  # Stored as ObjectId for relationship indexing
            "account_type": account.account_type,
            "balance": account.balance,
            "created_at": account.created_at
        }
        result = self.collection.insert_one(account_document)
        account.id = str(result.inserted_id)
        return account

    def update_balance(self, account_id: str, new_balance: float):
        self.collection.update_one(
            {"_id": ObjectId(account_id)},
            {"$set": {"balance": new_balance}}
        )

    def delete_by_id(self, account_id: str):
        try:
            result = self.collection.delete_one({"_id": ObjectId(account_id)})
        except Exception:
            raise ValueError("Invalid account_id format.")
        return result.deleted_count > 0

# Instantiate single repository instance
account_repository = AccountRepository()