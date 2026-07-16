from flask import Flask
from flask_cors import CORS  # <-- Import CORS
from controllers.user_controller import user_bp
from controllers.account_controller import account_bp

app = Flask(__name__)
CORS(app)  # <-- This enables CORS for all routes across your entire API!

app.register_blueprint(user_bp)
app.register_blueprint(account_bp)

if __name__ == '__main__':
    app.run(debug=True)