import bcrypt
from datetime import datetime, timezone


class User:
    def __init__(
        self,
        user_id: str,
        name: str,
        email: str,
        username: str = None,
        password: str = None,
        role: str = "customer",
        time_created: datetime = None,
    ):
        # Store ID as a string for easier API serialization
        self.id = str(user_id) if user_id else None
        self.name = name
        self.email = email
        self.username = username
        self.password = password
        self.role = role or "customer"
        self.time_created = time_created or datetime.now(timezone.utc)

    def set_password(self, password: str):
        if not password:
            return
        self.password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "username": self.username,
            "role": self.role,
            "time_created": self.time_created.isoformat() if isinstance(self.time_created, datetime) else self.time_created,
        }

    @staticmethod
    def from_mongo(doc):
        """Helper to convert a raw MongoDB document into a User model instance."""
        if not doc:
            return None
        return User(
            user_id=doc.get("_id"),
            name=doc.get("name"),
            email=doc.get("email"),
            username=doc.get("username"),
            password=doc.get("password"),
            role=doc.get("role", "customer"),
            time_created=doc.get("time_created"),
        )