const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = process.env.CONTAINER_NAME;
const containerClient = blobServiceClient.getContainerClient(containerName);

// S'assurer que le container existe au démarrage
(async () => {
  await containerClient.createIfNotExists();
})();

async function uploadToBlob(buffer, blobName) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer);
  return blockBlobClient.url;
}

async function getBlobStream(blobName) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  return downloadBlockBlobResponse.readableStreamBody;
}

async function deleteBlob(blobName) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}

module.exports = { uploadToBlob, getBlobStream, deleteBlob };
