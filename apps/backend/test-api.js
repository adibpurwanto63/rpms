const axios = require('axios');

async function run() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'warehouse@rpms.id',
      password: 'password'
    });
    const token = loginRes.data.access_token;
    console.log("Logged in, token:", token.substring(0, 20) + "...");

    console.log("Submitting inbound...");
    const inboundRes = await axios.post('http://localhost:3001/api/warehouse/inbound', {
      weight: 250,
      grade: 'A',
      notes: 'Testing',
      submittedBy: 'Operator'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Inbound created:", inboundRes.data);

    console.log("Approving inbound...");
    const id = inboundRes.data.id;
    const approveRes = await axios.put(`http://localhost:3001/api/warehouse/inbound/${id}/approve`, {
      approvedBy: 'Supervisor'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Inbound approved:", approveRes.data);
  } catch (err) {
    if (err.response) {
      console.error("Error from API:", err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

run();
