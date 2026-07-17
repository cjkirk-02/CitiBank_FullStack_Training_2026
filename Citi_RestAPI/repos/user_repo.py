from db import users_db
from models.user_model import User


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


# Instantiate the single repository instance
user_repository = UserRepository()