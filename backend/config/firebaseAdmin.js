const admin = require("firebase-admin");
const path = require("path");

// Đường dẫn tới file service account JSON
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
