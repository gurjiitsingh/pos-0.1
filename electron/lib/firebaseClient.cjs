const {
  initializeApp,
  getApps,
  getApp,
} = require("firebase/app");

const {
  getFirestore,
} = require("firebase/firestore");

const {
  getFirebaseConfig,
} = require("../db/firebaseConfigRepo.cjs");


let firestore = null;


function initializeFirebase() {

  if (firestore) {
    return firestore;
  }

  const savedConfig = getFirebaseConfig();

  if (!savedConfig) {
    throw new Error(
      "Firebase configuration not found in local database."
    );
  }

  const firebaseConfig = {

    apiKey:
      savedConfig.apiKey || "",

    authDomain:
      savedConfig.authDomain || "",

    databaseURL:
      savedConfig.databaseURL || "",

    projectId:
      savedConfig.projectId || "",

    storageBucket:
      savedConfig.storageBucket || "",

    messagingSenderId:
      savedConfig.messagingSenderId || "",

    appId:
      savedConfig.appId || "",

    measurementId:
      savedConfig.measurementId || "",
  };


  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp(firebaseConfig);


  firestore = getFirestore(app);


  console.log(
    "🔥 FIREBASE INITIALIZED FROM LOCAL DATABASE"
  );


  return firestore;
}


function getFirestoreClient() {

  if (!firestore) {
    throw new Error(
      "Firebase is not initialized. Call initializeFirebase() first."
    );
  }

  return firestore;
}


module.exports = {
  initializeFirebase,
  getFirestoreClient,

  // Keep this export because your existing sync files use it.
  get firestore() {
    return firestore;
  },
};