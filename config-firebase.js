// config-firebase.js
// Pastikan file ini dimuat SETELAH firebase-app-compat.js dan firebase-database-compat.js

// Hanya inisialisasi sekali
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyCr5B0P0X_eqMNYbZonu40NXRxqCmx4t_o",
    authDomain: "sabar-2e686.firebaseapp.com",
    databaseURL:"https://sabar-2e686-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "sabar-2e686",
    storageBucket: "sabar-2e686.firebasestorage.app",
    messagingSenderId: "917602556667",
    appId: "1:917602556667:web:cc087826739cf2d2cd2e5e",
    measurementId: "G-9DMC1YKZP7"
  };

  // Inisialisasi Firebase
  firebase.initializeApp(firebaseConfig);

  // Opsional: Inisialisasi Analytics (jika diperlukan)
  if (typeof firebase.analytics !== 'undefined') {
    firebase.analytics();
  }

}
