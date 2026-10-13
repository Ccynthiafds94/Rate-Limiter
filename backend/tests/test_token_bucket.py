import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from limiters import TokenBucket
from test_sliding_window import FakeClock


def test_burst_then_block():
    clock = FakeClock()
    b = TokenBucket(3, 1, clock=clock)
    assert [b.allow() for _ in range(4)] == [True, True, True, False]


def test_refills_over_time():
    clock = FakeClock()
    b = TokenBucket(2, 1, clock=clock)
    b.allow()
    b.allow()
    assert not b.allow()
    clock.advance(1)  # 1 token back
    assert b.allow()
    assert not b.allow()


def test_never_exceeds_capacity():
    clock = FakeClock()
    b = TokenBucket(2, 1, clock=clock)
    clock.advance(100)
    assert b.available() == 2


def test_retry_after():
    clock = FakeClock()
    b = TokenBucket(1, 0.5, clock=clock)  # 1 token per 2 seconds
    b.allow()
    assert round(b.retry_after()) == 2
