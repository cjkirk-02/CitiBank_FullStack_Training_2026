from db import users_db
from models.user_model import User
from bson import ObjectId


class UserRepository:
    def __init__(self):
        self.collection = users_db["users"]

    def get_all(self):
        mongo_docs = self.collection.find()
        return [User.from_mongo(doc) for doc in mongo_docs]

    def get_by_username(self, username: str):
        if not username:
            return None

        mongo_doc = self.collection.find_one({"username": username.strip()})
        return User.from_mongo(mongo_doc)

    def get_by_id(self, user_id: str):
        try:
            mongo_doc = self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
        return User.from_mongo(mongo_doc)

    def save(self, user: User):
        user.role = user.role or "customer"

        if user.password and not user.password.startswith("$2"):
            user.set_password(user.password)

        user_document = {
            "name": user.name,
            "email": user.email,
            "username": user.username,
            "password": user.password,
            "role": user.role,
            "time_created": user.time_created,
        }

        result = self.collection.insert_one(user_document)
        user.id = str(result.inserted_id)
        return user

    def update_by_id(self, user_id: str, updates: dict):
        try:
            mongo_id = ObjectId(user_id)
        except Exception:
            raise ValueError("Invalid user_id format.")

        update_document = {}

        if "name" in updates:
            update_document["name"] = updates["name"]
        if "email" in updates:
            update_document["email"] = updates["email"]
        if "username" in updates:
            update_document["username"] = updates["username"]
        if "role" in updates:
            update_document["role"] = updates["role"]

        if "password" in updates and updates["password"]:
            raw_password = updates["password"]
            if raw_password.startswith("$2"):
                update_document["password"] = raw_password
            else:
                temp_user = User(user_id=None, name="", email="")
                temp_user.set_password(raw_password)
                update_document["password"] = temp_user.password

        if not update_document:
            raise ValueError("No fields provided for update.")

        result = self.collection.update_one(
            {"_id": mongo_id},
            {"$set": update_document}
        )

        if result.matched_count == 0:
            return None

        updated_doc = self.collection.find_one({"_id": mongo_id})
        return User.from_mongo(updated_doc)

    def delete_by_id(self, user_id: str):
        try:
            result = self.collection.delete_one({"_id": ObjectId(user_id)})
        except Exception:
            raise ValueError("Invalid user_id format.")
        return result.deleted_count > 0


# Instantiate the single repository instance
user_repository = UserRepository()