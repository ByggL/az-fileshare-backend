const express = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { items, shares } = require("../utils/db");
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// lister contenu
router.get("/", verifyToken, (req, res) => {
  const parentId = req.query.parentId || null;
  // filtrer par utilisateur et dossier parent
  const userItems = items.filter((i) => i.userId === req.user.id && i.parentId === parentId);
  res.json(userItems);
});

// créer dossier
router.post("/folders", verifyToken, (req, res) => {
  const { name, parentId } = req.body;

  const folder = {
    id: uuidv4(),
    userId: req.user.id,
    type: "folder",
    name,
    parentId: parentId || null,
    createdAt: new Date(),
  };

  items.push(folder);
  res.status(201).json(folder);
});

// upload fichier
router.post("/files", verifyToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "aucun fichier" });

  const file = {
    id: uuidv4(),
    userId: req.user.id,
    type: "file",
    name: req.file.originalname,
    path: req.file.path, // chemin physique
    size: req.file.size,
    mimetype: req.file.mimetype,
    parentId: req.body.parentId || null,
    createdAt: new Date(),
  };

  items.push(file);
  res.status(201).json(file);
});

// métadonnées
router.get("/files/:id/metadata", verifyToken, (req, res) => {
  const item = items.find((i) => i.id === req.params.id && i.userId === req.user.id);
  if (!item) return res.status(404).json({ error: "introuvable" });
  res.json(item);
});

// téléchargement propriétaire
router.get("/files/:id/content", verifyToken, (req, res) => {
  const item = items.find((i) => i.id === req.params.id && i.userId === req.user.id);

  if (!item || item.type !== "file") return res.status(404).json({ error: "fichier introuvable" });

  // envoi flux fichier
  res.download(path.resolve(item.path), item.name);
});

// créer lien partage
router.post("/items/:id/share", verifyToken, (req, res) => {
  const item = items.find((i) => i.id === req.params.id && i.userId === req.user.id);
  if (!item) return res.status(404).json({ error: "introuvable" });

  const shareToken = uuidv4();
  shares.push({ token: shareToken, itemId: item.id });

  res.json({ link: `/api/share/${shareToken}` });
});

// accès public via partage
router.get("/share/:token", (req, res) => {
  const share = shares.find((s) => s.token === req.params.token);
  if (!share) return res.status(404).json({ error: "lien invalide" });

  const item = items.find((i) => i.id === share.itemId);
  if (!item || item.type !== "file") return res.status(404).json({ error: "fichier supprimé" });

  res.download(path.resolve(item.path), item.name);
});

// suppression
router.delete("/items/:id", verifyToken, (req, res) => {
  const index = items.findIndex((i) => i.id === req.params.id && i.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: "introuvable" });

  const item = items[index];

  // suppression physique si fichier
  if (item.type === "file" && fs.existsSync(item.path)) {
    fs.unlinkSync(item.path);
  }

  items.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
