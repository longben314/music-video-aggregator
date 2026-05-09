// 页面加载后初始化
document.addEventListener('DOMContentLoaded', initApp);

let currentSource = null;
let currentTab = 'home';

function initApp() {
  renderSources();
  renderPlayerSources();
  renderPreviewSources();
  initNavigation();
  initAdminRedirect();
}

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = e.target.dataset.tab;
      switchTab(tab);
    });
  });
}

function initAdminRedirect() {
  if (AuthManager.isLoggedIn()) {
    // 如果已登录，允许访问后台
  }
}

function switchTab(tab) {
  currentTab = tab;
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const activeTab = document.getElementById(`${tab}-tab`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  if (tab === 'source') {
    renderSources();
  } else if (tab === 'player') {
    renderPlayerSources();
  }
}

function showLogin() {
  if (AuthManager.isLoggedIn()) {
    window.location.href = 'admin.html';
  } else {
    document.getElementById('login-modal').classList.add('show');
  }
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('show');
  });
}

function doLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  
  if (!username || !password) {
    errorEl.textContent = '请输入用户名和密码';
    return;
  }
  
  if (AuthManager.login(username, password)) {
    window.location.href = 'admin.html';
  } else {
    errorEl.textContent = '用户名或密码错误';
  }
}

function renderSources() {
  const sources = SourceManager.getSources();
  const container = document.getElementById('sources-list');
  
  container.innerHTML = sources.map(source => `
    <div class="source-card">
      <div class="source-card-header">
        <h3 class="source-card-title">${source.name}</h3>
        <div class="source-card-actions">
          <button class="btn btn-sm btn-outline" onclick="toggleSourceActive(${source.id})">
            ${source.active ? '禁用' : '启用'}
          </button>
          <button class="btn btn-sm btn-outline" onclick="deleteSource(${source.id})">删除</button>
        </div>
      </div>
      <p class="source-card-url">${source.url}</p>
      <span class="source-card-status ${source.active ? 'status-active' : 'status-inactive'}">
        ${source.active ? '已启用' : '已禁用'}
      </span>
    </div>
  `).join('');
}

function renderPreviewSources() {
  const sources = SourceManager.getActiveSources();
  const container = document.getElementById('preview-sources');
  
  container.innerHTML = sources.map(source => `
    <div class="source-card" onclick="goToSource(${source.id})">
      <div class="source-card-header">
        <h3 class="source-card-title">${source.name}</h3>
      </div>
      <p class="source-card-url">${source.url}</p>
    </div>
  `).join('');
}

function renderPlayerSources() {
  const sources = SourceManager.getActiveSources();
  const select = document.getElementById('player-source');
  
  select.innerHTML = '<option value="">请选择源</option>' + 
    sources.map(source => `
      <option value="${source.id}">${source.name}</option>
    `).join('');
}

function goToSource(id) {
  currentSource = SourceManager.getSources().find(s => s.id === id);
  switchTab('player');
  if (currentSource) {
    document.getElementById('player-source').value = currentSource.id;
  }
}

function addSource() {
  document.getElementById('source-form').style.display = 'block';
}

function hideSourceForm() {
  document.getElementById('source-form').style.display = 'none';
  document.getElementById('source-name').value = '';
  document.getElementById('source-url').value = '';
}

function saveSource() {
  const name = document.getElementById('source-name').value.trim();
  const url = document.getElementById('source-url').value.trim();
  
  if (!name || !url) {
    showToast('请填写完整信息');
    return;
  }
  
  SourceManager.addSource({ name, url });
  hideSourceForm();
  renderSources();
  renderPreviewSources();
  renderPlayerSources();
  showToast('添加成功');
}

function toggleSourceActive(id) {
  SourceManager.toggleActive(id);
  renderSources();
  renderPreviewSources();
  renderPlayerSources();
}

function deleteSource(id) {
  if (confirm('确定要删除此源吗？')) {
    SourceManager.deleteSource(id);
    renderSources();
    renderPreviewSources();
    renderPlayerSources();
    showToast('删除成功');
  }
}

function loadSource() {
  const sourceId = document.getElementById('player-source').value;
  if (!sourceId) return;
  
  const sources = SourceManager.getSources();
  const source = sources.find(s => s.id === parseInt(sourceId));
  if (source) {
    currentSource = source;
    showToast('源已加载');
  }
}

function searchVideo() {
  const keyword = document.getElementById('search-input').value.trim();
  if (!keyword) {
    showToast('请输入搜索关键词');
    return;
  }
  
  if (!currentSource) {
    showToast('请先选择视频源');
    return;
  }
  
  // 演示视频
  const videos = [
    { id: 1, title: keyword + ' - 演示视频1', type: '电影', year: '2024' },
    { id: 2, title: keyword + ' - 演示视频2', type: '电视剧', year: '2024' },
    { id: 3, title: keyword + ' - 演示视频3', type: '综艺', year: '2024' }
  ];
  
  renderVideoList(videos);
}

function renderVideoList(videos) {
  const container = document.getElementById('video-list');
  
  container.innerHTML = `
    <div class="video-grid">
      ${videos.map(video => `
        <div class="video-item" onclick="playVideo(${video.id}, '${video.title}', '${currentSource?.url}')">
          <div class="video-item-thumb">🎬</div>
          <div class="video-item-info">
            <div class="video-item-title">${video.title}</div>
            <div class="video-item-meta">${video.type} · ${video.year}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function playVideo(id, title, sourceUrl) {
  document.getElementById('video-list').style.display = 'none';
  document.getElementById('video-player').style.display = 'block';
  document.getElementById('video-title').textContent = title;
  
  HistoryManager.addToHistory({ id, title, sourceUrl });
  
  const iframe = document.getElementById('video-iframe');
  // 使用通用解析器
  iframe.src = 'https://www.1905.com';
  
  showToast('开始播放');
}

function backToList() {
  document.getElementById('video-list').style.display = 'block';
  document.getElementById('video-player').style.display = 'none';
  document.getElementById('video-iframe').src = '';
}

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// 键盘事件
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
