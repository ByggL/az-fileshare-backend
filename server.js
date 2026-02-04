const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const driveRoutes = require("./routes/drive");

const app = express();
const PORT = 3000;

// middlewares globaux
app.use(cors());
app.use(express.json());

// montage routes
app.use("/api/auth", authRoutes);
app.use("/api/drive", driveRoutes);
// route spécifique partage hors prefixe drive (optionnel, mis dans drive.js pour simplicité)
app.use("/api", driveRoutes);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur port ${PORT}`);
});
