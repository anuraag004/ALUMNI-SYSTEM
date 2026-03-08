/**
 * config/firebase.js
 * Initialises the Firebase Admin SDK as a singleton.
 * Also exports convenience references to Firestore and Storage.
 */

const admin = require("firebase-admin");
const { FIREBASE } = require("./env");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: FIREBASE.projectId,
            privateKeyId: FIREBASE.privateKeyId,
            privateKey: FIREBASE.privateKey,
            clientEmail: FIREBASE.clientEmail,
            clientId: FIREBASE.clientId,
            authUri: FIREBASE.authUri,
            tokenUri: FIREBASE.tokenUri,
        }),
        storageBucket: FIREBASE.storageBucket,
    });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

// Firestore settings — disable deprecated timestamp behaviour
db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db, bucket, auth };
