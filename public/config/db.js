const pg = require('pg');
const { Client } = pg;

const client = new Client({
    connectionString: "postgres://default:ShoBm12iDkxK@ep-purple-recipe-a43d60u8-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    // user: 'postgres',
    // password: 'postgres',
    // host: '127.0.0.1',
    // port: 5432,
    // database: 'aaron_portfolio',
  })

module.exports = { client }; 