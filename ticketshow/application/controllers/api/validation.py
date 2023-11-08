from werkzeug.exceptions import HTTPException
from flask import make_response , jsonify
import json
from flask import current_app as app

        
@app.errorhandler(404)
def handle_404_error(e):
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), 404
    return jsonify({"error": "Not Found"}), 404


# Custom error handler for 401 status code
@app.errorhandler(401)
def handle_unauthorized(e):
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), 401
    return jsonify({"error": "Unauthorized"}), 401

# Custom error handler for 403 status code
@app.errorhandler(403)
def handle_forbidden(e):
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), 403
    return jsonify({"error": "Forbidden"}), 403

# Custom error handler for 404 status code
@app.errorhandler(404)
def handle_not_found(e):
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), 404
    return jsonify({"error": "Not Found"}), 404

# Custom error handler for 500 status code
@app.errorhandler(500)
def handle_internal_server_error(e):
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), 500
    return jsonify({"error": "Internal Server Error"}), 500