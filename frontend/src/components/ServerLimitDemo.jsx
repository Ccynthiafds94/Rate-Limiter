import { useState } from "react";
import { callApi } from "../services/api";

export default function ServerLimitDemo() {
  const [endpoint, setEndpoint] = useState("/api/data");
  const [log, setLog] = useState([]);
  const [error, setError] = useState("");

  const addLog = (msg) => setLog((l) => [msg, ...l].slice(0, 8));

  const send = async () => {
    setError("");
    try {
      const result = await callApi(endpoint);
      if (result.ok) {
        addLog(`✅ ${result.data.message}`);
      } else {
        addLog(`⛔ 429 from server. Retry in ${result.retryAfter}s`);
      }
    } catch (e) {
      setError("Could not reach the server. Is the Flask backend running on port 5000?");
    }
  };

  return (
    <div>
      <label>
        Endpoint:{" "}
        <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)}>
          <option value="/api/data">/api/data (sliding window, 5 per minute)</option>
          <option value="/api/burst">/api/burst (token bucket, burst of 5)</option>
        </select>
      </label>{" "}
      <button onClick={send}>Call API</button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <ul>
        {log.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
