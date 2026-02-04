const multer = require("multer");

// Stockage en RAM (buffer) avant envoi vers Azure Blob
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limite ex: 50MB
});

module.exports = upload;
