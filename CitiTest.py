from abc import ABC, abstractmethod

# Abstract base class for all Users, Admin and Customer will inherit from this class
class User(ABC):
    @abstractmethod
    def __init__(self, username, password):
        self.username = username
        self._password = password

    def getrole(self):
        return "User"

    def getUsername(self):
        return self.username

    def getPassword(self):
        return self._password

    def setUsername(self, username):
        self.username = username

    def setPassword(self, password):
        self._password = password


class Admin(User):
    def __init__(self, username, password):
        super().__init__(username, password)

    def getrole(self):
        return "Admin"


class Customer(User):
    def __init__(self, username, password):
        super().__init__(username, password)

    def getrole(self):
        return "User"


class Bank:
    def __init__(self, id, name, customers):
        self.id = id
        self.name = name
        self.customers = customers

    def getid(self):
        return self.id

    def setid(self, id):
        self.id = id

    def getname(self):
        return self.name

    def setname(self, name):
        self.name = name

    def getcustomers(self):
        return self.customers

    def setcustomers(self, customers):
        self.customers = customers


# Abstract base class for all Accounts, SavingsAccount and CheckingAccount inherit from this
class Account(ABC):
    @abstractmethod
    def __init__(self, id, balance, owner):
        self.id = id
        self.balance = balance
        self.owner = owner  # username of the Customer who owns this account

    def getid(self):
        return self.id

    def getbalance(self):
        return self.balance

    def setbalance(self, balance):
        self.balance = balance

    def getowner(self):
        return self.owner

    def setowner(self, owner):
        self.owner = owner

    def getaccounttype(self):
        return type(self).__name__


# Abstract interface describing the operations any account must support
class AccountOperations(ABC):
    @abstractmethod
    def deposit(self, amount):
        pass

    @abstractmethod
    def withdraw(self, amount):
        pass

    @abstractmethod
    def transfer(self, amount, target_account):
        pass


class SavingsAccount(Account, AccountOperations):
    MIN_BALANCE = 100.0

    def __init__(self, id, balance, owner):
        super().__init__(id, balance, owner)

    def deposit(self, amount):
        if amount <= 0:
            print("Deposit amount must be positive.")
            return False
        self.balance += amount
        print(f"Deposited ${amount:.2f}. New balance: ${self.balance:.2f}")
        return True

    def withdraw(self, amount):
        if amount <= 0:
            print("Withdrawal amount must be positive.")
            return False
        if self.balance - amount < self.MIN_BALANCE:
            print(f"Insufficient funds. Savings accounts must maintain a minimum "
                  f"balance of ${self.MIN_BALANCE:.2f}.")
            return False
        self.balance -= amount
        print(f"Withdrew ${amount:.2f}. New balance: ${self.balance:.2f}")
        return True

    def transfer(self, amount, target_account):
        if self.withdraw(amount):
            target_account.deposit(amount)
            print(f"Transferred ${amount:.2f} to account {target_account.getid()}.")
            return True
        return False


class CheckingAccount(Account, AccountOperations):
    OVERDRAFT_LIMIT = 200.0

    def __init__(self, id, balance, owner):
        super().__init__(id, balance, owner)

    def deposit(self, amount):
        if amount <= 0:
            print("Deposit amount must be positive.")
            return False
        self.balance += amount
        print(f"Deposited ${amount:.2f}. New balance: ${self.balance:.2f}")
        return True

    def withdraw(self, amount):
        if amount <= 0:
            print("Withdrawal amount must be positive.")
            return False
        if self.balance - amount < -self.OVERDRAFT_LIMIT:
            print(f"Insufficient funds. Checking accounts have an overdraft "
                  f"limit of ${self.OVERDRAFT_LIMIT:.2f}.")
            return False
        self.balance -= amount
        print(f"Withdrew ${amount:.2f}. New balance: ${self.balance:.2f}")
        return True

    def transfer(self, amount, target_account):
        if self.withdraw(amount):
            target_account.deposit(amount)
            print(f"Transferred ${amount:.2f} to account {target_account.getid()}.")
            return True
        return False


# --- Helper lookup functions shared by both dashboards ---

def find_user(userList, username):
    for user in userList:
        if user.getUsername() == username:
            return user
    return None


def find_account(accountList, account_id):
    for account in accountList:
        if str(account.getid()) == str(account_id):
            return account
    return None


def generate_account_id(accountList):
    if not accountList:
        return 1
    return max(account.getid() for account in accountList) + 1


def select_own_account(my_accounts):
    if not my_accounts:
        print("You have no accounts.")
        return None
    if len(my_accounts) == 1:
        return my_accounts[0]
    print("Select an account:")
    for account in my_accounts:
        print(f"- ID: {account.getid()}, Type: {account.getaccounttype()}, "
              f"Balance: ${account.getbalance():.2f}")
    print("Enter the account ID:")
    account_id = input()
    for account in my_accounts:
        if str(account.getid()) == str(account_id):
            return account
    print(f"No account found with ID '{account_id}'.")
    return None


def read_amount(prompt):
    print(prompt)
    try:
        return float(input())
    except ValueError:
        print("Invalid amount.")
        return None


# Admin Dashboard function to display options for admin users and perform actions based on their selection
def AdminDashboard(userList, accountList):
    while True:
        print("Select an option:\n1. Create Customer\n2. View Customers\n"
              "3. Update Customer\n4. Delete Customer\n5. Create Account\n6. View Accounts\n"
              "7. Update Account\n8. Delete Account\n9. Logout")
        selection = input()

        match selection:
            case "1":
                print("Enter a username for the new customer:")
                username = input()
                if find_user(userList, username):
                    print(f"A user with username '{username}' already exists.")
                    continue
                print("Enter a password for the new customer:")
                password = input()
                userList.append(Customer(username, password))
                print(f"Customer '{username}' created successfully.")

            case "2":
                customers = [user for user in userList if user.getrole() == "User"]
                if not customers:
                    print("No customers found.")
                else:
                    print("Customers:")
                    for customer in customers:
                        print(f"- {customer.getUsername()}")

            case "3":
                print("Enter the username of the customer to update:")
                username = input()
                user = find_user(userList, username)
                if user is None or user.getrole() != "User":
                    print(f"No customer found with username '{username}'.")
                    continue
                print("Enter the new username (leave blank to keep unchanged):")
                new_username = input()
                print("Enter the new password (leave blank to keep unchanged):")
                new_password = input()
                if new_username:
                    # keep owned accounts in sync with the renamed customer
                    for account in accountList:
                        if account.getowner() == username:
                            account.setowner(new_username)
                    user.setUsername(new_username)
                    username = new_username
                if new_password:
                    user.setPassword(new_password)
                print(f"Customer '{username}' updated successfully.")

            case "4":
                print("Enter the username of the customer to delete:")
                username = input()
                user = find_user(userList, username)
                if user is None or user.getrole() != "User":
                    print(f"No customer found with username '{username}'.")
                    continue
                userList.remove(user)
                accountList[:] = [account for account in accountList if account.getowner() != username]
                print(f"Customer '{username}' deleted successfully.")

            case "5":
                print("Enter the username of the customer to open the account for:")
                username = input()
                user = find_user(userList, username)
                if user is None or user.getrole() != "User":
                    print(f"No customer found with username '{username}'.")
                    continue
                print("Select account type:\n1. Savings\n2. Checking")
                acctype = input()
                balance = read_amount("Enter the opening balance:")
                if balance is None:
                    continue
                new_id = generate_account_id(accountList)
                if acctype == "1":
                    accountList.append(SavingsAccount(new_id, balance, username))
                elif acctype == "2":
                    accountList.append(CheckingAccount(new_id, balance, username))
                else:
                    print("Invalid account type selected.")
                    continue
                print(f"Account {new_id} created successfully for '{username}'.")

            case "6":
                if not accountList:
                    print("No accounts found.")
                else:
                    print("Accounts:")
                    for account in accountList:
                        print(f"- ID: {account.getid()}, Owner: {account.getowner()}, "
                              f"Type: {account.getaccounttype()}, Balance: ${account.getbalance():.2f}")

            case "7":
                print("Enter the account ID to update:")
                account_id = input()
                account = find_account(accountList, account_id)
                if account is None:
                    print(f"No account found with ID '{account_id}'.")
                    continue
                print("Enter the new balance (leave blank to keep unchanged):")
                new_balance = input()
                if new_balance:
                    try:
                        account.setbalance(float(new_balance))
                    except ValueError:
                        print("Invalid balance amount.")
                        continue
                print(f"Account {account_id} updated successfully.")

            case "8":
                print("Enter the account ID to delete:")
                account_id = input()
                account = find_account(accountList, account_id)
                if account is None:
                    print(f"No account found with ID '{account_id}'.")
                    continue
                accountList.remove(account)
                print(f"Account {account_id} deleted successfully.")

            case "9":
                print("Logging out...")
                return

            case _:
                print("Invalid selection. Please try again.")
                continue


# Customer Dashboard function to display options for customer users and perform actions based on their selection
def CustomerDashboard(current_user, accountList):
    while True:
        print("Select an option:\n1. View Accounts\n2. Deposit\n3. Withdraw\n4. Transfer\n5. Logout")
        selection = input()

        # Filter the accounts to only those owned by the current user (for Viewing User Owned Accounts)
        my_accounts = [account for account in accountList if account.getowner() == current_user.getUsername()]

        match selection:
            case "1":
                # check if user has accounts, displays them if they do, otherwise informs them they have no accounts.
                if not my_accounts:
                    print("You have no accounts.")
                else:
                    print("Your Accounts:")
                    for account in my_accounts:
                        print(f"- ID: {account.getid()}, Type: {account.getaccounttype()}, "
                              f"Balance: ${account.getbalance():.2f}")

            case "2":
                account = select_own_account(my_accounts)
                if account is None:
                    continue
                amount = read_amount("Enter the deposit amount:")
                if amount is None:
                    continue
                account.deposit(amount)

            case "3":
                account = select_own_account(my_accounts)
                if account is None:
                    continue
                amount = read_amount("Enter the withdrawal amount:")
                if amount is None:
                    continue
                account.withdraw(amount)

            case "4":
                account = select_own_account(my_accounts)
                if account is None:
                    continue
                print("Enter the ID of the account to transfer to:")
                target_id = input()
                target_account = find_account(accountList, target_id)
                if target_account is None:
                    print(f"No account found with ID '{target_id}'.")
                    continue
                if target_account.getid() == account.getid():
                    print("Cannot transfer to the same account.")
                    continue
                amount = read_amount("Enter the transfer amount:")
                if amount is None:
                    continue
                account.transfer(amount, target_account)

            case "5":
                print("Logging out...")
                return

            case _:
                print("Invalid selection. Please try again.")
                continue


class Runner:
    userList = [Admin("admin", "admin123"), Customer("user1", "password1"), Customer("user2", "password2")]
    accountList = [SavingsAccount(1, 500.0, "user1"), CheckingAccount(2, 1000.0, "user2")]

    def __init__(self):
        self.run(self)

    def createprofiles(self):
        userAdmin = Admin("admin", "admin123")
        return userAdmin

    @staticmethod
    def login(self):
        print("Please enter your username and password (space-separated):")
        usernamepassword = input()
        try:
            username, password = usernamepassword.split(" ")
        except ValueError:
            print("Invalid input. Please enter username and password separated by a space.")
            return None

        for user in self.userList:
            if username == user.getUsername() and password == user.getPassword():
                if user.getrole() == "Admin":
                    print("Admin Login successful!")
                else:
                    print(f"User Login successful! Welcome {user.getUsername()}")
                return user
        return None

    @staticmethod
    def run(self):
        print("Welcome to the Bank Application!")

        flag = True
        while flag:
            user = self.login(self)
            if user is None:
                print("Invalid Login. Please try again.")
            elif user.getrole() == "Admin":
                AdminDashboard(self.userList, self.accountList)
            else:
                CustomerDashboard(user, self.accountList)

            print("Do you want to continue? (y/n)")
            choice = input().lower()
            if choice == "n":
                flag = False


if __name__ == "__main__":
    Runner()
