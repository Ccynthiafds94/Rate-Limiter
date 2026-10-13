import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useThrottle } from "../hooks/useThrottle";
import { useTokenBucket } from "../hooks/useTokenBucket";

export default function HooksDemo() {
  const [text, setText] = useState("");
  const debouncedText = useDebounce(text, 600);

  const [throttleCount, setThrottleCount] = useState(0);
  const throttledClick = useThrottle(() => setThrottleCount((c) => c + 1), 1000);

  const { tryAction, tokens, capacity } = useTokenBucket(5, 1); // 5 burst, +1/sec
  const [bucketLog, setBucketLog] = useState("");

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section>
        <h3>Debounce</h3>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type fast..." />
        <p>Typed: {text}</p>
        <p>Debounced (600ms): {debouncedText}</p>
      </section>

      <section>
        <h3>Throttle</h3>
        <button onClick={throttledClick}>Spam me</button>
        <p>Counted clicks (max 1/sec): {throttleCount}</p>
      </section>

      <section>
        <h3>Token bucket</h3>
        <button onClick={() => setBucketLog(tryAction() ? "✅ Allowed" : "⛔ Blocked")}>
          Send request
        </button>
        <p>Tokens: {tokens} / {capacity}</p>
        <p>{bucketLog}</p>
      </section>
    </div>
  );
}
