const firebaseConfig = {
  apiKey: "AIzaSyAiXzF-UtDR23AdYzN92ttCFwwkt3KlyAw",
  authDomain: "antravel.firebaseapp.com",
  projectId: "antravel",
  storageBucket: "antravel.firebasestorage.app",
  messagingSenderId: "932906481989",
  appId: "1:932906481989:web:f4f795e97131979366662c",
  measurementId: "G-BXREVQC24V"
};

firebase.initializeApp(firebaseConfig);
const fsdb = firebase.firestore();
const fauth = firebase.auth();
const fstorage = firebase.storage();

window.FirebaseAPI = {
  db: fsdb,
  auth: fauth,
  storage: fstorage
};
