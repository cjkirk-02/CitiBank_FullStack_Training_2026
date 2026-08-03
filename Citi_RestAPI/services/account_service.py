from models.account_model import Account
from models.transaction_model import Transaction
from repos.account_repo import account_repository
from repos.user_repo import user_repository
from repos.transaction_repo import transaction_repository  # Import new repo
from bson import ObjectId

class AccountService:
    def __init__(self, account_repo, user_repo, transaction_repo):
        self.account_repo = account_repo
        self.user_repo = user_repo
        self.transaction_repo = transaction_repo  # Injected dependency

    def fetch_all_accounts(self):
        accounts = self.account_repo.get_all()
        return [account.to_dict() for account in accounts]
    
    def fetch_accounts_by_user(self, user_id: str):
        try:
            user_doc = self.user_repo.collection.find_one({"_id": ObjectId(user_id)})
            if not user_doc:
                raise ValueError("User not found.")
        except Exception:
            raise ValueError("Invalid user_id format or user does not exist.")

        accounts = self.account_repo.find_by_user_id(user_id)
        return [account.to_dict() for account in accounts]

    def create_account(self, user_id: str, account_type: str):
        try:
            user_doc = self.user_repo.collection.find_one({"_id": ObjectId(user_id)})
            if not user_doc:
                raise ValueError("User not found.")
        except Exception:
            raise ValueError("Invalid user_id format or user does not exist.")

        new_account = Account(
            account_id=None,
            user_id=user_id,
            account_type=account_type,
            balance=0.0
        )
        saved_account = self.account_repo.save(new_account)
        return saved_account.to_dict()

    def deposit(self, account_id: str, amount: float):
        if amount <= 0:
            raise ValueError("Deposit amount must be positive.")

        account = self.account_repo.find_by_id(account_id)
        if not account:
            raise ValueError("Account not found.")

        # 1. Calculate and update account balance
        new_balance = account.balance + amount
        self.account_repo.update_balance(account_id, new_balance)
        
        # 2. Record this action in the transactions collection
        new_transaction = Transaction(
            transaction_id=None,
            account_id=account_id,
            transaction_type="deposit",
            amount=amount
        )
        self.transaction_repo.save(new_transaction)

        account.balance = new_balance
        return account.to_dict()

    def withdraw(self, account_id: str, amount: float):
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive.")

        account = self.account_repo.find_by_id(account_id)
        if not account:
            raise ValueError("Account not found.")

        if account.balance < amount:
            raise ValueError("Insufficient funds.")

        # 1. Calculate and update account balance
        new_balance = account.balance - amount
        self.account_repo.update_balance(account_id, new_balance)

        # 2. Record this action in the transactions collection
        new_transaction = Transaction(
            transaction_id=None,
            account_id=account_id,
            transaction_type="withdrawal",
            amount=amount
        )
        self.transaction_repo.save(new_transaction)

        account.balance = new_balance
        return account.to_dict()

    def fetch_transaction_history(self, account_id: str):
        # Confirm the account exists first
        account = self.account_repo.find_by_id(account_id)
        if not account:
            raise ValueError("Account not found.")

        # Get all transactions from repo
        transactions = self.transaction_repo.find_by_account_id(account_id)
        return [tx.to_dict() for tx in transactions]

    def delete_account(self, account_id: str):
        if not account_id:
            return False

        account = self.account_repo.find_by_id(account_id)
        if not account:
            return False

        return self.account_repo.delete_by_id(account_id)

# Instantiate the service with all three required repositories injected
account_service = AccountService(account_repository, user_repository, transaction_repository)