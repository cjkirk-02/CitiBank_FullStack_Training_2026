from flask import Blueprint, jsonify, request
from services.user_service import user_service
from jwtTest import admin_required

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


@user_bp.route('/users/<user_id>', methods=['PUT', 'DELETE'])
#@admin_required()
def handle_user_by_id(user_id):
    if request.method == 'PUT':
        body = request.get_json(silent=True) or {}

        allowed_fields = {'name', 'email', 'username', 'password', 'role'}
        updates = {key: value for key, value in body.items() if key in allowed_fields}
        if not updates:
            return jsonify({"error": "Provide at least one field to update: name, email, username, password, role"}), 400

        try:
            updated_user = user_service.update_user(user_id=user_id, **updates)
            if not updated_user:
                return jsonify({"error": "User not found"}), 404
            return jsonify(updated_user), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    try:
        deleted = user_service.delete_user(user_id)
        if not deleted:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "User deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500