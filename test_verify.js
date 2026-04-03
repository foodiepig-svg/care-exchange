const email = 'e2e_p_' + Date.now() + '@test.com';
async function api(method, path, data, token) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) opts.headers.Authorization = 'Bearer ' + token;
  if (data) opts.body = JSON.stringify(data);
  const r = await fetch('https://care-exchange.onrender.com/api/v1' + path, opts);
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: r.status, data: json };
}
async function main() {
  const reg = await api('POST', '/auth/register', { email, password: 'Test@123', full_name: 'Test', role: 'participant' });
  console.log('Register:', reg.status, JSON.stringify(reg.data)?.slice(0,100));
  const login = await api('POST', '/auth/login', { email, password: 'Test@123' });
  console.log('Login (no verify):', login.status, JSON.stringify(login.data)?.slice(0,200));
  const verify = await api('POST', '/auth/debug/verify_email', { email });
  console.log('Verify:', verify.status, JSON.stringify(verify.data)?.slice(0,100));
  const login2 = await api('POST', '/auth/login', { email, password: 'Test@123' });
  console.log('Login (after verify):', login2.status, JSON.stringify(login2.data)?.slice(0,200));
}
main().catch(console.error);