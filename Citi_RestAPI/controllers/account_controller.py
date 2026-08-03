from flask import Blueprint, jsonify, request
from services.account_service import account_service

account_bp = Blueprint('account_bp', __name__)

# View all accounts & create an account
@account_bp.route('/accounts', methods=['GET', 'POST'])
def handle_accounts():
    if request.method == 'GET':
        data = account_service.fetch_all_accounts()
        return jsonify(data), 200

    elif request.method == 'POST':
        body = request.get_json()
        if not body or 'user_id' not in body or 'account_type' not in body:
            return jsonify({"error": "Missing user_id or account_type"}), 400
        
        try:
            new_account = account_service.create_account(
                user_id=body['user_id'],
                account_type=body['account_type']
            )
            return jsonify(new_account), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "An unexpected error occurred"}), 500
        
# View accounts for a specific user
@account_bp.route('/accounts/<user_id>', methods=['GET'])
def get_user_accounts(user_id):
    try:
        accounts = account_service.fetch_accounts_by_user(user_id)
        return jsonify(accounts), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

# Deposit to specific account
@account_bp.route('/accounts/<account_id>/deposit', methods=['POST'])
def deposit_funds(account_id):
    body = request.get_json()
    if not body or 'amount' not in body:
        return jsonify({"error": "Missing deposit amount"}), 400

    try:
        updated_account = account_service.deposit(account_id, float(body['amount']))
        return jsonify(updated_account), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# Withdraw from specific account
@account_bp.route('/accounts/<account_id>/withdraw', methods=['POST'])
def withdraw_funds(account_id):
    body = request.get_json()
    if not body or 'amount' not in body:
        return jsonify({"error": "Missing withdrawal amount"}), 400

    try:
        updated_account = account_service.withdraw(account_id, float(body['amount']))
        return jsonify(updated_account), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# [NEW] View transaction history for an account
@account_bp.route('/accounts/<account_id>/transactions', methods=['GET'])
def get_transaction_history(account_id):
    try:
        history = account_service.fetch_transaction_history(account_id)
        return jsonify(history), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

@account_bp.route('/accounts/<account_id>', methods=['DELETE'])
def delete_account(account_id):
    try:
        deleted = account_service.delete_account(account_id)
        if not deleted:
            return jsonify({"error": "Account not found"}), 404
        return jsonify({"message": "Account deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500