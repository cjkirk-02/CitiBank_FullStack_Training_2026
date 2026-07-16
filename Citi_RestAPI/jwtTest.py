from functools import wraps
from datetime import timedelta
from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt
)

app = Flask(__name__)

# Configure JWT
app.config['JWT_SECRET_KEY'] = 'your-super-secret-key-change-this'  # Use a secure env variable in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes = 10)  # Tokens expire in 10 minutes
jwt = JWTManager(app)

# Mock database mapping users to their password and role
USERS = {
    "alice": {"password": "userpass", "role": "User"},
    "bob": {"password": "adminpass", "role": "Admin"}
}


# --- CUSTOM DECORATOR FOR ROLE VERIFICATION ---
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # 1. Verify a valid JWT is in the request
            # (equivalent to putting @jwt_required() on the endpoint)
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request()
            
            # 2. Extract the claims and check the role
            claims = get_jwt()
            if claims.get("role") != "Admin":
                return jsonify({"error": "Admin privilege required"}), 403
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper


# --- ENDPOINTS ---

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = USERS.get(username)
    # NOTE: In a real app, verify the password using pbkdf2/bcrypt hashes!
    if not user or user['password'] != password:
        return jsonify({"error": "Bad username or password"}), 401

    # Add custom "role" claim to the access token
    access_token = create_access_token(
        identity=username, 
        additional_claims={"role": user['role']}
    )
    return jsonify(access_token=access_token), 200


# Standard user endpoint (Accessible by both User and Admin)
@app.route('/dashboard', methods=['GET'])
@jwt_required()
def user_dashboard():
    claims = get_jwt()
    return jsonify({
        "message": f"Welcome to the dashboard!",
        "your_role": claims.get("role")
    }), 200

# Secure admin-only endpoint
@app.route('/admin', methods=['GET'])
@admin_required()
def admin_dashboard():
    return jsonify({
        "status": "success",
        "message": "Welcome, Administrator. You have full access."
    }), 200


if __name__ == '__main__':
    app.run(debug=True)