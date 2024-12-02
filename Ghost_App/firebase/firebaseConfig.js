// firebaseConfig.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIQjc5Z19Dv7AlRmjShNG4fvsEZJAdZbc",
  authDomain: "ghost-bfe01.firebaseapp.com",
  projectId: "ghost-bfe01",
  storageBucket: "ghost-bfe01.appspot.com",
  messagingSenderId: "932210995235",
  appId: "1:932210995235:web:51e359e7ba81356ab58196",
  measurementId: "G-4YWTXJ9NP6",
};

// Firebase'i başlat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();  // Daha önce başlatılmışsa mevcut instance'ı kullan
}

const firestore = firebase.firestore();  // Firestore'u başlat

export { firebase, firestore };