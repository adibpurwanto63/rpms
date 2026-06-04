const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post("https://tekke53-rpms.hf.space/api/auth/login", {
      email: "admin@rpms.id",
      password: "password123"
    });
    const token = loginRes.data.access_token;
    console.log("Logged in");
    
    const dashRes = await axios.get("https://tekke53-rpms.hf.space/api/dashboard/executive", {
      headers: { Authorization: "Bearer " + token }
    });
    console.log(JSON.stringify(dashRes.data.salesAnalytics, null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
