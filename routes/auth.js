const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { sql } = require("../utils/db");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const id = uuidv4();

  try {
    const pool = await sql.connect();
    await pool
      .request()
      .input("id", sql.NVarChar, id)
      .input("user", sql.NVarChar, username)
      .input("pass", sql.NVarChar, password)
      .query("INSERT INTO Users (id, username, password) VALUES (@id, @user, @pass)");

    res.status(201).json({ message: "succès" });
  } catch (err) {
    res.status(400).json({ error: "Erreur ou utilisateur existant" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("user", sql.NVarChar, username)
      .input("pass", sql.NVarChar, password)
      .query("SELECT * FROM Users WHERE username = @user AND password = @pass");

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "identifiants invalides" });
    }

    const user = result.recordset[0];
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
