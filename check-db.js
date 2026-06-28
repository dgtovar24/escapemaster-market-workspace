const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://root:Diegoelmejor1.0@localhost:5432/marketdb'
  });
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'rooms';
  `);
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);