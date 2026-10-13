import math
import os
from collections import defaultdict

from flask import Flask, jsonify, request
from flask_cors import CORS

from limiters import SlidingWindowLimiter, TokenBucket

SLIDING_LIMIT = int(os.getenv("SLIDING_LIMIT", 5))
SLIDING_WINDOW_SECONDS = int(os.getenv("SLIDING_WINDOW_SECONDS", 60))
BUCKET_CAPACITY = int(os.getenv("BUCKET_CAPACITY", 5))
BUCKET_REFILL = float(os.getenv("BUCKET_REFILL_PER_SECOND", 1))

app = Flask(__name__)
CORS(app)  # fine for a local demo; restrict origins in production

sliding = SlidingWindowLimiter(SLIDING_LIMIT, SLIDING_WINDOW_SECONDS)
buckets = defaultdict(lambda: TokenBucket(BUCKET_CAPACITY, BUCKET_REFILL))


def too_many(retry_after):
    resp = jsonify(error="Too Many Requests", retry_after=math.ceil(retry_after))
    resp.status_code = 429
    resp.headers["Retry-After"] = str(max(1, math.ceil(retry_after)))
    return resp


def client_id():
    # Demo only: use an API key or user id in a real app. Behind a proxy,
    # remote_addr is the proxy's address, so read X-Forwarded-For carefully.
    return request.remote_addr or "unknown"


@app.get("/api/data")
def data():
    """Sliding-window limit: N requests per rolling window."""
    uid = client_id()
    if not sliding.allow(uid):
        return too_many(sliding.retry_after(uid))
    resp = jsonify(message="OK (sliding window)", remaining=sliding.remaining(uid))
    resp.headers["X-RateLimit-Limit"] = str(SLIDING_LIMIT)
    resp.headers["X-RateLimit-Remaining"] = str(sliding.remaining(uid))
    return resp


@app.get("/api/burst")
def burst():
    """Token-bucket limit: bursts allowed, then a steady refill rate."""
    bucket = buckets[client_id()]
    if not bucket.allow():
        return too_many(bucket.retry_after())
    return jsonify(message="OK (token bucket)", tokens_left=bucket.available())


@app.get("/api/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(port=int(os.getenv("PORT", 5000)), debug=True)
