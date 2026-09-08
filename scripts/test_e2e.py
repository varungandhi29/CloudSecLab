import httpx
import sys
import uuid

BASE_URL = 'http://127.0.0.1:8000'

client = httpx.Client(base_url=BASE_URL, timeout=10.0)

print('1. Testing /health...')
r = client.get('/health')
assert r.status_code == 200, f'Health failed: {r.status_code}'
print('   -> OK:', r.json())

print('2. Testing user registration...')
test_user = f'test_op_{uuid.uuid4().hex[:6]}'
reg_payload = {
    'username': test_user,
    'email': f'{test_user}@test.io',
    'password': 'Password123!',
    'full_name': 'Test Operator'
}
r = client.post('/api/auth/register', json=reg_payload)
assert r.status_code == 200, f'Register failed: {r.status_code} - {r.text}'
auth_data = r.json()
token = auth_data['access_token']
print('   -> User registered successfully. Token received.')

headers = {'Authorization': f'Bearer {token}'}

print('3. Testing /api/levels (Listing curriculum)...')
r = client.get('/api/levels', headers=headers)
assert r.status_code == 200, f'Levels list failed: {r.status_code}'
levels = r.json()
print(f'   -> OK: {len(levels)} levels returned. Level 1 status: {levels[0]["status"]}')

print('4. Testing /api/levels/1 (Level detail)...')
r = client.get('/api/levels/1', headers=headers)
assert r.status_code == 200, f'Level detail failed: {r.status_code}'
lvl1 = r.json()
print(f'   -> OK: Title: "{lvl1["title"]}", Category: {lvl1["category"]}')

print('5. Testing Level 1 lab validation (Server-Side Grading)...')
validation_payload = {
    'user_answer': 'svc-deploy'
}
r = client.post('/api/labs/1/validate', json=validation_payload, headers=headers)
assert r.status_code == 200, f'Lab validate failed: {r.status_code} - {r.text}'
sub_res = r.json()
print(f'   -> OK: Passed: {sub_res.get("passed")}, Feedback: {sub_res.get("feedback")}')

print('6. Testing Certificate Public Verification (/api/verify/CSL-2026-BGN-98F2A10B)...')
r = client.get('/api/verify/CSL-2026-BGN-98F2A10B')
assert r.status_code == 200, f'Cert verify failed: {r.status_code} - {r.text}'
cert_data = r.json()
print(f'   -> OK: Valid: {cert_data.get("valid")}, Recipient: {cert_data.get("holder_name")}, Type: {cert_data.get("certificate_type")}')

print('ALL 6 END-TO-END CHECKS PASSED WITH 100% SUCCESS!')
