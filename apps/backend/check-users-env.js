const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_dnWjzf4P8FRw@ep-ancient-wind-apqnezaa-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  });
  await client.connect();
  const res = await client.query('SELECT email, password_hash, role FROM users');
  console.table(res.rows);
  await client.end();
}
run();
