function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(name))
      b.classList.add('active');
  });
  if (name === 'daftar') loadLaporan();
  if (name === 'beranda') loadStats();
}

async function loadStats() {
  try {
    const res = await fetch('/api/laporan/stats');
    const json = await res.json();
    if (json.success) {
      document.getElementById('stat-total').textContent    = json.data.total;
      document.getElementById('stat-menunggu').textContent = json.data.menunggu;
      document.getElementById('stat-diproses').textContent = json.data.diproses;
      document.getElementById('stat-selesai').textContent  = json.data.selesai;
    }
  } catch(e) { console.error(e); }
}

let currentPage = 1;

async function loadLaporan(page = 1) {
  currentPage = page;
  const status = document.getElementById('filter-status').value;
  const jenis  = document.getElementById('filter-jenis').value;
  let url = `/api/laporan?page=${page}&limit=6`;
  if (status) url += `&status=${status}`;
  if (jenis)  url += `&jenis=${jenis}`;

  const container = document.getElementById('laporan-list');
  container.innerHTML = '<p style="text-align:center;padding:2rem;color:#b2bec3">Memuat data...</p>';

  try {
    const res  = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderLaporan(json.data, container);
    renderPagination(json.pagination);
  } catch(e) {
    container.innerHTML = '<p class="empty-state">Gagal memuat data: ' + e.message + '</p>';
  }
}

function renderLaporan(data, container) {
  if (!data.length) { container.innerHTML = '<p class="empty-state">Belum ada laporan.</p>'; return; }
  container.innerHTML = data.map(l => `
    <div class="laporan-card">
      <div class="laporan-foto">
        ${l.foto_url
          ? `<img src="${l.foto_url}" alt="Foto" loading="lazy"/>`
          : `<div class="no-foto">${l.jenis === 'kemacetan' ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>' : l.jenis === 'kecelakaan' ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>'}</div>`}
      </div>
      <div class="laporan-body">
        <div class="laporan-title">${escHtml(l.judul)}</div>
        <div class="laporan-meta">
          <span><span class="badge badge-${l.jenis}">${l.jenis}</span></span>
          <span><span class="badge badge-${l.status}">${l.status}</span></span>
          <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> ${escHtml(l.lokasi)}</span>
          <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> ${escHtml(l.pelapor || 'Anonim')}</span>
          <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg> ${new Date(l.created_at).toLocaleString('id-ID')}</span>
        </div>
        <div class="laporan-desc">${escHtml(l.deskripsi)}</div>
      </div>
    </div>`).join('');
}

function renderPagination({ total, page, limit }) {
  const pages = Math.ceil(total / limit);
  const el = document.getElementById('pagination');
  if (pages <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = Array.from({ length: pages }, (_, i) =>
    `<button class="page-btn ${i+1 === page ? 'active' : ''}" onclick="loadLaporan(${i+1})">${i+1}</button>`
  ).join('');
}

document.getElementById('form-laporan').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-submit');
  const msg = document.getElementById('form-msg');
  btn.disabled = true;
  btn.textContent = 'Mengirim...';
  msg.innerHTML = '';

  const fd = new FormData(e.target);
  try {
    const res  = await fetch('/api/laporan', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.success) {
      msg.innerHTML = '<div class="msg msg-success"> V ' + json.message + '</div>';
      e.target.reset();
      document.getElementById('foto-preview').innerHTML = '';
    } else {
      msg.innerHTML = '<div class="msg msg-error"> X ' + json.message + '</div>';
    }
  } catch(err) {
    msg.innerHTML = '<div class="msg msg-error"> X Gagal mengirim laporan.</div>';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kirim Laporan';
  }
});

document.getElementById('foto-input').addEventListener('change', function() {
  const file = this.files[0];
  const prev = document.getElementById('foto-preview');
  if (file) {
    const reader = new FileReader();
    reader.onload = e => { prev.innerHTML = `<img src="${e.target.result}" alt="preview"/>`; };
    reader.readAsDataURL(file);
  } else { prev.innerHTML = ''; }
});

let isAdmin = false;

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg  = document.getElementById('login-msg');
  const body = JSON.stringify({
    username: document.getElementById('admin-user').value,
    password: document.getElementById('admin-pass').value,
  });
  try {
    const res  = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const json = await res.json();
    if (json.success) {
      isAdmin = true;
      document.getElementById('admin-login-card').style.display = 'none';
      document.getElementById('admin-panel').style.display = 'block';
      loadAdminLaporan();
    } else {
      msg.innerHTML = '<div class="msg msg-error"> X ' + json.message + '</div>';
    }
  } catch(err) {
    msg.innerHTML = '<div class="msg msg-error"> X Gagal login.</div>';
  }
});

function logout() {
  isAdmin = false;
  document.getElementById('admin-login-card').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('form-login').reset();
}

async function loadAdminLaporan() {
  const container = document.getElementById('admin-laporan-list');
  container.innerHTML = '<p style="text-align:center;padding:2rem;color:#b2bec3">Memuat...</p>';
  try {
    const res  = await fetch('/api/laporan?limit=50');
    const json = await res.json();
    container.innerHTML = json.data.map(l => `
      <div class="admin-laporan-card">
        <div style="flex:1">
          <div style="font-weight:700;margin-bottom:4px">${escHtml(l.judul)}</div>
          <div style="font-size:12px;color:#636e72"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> ${escHtml(l.lokasi)} · ${new Date(l.created_at).toLocaleString('id-ID')}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
          <select class="status-select" onchange="updateStatus(${l.id}, this.value)">
            <option ${l.status==='menunggu'?'selected':''} value="menunggu">Menunggu</option>
            <option ${l.status==='diproses'?'selected':''} value="diproses">Diproses</option>
            <option ${l.status==='selesai'?'selected':''}  value="selesai">Selesai</option>
          </select>
          <button class="btn-delete" onclick="deleteLaporan(${l.id})">Hapus</button>
        </div>
      </div>`).join('');
  } catch(e) {
    container.innerHTML = '<p class="empty-state">Gagal memuat: ' + e.message + '</p>';
  }
}

async function updateStatus(id, status) {
  try {
    await fetch(`/api/laporan/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch(e) { alert('Error: ' + e.message); }
}

async function deleteLaporan(id) {
  if (!confirm('Yakin hapus laporan ini?')) return;
  try {
    const res  = await fetch(`/api/laporan/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) loadAdminLaporan();
  } catch(e) { alert('Error: ' + e.message); }
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

loadStats();