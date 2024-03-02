import redis
import os

redis_client = redis.Redis(host=os.environ.get('REDIS_HOST_URL') or 'localhost', port=os.environ.get('REDIS_HOST_PORT') or 6379, db=0)

try:
    # Check if the connection is successful
    if redis_client.ping():
        print(f"Connected to Redis successfully")
    else:
        print("Failed to connect to Redis server")
except redis.ConnectionError as e:
    print(f"Error connecting to Redis server: {e}")
