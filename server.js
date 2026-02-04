const express = require("express");
const cors = require("cors");
const { connectDB } = require("./utils/db"); // Import DB
const authRoutes = require("./routes/auth");
const driveRoutes = require("./routes/drive");

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion BDD
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/drive", driveRoutes);
app.use("/api", driveRoutes); // Pour la route share publique

app.listen(PORT, () => {
  console.log(`Serveur démarré sur port ${PORT}`);
});
