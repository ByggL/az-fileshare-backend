const sql = require("mssql");
require("dotenv").config();

console.log("DEBUG ENV VARS:");
console.log("DB_SERVER:", process.env.DB_SERVER ? "OK" : "UNDEFINED");
console.log("DB_USER:", process.env.DB_USER ? "OK" : "UNDEFINED");
console.log("DB_PASS:", process.env.DB_PASS ? "OK (Set)" : "UNDEFINED");
console.log("DB_NAME:", process.env.DB_NAME ? "OK" : "UNDEFINED");

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
  if (!config.server || !config.user || !config.password) {
    throw new Error("Configuration BDD incomplète : vérifiez les variables d'environnement.");
  }

  try {
    await sql.connect(config);
    console.log("Connecté à Azure SQL Database");
  } catch (err) {
    console.error("Erreur connexion SQL", err);
  }
}

module.exports = { sql, connectDB };
