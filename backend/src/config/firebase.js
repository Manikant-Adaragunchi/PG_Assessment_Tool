const admin = require('firebase-admin');
const logger = require('./logger');

const initializeFirebase = () => {
    try {
        // Option 1: Env variables (Example)
        if (process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            logger.info('Firebase Admin Initialized via ENV');
        }
        // Option 2: Service Account Key File
        else {
            try {
                const serviceAccount = require('./serviceAccountKey.json');
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                logger.info('Firebase Admin Initialized via ServiceAccountKey.json');
            } catch (fileErr) {
                logger.warn('Firebase ServiceAccountKey.json not found and ENV Not set. Auth verification will fail.');
            }
        }
    } catch (error) {
        logger.error('Firebase Initialization Error:', error);
    }
};

module.exports = { initializeFirebase, admin };
