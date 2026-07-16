from db import users_db
from models.user_model import User


class UserRepository:
    def __init__(self):
        self.collection = users_db["users"]

    def get_all(self):
        # Find all documents in the 'users' collection
        mongo_docs = self.collection.find()
        # Convert each raw document dictionary into a User model instance
        return [User.from_mongo(doc) for doc in mongo_docs]

    def save(self, user: User):
        user.role = user.role or "customer"

        if user.password and not user.password.startswith("$2"):
            user.set_password(user.password)

        # Build the payload to insert into MongoDB
        user_document = {
            "name": user.name,
            "email": user.email,
            "username": user.username,
            "password": user.password,
            "role": user.role,
            "time_created": user.time_created,
        }

        # Insert into MongoDB. Atlas will automatically generate a unique '_id' for us
        result = self.collection.insert_one(user_document)

        # Assign the newly generated MongoDB ID back to our user object
        user.id = str(result.inserted_id)
        return user


# Instantiate the single repository instance
user_repository = UserRepository()