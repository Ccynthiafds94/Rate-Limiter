import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import app as app_module


def test_endpoint_returns_429_with_retry_after():
    client = app_module.app.test_client()
    codes = [client.get("/api/data").status_code for _ in range(app_module.SLIDING_LIMIT + 1)]
    assert codes[:-1] == [200] * app_module.SLIDING_LIMIT
    assert codes[-1] == 429
    last = client.get("/api/data")
    assert int(last.headers["Retry-After"]) >= 1
