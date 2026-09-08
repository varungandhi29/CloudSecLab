import httpx

client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=10.0)
r = client.get("/api/verify/CSL-2026-BGN-98F2A10B")
print(r.json())
