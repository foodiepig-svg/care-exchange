const BASE = 'https://care-exchange.onrender.com/api'
const TS = Date.now()
const PART_EMAIL = `e2e_p_${TS}@test.com`
const PASS = 'SecurePass@123'

async function api(method, path, data, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(BASE + path, { method, headers, body: data ? JSON.stringify(data) : undefined })
  const text = await res.text()
  try { return { data: JSON.parse(text), status: res.status } }
  catch { return { data: text, status: res.status } }
}

async function main() {
  console.log('=== STEP 1: Register ===')
  const reg = await api('POST', '/v1/auth/register', { email: PART_EMAIL, password: PASS, full_name: 'Sam E2E', role: 'participant' })
  console.log('Register status:', reg.status, JSON.stringify(reg.data)?.slice(0, 200))

  console.log('\n=== STEP 2: Login (before verify) ===')
  const login1 = await api('POST', '/v1/auth/login', { email: PART_EMAIL, password: PASS })
  console.log('Login status:', login1.status, JSON.stringify(login1.data)?.slice(0, 300))

  console.log('\n=== STEP 3: Verify email ===')
  const verify = await api('POST', '/v1/auth/debug/verify_email', { email: PART_EMAIL })
  console.log('Verify status:', verify.status, JSON.stringify(verify.data)?.slice(0, 200))

  console.log('\n=== STEP 4: Login (after verify) ===')
  const login2 = await api('POST', '/v1/auth/login', { email: PART_EMAIL, password: PASS })
  console.log('Login status:', login2.status, JSON.stringify(login2.data)?.slice(0, 300))

  if (login2.data?.access_token) {
    console.log('\n=== STEP 5: Get participant ===')
    const me = await api('GET', '/v1/participants/me', null, login2.data.access_token)
    console.log('Participant status:', me.status, JSON.stringify(me.data)?.slice(0, 300))
  }
}

main().catch(e => { console.error(e); process.exit(1) })