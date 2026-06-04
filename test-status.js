const axios = require('axios');

async function test() {
  try {
    // 1. Login to get token
    const login = await axios.post('https://tekke53-rpms.hf.space/api/auth/login', {
      email: 'admin@rpms.id',
      password: 'password123'
    });
    const token = login.data.token;
    console.log('Logged in, got token');

    // 2. Get machines
    const machines = await axios.get('https://tekke53-rpms.hf.space/api/production/machines', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Got machines:', machines.data);

    // 3. Update status of the first machine
    if (machines.data.length > 0) {
      const firstMachine = machines.data[0];
      console.log(`Updating machine ${firstMachine.id} to MAINTENANCE...`);
      const update = await axios.put(`https://tekke53-rpms.hf.space/api/production/machines/${firstMachine.id}/status`, {
        status: 'MAINTENANCE'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Update success:', update.data);
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
