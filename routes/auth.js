const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { sql } = require("../utils/db");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    const pool = await sql.connect();
    // Check if user exists by googleId or email
    let result = await pool
      .request()
      .input("googleId", sql.NVarChar, googleId)
      .query("SELECT * FROM Users WHERE googleId = @googleId");

    let user;
    if (result.recordset.length === 0) {
      // Create new user
      const id = uuidv4();
      await pool
        .request()
        .input("id", sql.NVarChar, id)
        .input("username", sql.NVarChar, email)
        .input("googleId", sql.NVarChar, googleId)
        .query("INSERT INTO Users (id, username, googleId) VALUES (@id, @username, @googleId)");
      
      user = { id, username: email };
    } else {
      user = result.recordset[0];
    }

    const backendToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token: backendToken });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Authentification Google échouée" });
  }
});

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
