import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from limiters import SlidingWindowLimiter


class FakeClock:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t

    def advance(self, s):
        self.t += s


def test_allows_up_to_limit_then_blocks():
    clock = FakeClock()
    rl = SlidingWindowLimiter(3, 10, clock=clock)
    assert [rl.allow("u") for _ in range(4)] == [True, True, True, False]


def test_window_slides_and_allows_again():
    clock = FakeClock()
    rl = SlidingWindowLimiter(2, 10, clock=clock)
    assert rl.allow("u") and rl.allow("u")
    assert not rl.allow("u")
    clock.advance(10)  # both old requests expire
    assert rl.allow("u")


def test_users_are_independent():
    clock = FakeClock()
    rl = SlidingWindowLimiter(1, 10, clock=clock)
    assert rl.allow("a")
    assert not rl.allow("a")
    assert rl.allow("b")


def test_no_fixed_window_boundary_burst():
    # 2 requests at t=9, 2 more at t=11 must NOT all pass with limit=2/10s
    clock = FakeClock()
    rl = SlidingWindowLimiter(2, 10, clock=clock)
    clock.advance(9)
    assert rl.allow("u") and rl.allow("u")
    clock.advance(2)  # t=11, the t=9 requests are still inside the window
    assert not rl.allow("u")


def test_retry_after_and_remaining():
    clock = FakeClock()
    rl = SlidingWindowLimiter(1, 10, clock=clock)
    rl.allow("u")
    clock.advance(4)
    assert rl.remaining("u") == 0
    assert round(rl.retry_after("u")) == 6
