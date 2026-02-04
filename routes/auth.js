const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { users } = require("../utils/db");
const { SECRET_KEY } = require("../middleware/auth");

const router = express.Router();

// inscription
router.post("/register", (req, res) => {
  const { username, password } = req.body;

  // vérification existence
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: "utilisateur existant" });
  }

  const newUser = { id: uuidv4(), username, password };
  users.push(newUser);
  res.status(201).json({ message: "succès" });
});

// connexion
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ error: "identifiants invalides" });

  // génération token
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;
