// ✅ Proteksi: Hanya admin yang bisa akses halaman ini
(function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  
  if (!currentUser) {
    alert('⛔ Anda harus login terlebih dahulu!');
    window.location.href = './pageawal.html';
    return;
  }
  
  if (currentUser.role !== 'admin') {
    alert('⛔ Akses ditolak! Halaman ini hanya untuk admin.');
    window.location.href = './index.html';
    return;
  }
  
  // Jika admin, lanjutkan load halaman
  initControlCenter();
})();

function initControlCenter() {
  const auth = firebase.auth();
  const rtdb = firebase.database();

  // === TOMBOL KEMBALI ===
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = './index.html';
  });

  // === TAMBAH PENGUMUMAN ===
  function addAnnouncementCard(title = '', content = '', index = 0) {
    const container = document.getElementById('announcementsContainer');
    const card = document.createElement('div');
    card.className = 'announcement-card';
    card.innerHTML = `
      <h4>Pengumuman #${index + 1}</h4>
      <button type="button" class="remove-btn" onclick="removeAnnouncement(this)">✕</button>
      <label>Judul Pengumuman</label>
      <input type="text" class="announcement-title" placeholder="Contoh: 📢 Jadwal libur" value="${title}">
      <label>Isi Pengumuman</label>
      <textarea class="announcement-content" placeholder="Masukkan isi pengumuman...">${content}</textarea>
    `;
    container.appendChild(card);
  }

  // === HAPUS PENGUMUMAN ===
  window.removeAnnouncement = function(btn) {
    const card = btn.closest('.announcement-card');
    card.remove();
    updateAnnouncementNumbers();
  };

  // === UPDATE NOMOR ===
  function updateAnnouncementNumbers() {
    const cards = document.querySelectorAll('.announcement-card');
    cards.forEach((card, index) => {
      const h4 = card.querySelector('h4');
      h4.textContent = `Pengumuman #${index + 1}`;
    });
  }

  // === TAMBAH BARU ===
  document.getElementById('addAnnouncementBtn').addEventListener('click', () => {
    const cards = document.querySelectorAll('.announcement-card');
    addAnnouncementCard('', '', cards.length);
  });

  // === SIMPAN PENGUMUMAN ===
  document.getElementById('saveAnnouncementsBtn').addEventListener('click', async () => {
    const cards = document.querySelectorAll('.announcement-card');
    const announcements = [];
    
    cards.forEach(card => {
      const title = card.querySelector('.announcement-title').value.trim();
      const content = card.querySelector('.announcement-content').value.trim();
      
      if (title && content) {
        announcements.push({ title, content });
      }
    });
    
    const statusEl = document.getElementById('statusMsg');
    
    if (announcements.length === 0) {
      statusEl.textContent = '⚠️ Tambahkan minimal 1 pengumuman!';
      statusEl.className = 'status-msg status-error';
      statusEl.style.display = 'block';
      return;
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      await rtdb.ref('infoBox').set({
        announcements: announcements,
        updatedAt: Date.now(),
        updatedBy: user.uid || 'unknown'
      });
      
      statusEl.textContent = `✅ ${announcements.length} pengumuman berhasil disimpan!`;
      statusEl.className = 'status-msg status-success';
      statusEl.style.display = 'block';
      
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
      
    } catch (error) {
      console.error('❌ Gagal simpan:', error);
      statusEl.textContent = '❌ Gagal menyimpan: ' + error.message;
      statusEl.className = 'status-msg status-error';
      statusEl.style.display = 'block';
    }
  });

  // === PREVIEW ===
  document.getElementById('previewBtn').addEventListener('click', () => {
    const cards = document.querySelectorAll('.announcement-card');
    let preview = '📋 PREVIEW PENGUMUMAN:\n\n';
    
    cards.forEach((card, index) => {
      const title = card.querySelector('.announcement-title').value.trim();
      const content = card.querySelector('.announcement-content').value.trim();
      
      if (title && content) {
        preview += `${index + 1}. ${title}\n   ${content}\n\n`;
      }
    });
    
    if (preview === '📋 PREVIEW PENGUMUMAN:\n\n') {
      alert('Tidak ada pengumuman untuk di-preview.');
    } else {
      alert(preview);
    }
  });

  // === LOAD PENGUMUMAN YANG SUDAH ADA ===
  async function loadAnnouncements() {
    try {
      const snapshot = await rtdb.ref('infoBox').once('value');
      const data = snapshot.val();
      
      if (data && data.announcements) {
        document.getElementById('announcementsContainer').innerHTML = '';
        data.announcements.forEach((announcement, index) => {
          addAnnouncementCard(announcement.title, announcement.content, index);
        });
      }
    } catch (error) {
      console.error('❌ Gagal load pengumuman:', error);
    }
  }

  // Load saat halaman siap
  loadAnnouncements();
  
  console.log('🛡️ Control Center ready - Admin mode');
}
