const BASE = 'https://care-exchange.onrender.com/api'
const TS = Date.now()
const PART_EMAIL = `e2e_p_${TS}@test.com`
const COORD_EMAIL = `e2e_c_${TS}@test.com`
const PROVIDER_EMAIL = `e2e_pr_${TS}@test.com`
const PASS = 'SecurePass@123'

async function api(method, path, data, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(BASE + path, { method, headers, body: data ? JSON.stringify(data) : undefined })
  const text = await res.text()
  try { return { data: JSON.parse(text), status: res.status } }
  catch { return { data: text, status: res.status } }
}

async function getToken(email) {
  const { data } = await api('POST', '/v1/auth/login', { email, password: PASS })
  return data.access_token
}

async function main() {
  console.log('Registering 3 users...')
  await api('POST', '/v1/auth/register', { email: PART_EMAIL, password: PASS, full_name: 'Sam E2E', role: 'participant' })
  await api('POST', '/v1/auth/register', { email: COORD_EMAIL, password: PASS, full_name: 'Casey E2E', role: 'coordinator' })
  await api('POST', '/v1/auth/register', { email: PROVIDER_EMAIL, password: PASS, full_name: 'Pat E2E', role: 'provider' })

  const p_token = await getToken(PART_EMAIL)
  const c_token = await getToken(COORD_EMAIL)
  const pr_token = await getToken(PROVIDER_EMAIL)

  // Get participant ID
  const { data: pData } = await api('GET', '/v1/participants/me', null, p_token)
  const p_id = pData.participant.id
  const { data: cData } = await api('GET', '/v1/participants/me', null, c_token)
  const c_user_id = cData.user.id

  console.log('Creating consent...')
  await api('POST', '/v1/participants/me/consent', { granted_to_id: c_user_id, data_categories: ['goals', 'care_plans'] }, p_token)

  console.log('Creating referral...')
  const { data: refData } = await api('POST', '/v1/referrals', {
    participant_id: p_id, provider_email: PROVIDER_EMAIL,
    referral_reason: 'Employment support', urgency: 'high'
  }, c_token)
  const ref_id = refData.referral.id

  console.log('Accepting and activating referral...')
  await api('PUT', `/v1/referrals/${ref_id}/status`, { status: 'accepted' }, pr_token)
  await api('PUT', `/v1/referrals/${ref_id}/status`, { status: 'active' }, pr_token)

  console.log('Creating message thread...')
  const { data: threadData } = await api('POST', '/v1/messages/threads', {
    participant_id: p_id, topic: 'E2E Test Discussion', provider_email: PROVIDER_EMAIL
  }, c_token)
  const thread_id = threadData.thread.id

  console.log('Sending messages...')
  await api('POST', `/v1/messages/threads/${thread_id}`, { content: 'Hello from E2E test - coordinator' }, c_token)
  await api('POST', `/v1/messages/threads/${thread_id}`, { content: 'Reply from provider' }, pr_token)

  console.log('Creating progress update...')
  await api('POST', '/v1/updates', { referral_id: ref_id, category: 'progress_note', summary: 'E2E test update', time_spent_minutes: 30 }, pr_token)

  const fs = require('fs')
  const path = require('path')
  const env = `BASE_URL=https://care-exchange.onrender.com
PART_EMAIL=${PART_EMAIL}
COORD_EMAIL=${COORD_EMAIL}
PROVIDER_EMAIL=${PROVIDER_EMAIL}
PASS=${PASS}
P_TOKEN=${p_token}
C_TOKEN=${c_token}
PR_TOKEN=${pr_token}
P_ID=${p_id}
C_USER_ID=${c_user_id}
REF_ID=${ref_id}
THREAD_ID=${thread_id}
`
  fs.writeFileSync(path.join(__dirname, '.env'), env)
  console.log('\n=== SETUP COMPLETE ===')
  console.log(`Participant: ${PART_EMAIL} (id=${p_id})`)
  console.log(`Coordinator: ${COORD_EMAIL}`)
  console.log(`Provider: ${PROVIDER_EMAIL}`)
  console.log(`Referral ID: ${ref_id}`)
  console.log(`Thread ID: ${thread_id}`)
}

main().catch(e => { console.error(e); process.exit(1) })
