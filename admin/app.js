const baseUrl = 'http://localhost:3000';

const photoTable = document.getElementById('photoTable');
const summaryBox = document.getElementById('summaryBox');
const searchBtn = document.getElementById('searchBtn');
const orgIdInput = document.getElementById('orgId');
const taskIdInput = document.getElementById('taskId');
const dateInput = document.getElementById('date');

function renderPhotos(rows) {
  photoTable.innerHTML = '';
  summaryBox.textContent = `共 ${rows.length} 张照片`;

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

async function fetchPhotos() {
  const orgId = orgIdInput.value;
  const taskId = taskIdInput.value;
  const date = dateInput.value;

  const params = new URLSearchParams();
  if (orgId) params.append('orgId', orgId);
  if (taskId) params.append('taskId', taskId);
  if (date) params.append('date', date);

  const url = `${baseUrl}/photos?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  renderPhotos(data.data || []);
}

searchBtn.addEventListener('click', fetchPhotos);
fetchPhotos();
