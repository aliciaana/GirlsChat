var admin = require("firebase-admin");

var serviceAccount = require("../privateKeyFirebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
export default db;