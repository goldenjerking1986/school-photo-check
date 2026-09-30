const baseUrl = 'http://localhost:3000';

const photoTable = document.getElementById('photoTable');
const summaryBox = document.getElementById('summaryBox');
const statsCards = document.getElementById('statsCards');
const searchBtn = document.getElementById('searchBtn');
const orgIdInput = document.getElementById('orgId');
const taskIdInput = document.getElementById('taskId');
const dateInput = document.getElementById('date');
const loginPanel = document.getElementById('loginPanel');
const appPanel = document.getElementById('appPanel');
const loginTokenInput = document.getElementById('loginToken');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

function getToken() {
  return localStorage.getItem('token') || '';
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function showPanel(isLoggedIn) {
  loginPanel.classList.toggle('hidden', isLoggedIn);
  appPanel.classList.toggle('hidden', !isLoggedIn);
}

function renderSummary(stats) {
  const total = Number(stats.total || 0);
  const uploaded = Number(stats.uploaded || 0);
  const reviewed = Number(stats.reviewed || 0);
  const rejected = Number(stats.rejected || 0);

  summaryBox.textContent = `共 ${total} 张照片`;
  statsCards.innerHTML = `
    <div class="card"><span>已上传</span><strong>${uploaded}</strong></div>
    <div class="card"><span>已审核</span><strong>${reviewed}</strong></div>
    <div class="card"><span>已驳回</span><strong>${rejected}</strong></div>
  `;
}

function renderPhotos(rows) {
  photoTable.innerHTML = '';
  if (!rows.length) {
    photoTable.innerHTML = '<tr><td colspan="7">暂无数据</td></tr>';
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td><img src="${row.file_path}" alt="photo" /></td>
      <td>${row.capture_time || '-'}</td>
      <td>${row.location_text || '-'}</td>
      <td>${row.org_name || '-'}</td>
      <td>${row.status || 'uploaded'}</td>
      <td><a href="${row.file_path}" target="_blank">查看</a></td>
    `;
    photoTable.appendChild(tr);
  });
}

async function fetchSummary() {
  const orgId = orgIdInput.value;
  const taskId = taskIdInput.value;
  const params = new URLSearchParams();
  if (orgId) params.append('orgId', orgId);
  if (taskId) params.append('taskId', taskId);

  const res = await fetch(`${baseUrl}/photos/summary?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (data && data.success) {
    renderSummary(data.data || { total: 0, uploaded: 0, reviewed: 0, rejected: 0 });
  }
}

async function fetchPhotos() {
  const orgId = orgIdInput.value;
  const taskId = taskIdInput.value;
  const date = dateInput.value;

  const params = new URLSearchParams();
  if (orgId) params.append('orgId', orgId);
  if (taskId) params.append('taskId', taskId);
  if (date) params.append('date', date);

  const res = await fetch(`${baseUrl}/photos?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (data && data.success) {
    renderPhotos(data.data || []);
  } else {
    alert(data.message || '查询失败');
  }
}

loginBtn.addEventListener('click', () => {
  const token = loginTokenInput.value.trim();
  if (!token) {
    alert('请输入 Bearer token');
    return;
  }
  setToken(token.replace(/^Bearer\s+/i, ''));
  showPanel(true);
  fetchSummary();
  fetchPhotos();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  showPanel(false);
});

searchBtn.addEventListener('click', () => {
  fetchSummary();
  fetchPhotos();
});

showPanel(Boolean(getToken()));
if (getToken()) {
  fetchSummary();
  fetchPhotos();
}
