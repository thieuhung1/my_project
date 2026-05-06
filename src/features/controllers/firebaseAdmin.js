const admin = require('firebase-admin');

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    return JSON.parse(json);
  }

  return null;
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp();
  }

  return admin.app();
};

const getAdminFirestore = () => {
  initializeFirebaseAdmin();
  return admin.firestore();
};

module.exports = {
  admin,
  initializeFirebaseAdmin,
  getAdminFirestore,
};
