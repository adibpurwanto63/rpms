const axios = require('axios');
const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign(
    { sub: 'cmpxrkbxf00001int0q3xfect', email: 'admin@rpms.id', role: 'SUPER_ADMIN' },
    'rpms-super-secret-jwt-key-2024-change-in-production',
    { expiresIn: '1h' }
  );

  for (const url of [
    'https://tekke53-rpms.hf.space/api/production/machines',
    'https://tekke53-rpms.hf.space/api/production',
    'https://tekke53-rpms.hf.space/api/production/stats/today',
  ]) {
    try {
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      console.log(`GET ${url}: ${res.status}`);
    } catch (e) {
      console.log(`GET ${url}: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
    }
  }
}

test();
