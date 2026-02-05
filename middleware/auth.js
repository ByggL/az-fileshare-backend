const jwt = require("jsonwebtoken");
const SECRET_KEY = "tp_secret_key";
require("dotenv").config();

const verifyToken = (req, res, next) => {
  // récupération header authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "token manquant" });

  if (token == process.env.TOKEN) return next();
  // else return res.status(403).json({ error: "token invalide" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "token invalide" });
    req.user = user;
    next();
  });
};

module.exports = { verifyToken, SECRET_KEY };
