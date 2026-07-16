from flask import Blueprint, jsonify, request
from services.user_service import user_service

# Create a Blueprint for user-related routes
user_bp = Blueprint('user_bp', __name__)


@user_bp.route('/users', methods=['GET', 'POST'])
def handle_users():
    if request.method == 'GET':
        data = user_service.fetch_all_users()
        return jsonify(data), 200

    elif request.method == 'POST':
        body = request.get_json(silent=True) or {}

        # Basic validation
        if not body or 'name' not in body or 'email' not in body or 'username' not in body or 'password' not in body:
            return jsonify({"error": "Missing required fields: name, email, username, password"}), 400

        try:
            new_user = user_service.create_user(
                name=body['name'],
                email=body['email'],
                username=body['username'],
                password=body['password'],
                role=body.get('role', 'customer'),
            )
            return jsonify(new_user), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500