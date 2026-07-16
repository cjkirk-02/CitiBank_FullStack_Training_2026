import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("Missing MONGO_URI in environment variables.")

# Create a single client connection pool
client = MongoClient(mongo_uri)

# Route to the correct, distinct databases found in your configuration
users_db = client["UsersDB"]
accounts_db = client["AccountsDB"]
transactions_db = client["TransactionsDB"]