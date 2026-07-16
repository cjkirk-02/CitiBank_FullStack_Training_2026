from pymongo import MongoClient
from bson import ObjectId
from models.transaction_model import Transaction

class TransactionRepository:
    def __init__(self):
        # Using the same MongoDB connection setup
        self.uri = "mongodb+srv://kirkc0202_db_user:QtC9EuM7uQ7jefB8@cluster0.wlyybit.mongodb.net/?appName=Cluster0"
        self.client = MongoClient(self.uri)
        self.db = self.client["TransactionDB"]
        self.collection = self.db["transactions"]

    def save(self, transaction: Transaction):
        transaction_document = {
            "account_id": ObjectId(transaction.account_id),  # Linked index relational key
            "transaction_type": transaction.transaction_type,
            "amount": transaction.amount,
            "timestamp": transaction.timestamp
        }
        result = self.collection.insert_one(transaction_document)
        transaction.id = str(result.inserted_id)
        return transaction

    def find_by_account_id(self, account_id: str):
        # Retrieve all transactions matching a specific account ID, sorted newest to oldest
        docs = self.collection.find({"account_id": ObjectId(account_id)}).sort("timestamp", -1)
        return [Transaction.from_mongo(doc) for doc in docs]

# Instantiate single repository instance
transaction_repository = TransactionRepository()