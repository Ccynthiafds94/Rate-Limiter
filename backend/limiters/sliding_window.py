import time
import threading
from collections import defaultdict, deque


class SlidingWindowLimiter:
    """Allow at most `limit` requests per user in any rolling `window_seconds`."""

    def __init__(self, limit, window_seconds, clock=time.monotonic):
        self.limit = limit
        self.window = window_seconds
        self.clock = clock  # injectable so tests don't need to sleep
        self.requests = defaultdict(deque)  # user_id -> timestamps
        self.lock = threading.Lock()  # safe with multiple threads

    def _drop_expired(self, q, now):
        while q and now - q[0] >= self.window:
            q.popleft()

    def allow(self, user_id):
        now = self.clock()
        with self.lock:
            q = self.requests[user_id]
            self._drop_expired(q, now)
            if len(q) >= self.limit:
                return False
            q.append(now)
            return True

    def remaining(self, user_id):
        now = self.clock()
        with self.lock:
            q = self.requests[user_id]
            self._drop_expired(q, now)
            return max(0, self.limit - len(q))

    def retry_after(self, user_id):
        """Seconds until the next request would be allowed (0 if allowed now)."""
        now = self.clock()
        with self.lock:
            q = self.requests[user_id]
            self._drop_expired(q, now)
            if len(q) < self.limit:
                return 0
            return max(0, self.window - (now - q[0]))
