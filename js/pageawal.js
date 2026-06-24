const auth = firebase.auth();
const rtdb = firebase.database();

// ✅ Flag untuk mencegah race condition
let isLoggingIn = false; 

let currentCaptcha = '';

function generateCaptcha() {
  let captcha = '';
  for (let i = 0; i < 5; i++) captcha += Math.floor(Math.random() * 10);
  currentCaptcha = captcha;
  document.getElementById('captchaDisplay').textContent = captcha;
}

function refreshCaptcha() {
  generateCaptcha();
  document.getElementById('captchaInput').value = '';
}

async function registerSession(userId, deviceId) {
  try {
    const sessionRef = rtdb.ref(`sessions/${userId}/${deviceId}`);
    await sessionRef.set({
      lastActive: Date.now(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    sessionRef.onDisconnect().remove();
  } catch (error) { console.error('Session error:', error); }
}

async function getUserRole(uid) {
  try {
    const snapshot = await rtdb.ref(`users/${uid}`).once('value');
    if (snapshot.exists()) return snapshot.val().role || "user";
    return "user";
  } catch (error) { return "user"; }
}

async function forgotPassword() {
  const email = document.getElementById('email').value.trim();
  if (!email) return document.getElementById('errorMsg').textContent = '❌ Masukkan email dulu.';
  try {
    await auth.sendPasswordResetEmail(email);
    document.getElementById('successMsg').textContent = '✅ Email reset dikirim!';
  } catch (error) {
    document.getElementById('errorMsg').textContent = '❌ ' + error.message;
  }
}

// ✅ Event Listener pada tombol, BUKAN pada form submit
document.getElementById('btnSignIn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const captcha = document.getElementById('captchaInput').value.trim();
  
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');
  const loading = document.getElementById('loading');
  const btn = document.getElementById('btnSignIn');

  errorMsg.textContent = '';
  successMsg.textContent = '';

  if (captcha !== currentCaptcha) {
    errorMsg.textContent = '❌ Captcha salah!';
    refreshCaptcha();
    return;
  }

  loading.classList.add('active');
  btn.disabled = true;
  btn.textContent = 'Memproses...';

  // ✅ Aktifkan flag agar onAuthStateChanged TIDAK mengganggu
  isLoggingIn = true; 

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    const userRole = await getUserRole(user.uid);
    
    // Simpan ke localStorage DULU sebelum redirect
    localStorage.setItem('currentUser', JSON.stringify({
      uid: user.uid, 
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      role: userRole
    }));
    localStorage.setItem('userRole', userRole);
    
    const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
    await registerSession(user.uid, deviceId);

    successMsg.textContent = '✅ Login berhasil!';
    
    // ✅ Redirect manual HANYA setelah semua data siap
    setTimeout(() => {
      window.location.href = './index.html';
    }, 500); // Delay sedikit agar UI update
    
  } catch (error) {
    errorMsg.textContent = ' ' + (error.message || 'Login gagal.');
    btn.disabled = false;
    btn.textContent = 'Sign In';
    refreshCaptcha();
    isLoggingIn = false; // Reset flag jika gagal
  } finally {
    loading.classList.remove('active');
  }
});

// Navigation
document.getElementById('navDaftar').addEventListener('click', (e) => { e.preventDefault(); alert('Fitur pendaftaran segera tersedia.'); });
document.getElementById('navEksplor').addEventListener('click', (e) => { e.preventDefault(); alert('Silakan login untuk eksplorasi.'); });

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  generateCaptcha();
  
  // Cek awal: jika sudah login, langsung lempar ke index
  if (localStorage.getItem('currentUser')) {
    window.location.href = './index.html';
  }
});

// ✅ onAuthStateChanged diblokir jika sedang login
auth.onAuthStateChanged((user) => {
  if (user && !isLoggingIn) {
    // Hanya jalan jika user refresh halaman (bukan saat klik login)
    if (localStorage.getItem('currentUser')) {
      window.location.href = './index.html';
    }
  }
});

console.log('🔐 pageawal.js ready');
