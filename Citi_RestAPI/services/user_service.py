from models.user_model import User
from repos.user_repo import user_repository


class UserService:
    def __init__(self, repo):
        self.repo = repo

    def fetch_all_users(self):
        users = self.repo.get_all()
        return [user.to_dict() for user in users]

    def create_user(self, name: str, email: str, username: str, password: str, role: str = "customer"):
        # Clean input before saving
        clean_email = email.strip().lower()
        clean_username = username.strip()
        clean_role = (role or "customer").strip().lower() or "customer"

        # Instantiate a new User model (ID will be set by repo)
        new_user_model = User(
            user_id=None,
            name=name,
            email=clean_email,
            username=clean_username,
            password=password,
            role=clean_role,
        )

        saved_user = self.repo.save(new_user_model)
        return saved_user.to_dict()


# Instantiate the service, injecting our single repository instance
user_service = UserService(user_repository)