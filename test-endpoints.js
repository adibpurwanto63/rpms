const axios = require('axios');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    // Mint token manually
    const token = jwt.sign(
      { sub: 'cmpxrkbxf00001int0q3xfect', email: 'admin@rpms.id', role: 'SUPER_ADMIN' },
      'rpms-super-secret-jwt-key-2024-change-in-production',
      { expiresIn: '1h' }
    );
    console.log('Token minted.');

    console.log('Testing /production/machines...');
    const m = await axios.get('https://tekke53-rpms.hf.space/api/production/machines', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Machines:', m.data.length);

    console.log('Testing /production...');
    const p = await axios.get('https://tekke53-rpms.hf.space/api/production', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Records:', p.data.length);

    console.log('Testing /production/stats/today...');
    const s = await axios.get('https://tekke53-rpms.hf.space/api/production/stats/today', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Stats:', s.data);

    // Also test PUT
    if (m.data.length > 0) {
      console.log('Testing PUT /production/machines/:id/status...');
      const put = await axios.put(`https://tekke53-rpms.hf.space/api/production/machines/${m.data[0].id}/status`, { status: 'RUNNING' }, { headers: { Authorization: `Bearer ${token}` } });
      console.log('PUT success:', put.data.status);
    }

  } catch (err) {
    console.error('Error on endpoint:', err.config?.url);
    console.error('Response:', err.response?.data || err.message);
  }
}
test();
