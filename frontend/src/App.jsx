import RateLimitedButton from "./components/RateLimitedButton.jsx";
import HooksDemo from "./components/HooksDemo.jsx";
import ServerLimitDemo from "./components/ServerLimitDemo.jsx";

const card = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginBottom: 20,
};

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "32px auto", padding: "0 16px" }}>
      <h1>Rate Limiter Demo</h1>

      <section style={card}>
        <h2>1. Client-side sliding window</h2>
        <RateLimitedButton />
      </section>

      <section style={card}>
        <h2>2. Debounce, throttle, token bucket</h2>
        <HooksDemo />
      </section>

      <section style={card}>
        <h2>3. Real server limit (Flask)</h2>
        <ServerLimitDemo />
      </section>
    </div>
  );
}
