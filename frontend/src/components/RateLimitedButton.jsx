import { useState } from "react";
import { useRateLimiter } from "../hooks/useRateLimiter";

export default function RateLimitedButton() {
  const { tryAction, remaining, retryAfter } = useRateLimiter(3, 10000); // 3 clicks / 10s
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog((l) => [msg, ...l].slice(0, 5));

  const handleClick = () => {
    if (tryAction()) {
      addLog(`✅ Request sent at ${new Date().toLocaleTimeString()}`);
      // call your API here
    } else {
      addLog(`⛔ Blocked. Try again in ${retryAfter || 1}s`);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Send request</button>
      <p>Remaining: {remaining} / 3</p>
      {retryAfter > 0 && <p>Limit reached. Retry in {retryAfter}s</p>}
      <ul>
        {log.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
