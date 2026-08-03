import os
from datetime import timedelta
from functools import wraps

import bcrypt
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt,
    jwt_required,
    verify_jwt_in_request,
)

from services.user_service import user_service

jwt_bp = Blueprint("jwt_bp", __name__)
jwt = JWTManager()


def init_jwt(app):
    app.config.setdefault("JWT_SECRET_KEY", os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this"))
    app.config.setdefault("JWT_ACCESS_TOKEN_EXPIRES", timedelta(minutes=10))
    jwt.init_app(app)
    app.register_blueprint(jwt_bp)


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != "admin":
                return jsonify({"error": "Admin privilege required"}), 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper


@jwt_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    user = user_service.fetch_by_username(username)
    if not user or not getattr(user, "password", None):
        return jsonify({"error": "Bad username or password"}), 401

    stored_password = user.password
    provided_password = password.encode("utf-8")
    if isinstance(stored_password, str) and stored_password.startswith("$2"):
        if not bcrypt.checkpw(provided_password, stored_password.encode("utf-8")):
            return jsonify({"error": "Bad username or password"}), 401
    elif stored_password != password:
        return jsonify({"error": "Bad username or password"}), 401

    access_token = create_access_token(
        identity=username,
        additional_claims={"role": getattr(user, "role", "customer")},
    )
    return jsonify(access_token=access_token), 200


@jwt_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def user_dashboard():
    claims = get_jwt()
    return jsonify({
        "message": "Welcome to the dashboard!",
        "your_role": claims.get("role"),
    }), 200


@jwt_bp.route("/admin", methods=["GET"])
@admin_required()
def admin_dashboard():
    return jsonify({
        "status": "success",
        "message": "Welcome, Administrator. You have full access.",
    }), 200