from functools import wraps
from .extensions import mongo
import jwt
from flask import request, abort
from flask import current_app

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
            if token is None:
                print('Unauthorized - no token found')
                return {
                    "message": "Authentication Token is missing!",
                    "data": None,
                    "error": "Unauthorized - no token found"
                }, 401
        try:
            users_collection = mongo.db.users
            data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = users_collection.find_one(data)
            
            keys_to_remove = ["hashed_password", "email"]
            current_user = {key: value for key, value in current_user.items() if key not in keys_to_remove}
            
            if current_user is None:
                print('Unauthorized - Invalid Authentication token!')
                return {
                    "message": "Invalid Authentication token!",
                    "data": None,
                    "error": "Unauthorized"
                }, 401

            if not current_user['active']:
                abort(403)

        except jwt.ExpiredSignatureError:
            return {
                "message": "Token has expired",
                "data": None,
                "error": "Unauthorized"
            }, 401

        except jwt.InvalidTokenError as e:
            print("Invalid token: " + str(e))
            return {
                "message": "Invalid token: " + str(e),
                "data": None,
                "error": "Unauthorized"
            }, 401

        except Exception as e:
            print("Something went wrong: " + str(e))
            return {
                "message": "Something went wrong: " + str(e),
                "data": None,
                "error": str(e)
            }, 500

        return f(current_user, *args, **kwargs)

    return decorated
