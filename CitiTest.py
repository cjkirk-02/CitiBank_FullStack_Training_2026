from abc import ABC, abstractmethod

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
    
class AdminDashboard():
    def __init__(self, admin):
        self.admin = admin

    

class Runner:
    userList = [Admin("admin", "admin123"), Customer("user1", "password1"), Customer("user2", "password2")]

    def __init__(self):
        self.run(self)

    def createprofiles(self):
        userAdmin = Admin("admin", "admin123")
        return userAdmin

    @staticmethod
    def login(self):
        print("Please enter your username:")
        usernamepassword = input()
        username, password = usernamepassword.split(" ")

        for i in range(len(self.userList)):
            if username == self.userList[i].username and password == self.userList[i]._password:
                if self.userList[i].getrole() == "Admin":
                    print("Admin Login successful!")
                    #todo: using switch case present admin options
                    return self.userList[i].getrole()
                else:
                    print(f"User Login successful! Welcome {self.userList[i].username}")
                    #Using switch case present customer options
                    return self.userList[i].getrole()

    @staticmethod
    def run(self):
        print("Welcome to the Bank Application!")
        
        flag = True
        while flag:
            loginoutput = self.login(self)
            if loginoutput == "Admin":
                #AdminDashboard(self)
                AdminDashboard(self)
                pass
            elif loginoutput == "User":
                #CustomerDashboard(self)
                CustomerDashboard(self)
                pass
            else:
                print("Invalid Login. Please try again.")

            print("Do you want to continue? (y/n)")
            choice = input().lower()
            if choice == "n":
                flag = False


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

class Account(ABC):
    @abstractmethod
    def __init__(self, id, balance):
        self.id = id
        self.balance = balance

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

class SavingsAccount(Account):
    def __init__(self, id, balance):
        super().__init__(id, balance)

    

if __name__ == "__main__":
    Runner()
