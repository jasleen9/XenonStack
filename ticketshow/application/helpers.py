from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request
from functools import wraps
from flask_jwt_extended import get_jwt
from flask import current_app

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):            
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["is_administrator"]:
                #print("is_admin")
                return current_app.ensure_sync(fn)(*args, **kwargs)
            else:
                return "Admin only!", 403
        return decorator

    return wrapper