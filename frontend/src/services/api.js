/**
 * Calls the API and turns a 429 into a friendly result instead of throwing.
 * Returns { ok: true, data } or { ok: false, retryAfter } (seconds).
 */
export async function callApi(path) {
  const res = await fetch(path);

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After")) || 1;
    return { ok: false, retryAfter };
  }
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return { ok: true, data: await res.json() };
}
