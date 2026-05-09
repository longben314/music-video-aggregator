// 默认数据
const DEFAULT_SOURCES = [
  { id: 1, name: '饭太硬', url: 'https://ghproxy.com/https://raw.githubusercontent.com/fan2022/tvbox/main/tvbox.json', active: true },
  { id: 2, name: '欧歌', url: 'https://ghproxy.com/https://raw.githubusercontent.com/Put一颗星星/XML-TV/main/tvbox.json', active: true },
  { id: 3, name: '巧技', url: 'https://ghproxy.com/https://raw.githubusercontent.com/qiaoji111/TVBox/main/qiaoji.json', active: true },
  { id: 4, name: '肥猫', url: 'https://ghproxy.com/https://raw.githubusercontent.com/fanyingming/TVBox/main/fym.json', active: false }
];

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'longben314'
};

// 从localStorage获取数据
function getData(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return defaultValue;
  }
}

// 保存数据到localStorage
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    return false;
  }
}

// 视频源管理
const SourceManager = {
  getSources() {
    return getData('tvbox_sources', DEFAULT_SOURCES);
  },

  saveSources(sources) {
    saveData('tvbox_sources', sources);
  },

  addSource(source) {
    const sources = this.getSources();
    const newSource = {
      id: Date.now(),
      ...source,
      active: true
    };
    sources.push(newSource);
    this.saveSources(sources);
    return newSource;
  },

  updateSource(id, updates) {
    const sources = this.getSources();
    const index = sources.findIndex(s => s.id === id);
    if (index !== -1) {
      sources[index] = { ...sources[index], ...updates };
      this.saveSources(sources);
      return sources[index];
    }
    return null;
  },

  deleteSource(id) {
    const sources = this.getSources();
    const filtered = sources.filter(s => s.id !== id);
    this.saveSources(filtered);
    return filtered;
  },

  toggleActive(id) {
    const sources = this.getSources();
    const source = sources.find(s => s.id === id);
    if (source) {
      source.active = !source.active;
      this.saveSources(sources);
    }
    return sources;
  },

  getActiveSources() {
    return this.getSources().filter(s => s.active);
  }
};

// 管理员认证
const AuthManager = {
  login(username, password) {
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      saveData('tvbox_token', {
        username,
        loggedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem('tvbox_token');
  },

  isLoggedIn() {
    return !!localStorage.getItem('tvbox_token');
  },

  getUser() {
    return getData('tvbox_token', null);
  },

  changePassword(newPassword) {
    DEFAULT_ADMIN.password = newPassword;
    saveData('tvbox_admin', { ...DEFAULT_ADMIN });
    return true;
  }
};

// 播放历史
const HistoryManager = {
  getHistory() {
    return getData('tvbox_history', []);
  },

  addToHistory(video) {
    const history = this.getHistory();
    const existing = history.find(h => h.id === video.id);
    if (existing) {
      existing.lastPlayed = new Date().toISOString();
      existing.playCount = (existing.playCount || 1) + 1;
    } else {
      history.unshift({
        ...video,
        addedAt: new Date().toISOString(),
        lastPlayed: new Date().toISOString(),
        playCount: 1
      });
    }
    saveData('tvbox_history', history.slice(0, 50));
  },

  clearHistory() {
    saveData('tvbox_history', []);
  }
};
