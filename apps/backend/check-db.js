const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_dnWjzf4P8FRw@ep-ancient-wind-apqnezaa-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(() => {
  return client.query('SELECT plate, driver_name, status FROM vehicles');
}).then(res => {
  console.table(res.rows);
  client.end();
}).catch(console.error);
