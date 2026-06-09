const bcrypt = require('bcryptjs'); // or bcrypt
const hash = '$2b$12$5y3L6/WMQ5vCVP6poraCD.ciaB6MmGAR7fTZDsxNCqtEQCR2tcG5.';
bcrypt.compare('Admin@123', hash).then(res1 => console.log('Admin@123:', res1));
