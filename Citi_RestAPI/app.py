from flask import Flask
from flask_cors import CORS
from controllers.user_controller import user_bp
from controllers.account_controller import account_bp
from jwtTest import init_jwt

app = Flask(__name__)
CORS(app)

init_jwt(app)

app.register_blueprint(user_bp)
app.register_blueprint(account_bp)

if __name__ == '__main__':
    app.run(debug=True)