const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost\\SQLEXPRESS', // dùng \\ cho instance name
  database: 'Library',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let connectionPool = null;

async function getConnection() {
  if (connectionPool) return connectionPool; // dùng lại nếu đã kết nối
  try {
    connectionPool = await sql.connect(config);
    console.log('SQL Server is connected');
    return connectionPool;
  } catch (err) {
    console.error('SQL Server connection error:', err);
    throw err;
  }
}

module.exports = { sql, getConnection };