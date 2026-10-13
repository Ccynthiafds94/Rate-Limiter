import time
import threading


class TokenBucket:
    """Bucket holds up to `capacity` tokens and refills continuously.
    Each allowed action spends tokens, so short bursts are fine but the
    long-run rate is capped at `refill_per_second`."""

    def __init__(self, capacity, refill_per_second, clock=time.monotonic):
        self.capacity = capacity
        self.refill_rate = refill_per_second
        self.clock = clock
        self.tokens = float(capacity)
        self.last = clock()
        self.lock = threading.Lock()

    def _refill(self):
        now = self.clock()
        elapsed = now - self.last
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last = now

    def allow(self, cost=1):
        with self.lock:
            self._refill()
            if self.tokens >= cost:
                self.tokens -= cost
                return True
            return False

    def available(self):
        with self.lock:
            self._refill()
            return int(self.tokens)

    def retry_after(self, cost=1):
        with self.lock:
            self._refill()
            if self.tokens >= cost:
                return 0
            return (cost - self.tokens) / self.refill_rate
