const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let serviceAccount;

// Ưu tiên đọc từ environment variable (cho production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", err.message);
  }
} else {
  // Fallback: đọc từ file JSON (cho local development)
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  if (fs.existsSync(serviceAccountPath)) {
    const fileContent = fs.readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(fileContent);
  }
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
