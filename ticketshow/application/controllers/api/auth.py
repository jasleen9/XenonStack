from flask import current_app as app
from flask import Flask, jsonify, request , abort
from application.models import *
from flask_security.utils import verify_password, hash_password
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_expects_json import expects_json

from flask_jwt_extended import create_access_token

from flask_jwt_extended import JWTManager
# ============================================================================AUTHORIZATION======================================================================

register_user_schema = {
    "type": "object",
    "properties": {
        "name": { 
            "type": "string",
            "minLength": 5,
            "maxLength": 55
            },
        "email": {
            "type": "string",
            "maxLength": 55
            },
        "password": {
            "type": "string", 
            "minLength": 5,
            "maxLength": 100
            },
    },
    "required": ["name", "email", "password"]
}

@app.route("/api/login", methods=["POST"])
def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    user = User.query.filter_by(email=email).one_or_none()

    if user and verify_password(password, user.password):            
        is_admin = any(role.name == 'admin' for role in user.roles)
        access_token = create_access_token(identity=user.id, additional_claims={"is_administrator": is_admin})
        return jsonify(name=user.username, token=access_token ,is_admin=is_admin), 200        
    abort(401, description="Incorrect Password!")
    

@app.route("/api/register", methods=["POST"])
@expects_json(register_user_schema)
def register():
    username = request.json.get("name", None)
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    user = User.query.filter_by(email=email).one_or_none()

    if user == None:
        new_user = User(username=username, email=email, password=hash_password(password), active=1)
        db.session.add(new_user)
        db.session.commit()
        return jsonify(msg="New User Created"), 201
    else:
        abort(400, description="User already exists!")
    

# ==============================================================================================================================================================