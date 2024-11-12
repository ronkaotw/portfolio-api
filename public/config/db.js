const pg = require('pg');
const { Client } = pg;

const client = new Client({
    user: 'postgres',
    password: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    database: 'aaron_portfolio',
  })

module.exports = { client }; 