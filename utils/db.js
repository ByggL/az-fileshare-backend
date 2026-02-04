const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Requis pour Azure
    trustServerCertificate: false,
  },
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log("Connecté à Azure SQL Database");
  } catch (err) {
    console.error("Erreur connexion SQL", err);
  }
}

module.exports = { sql, connectDB };
