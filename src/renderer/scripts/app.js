// ================================================
// GlassBrowser - Main Application
// With Fluid Animations & Custom Themes
// ================================================

class GlassBrowser {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.bookmarks = [];
    this.history = [];
    this.downloads = [];
    this.settings = {};
    this.user = null;
    this.isMaximized = false;
    this.customQuickLinks = [];

    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.setupCustomizationListeners();
    this.setupExtendedSettingsListeners();
    this.setupQuickLinkModal();
    this.setupTabPreview();
    this.renderBookmarksBar();
    this.renderQuickLinks();
    this.createNewTab();
    this.applySettings();
    this.applyExtendedSettings();
    this.setupWindowStateListener();
    this.initBackgroundEffect();
  }

  async loadData() {
    this.bookmarks = await window.electronAPI.getBookmarks();
    this.history = await window.electronAPI.getHistory();
    this.settings = await window.electronAPI.getSettings();
    this.user = await window.electronAPI.getUser();
    this.customQuickLinks = this.settings.customQuickLinks || [];

    if (this.user) {
      this.showUserProfile();
    }
  }

  setupEventListeners() {
    // Window controls with animations
    document.getElementById('minimizeBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('minimizeBtn'));
      window.electronAPI.minimize();
    });
    
    document.getElementById('maximizeBtn').addEventListener('click', async () => {
      this.animateButton(document.getElementById('maximizeBtn'));
      await this.toggleMaximize();
    });
    
    document.getElementById('closeBtn').addEventListener('click', () => {
      document.querySelector('.browser-container').style.animation = 'containerFadeOut 0.2s ease-out forwards';
      setTimeout(() => window.electronAPI.close(), 150);
    });

    // Tab controls
    document.getElementById('newTabBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('newTabBtn'));
      this.createNewTab();
    });

    // Navigation controls
    document.getElementById('backBtn').addEventListener('click', () => this.goBack());
    document.getElementById('forwardBtn').addEventListener('click', () => this.goForward());
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('refreshBtn'));
      this.refresh();
    });
    document.getElementById('homeBtn').addEventListener('click', () => this.goHome());

    // URL bar
    const urlInput = document.getElementById('urlInput');
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.navigate(urlInput.value);
    });
    urlInput.addEventListener('focus', () => urlInput.select());

    // Search input on start page
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.search(searchInput.value);
    });

    // Bookmark button
    document.getElementById('bookmarkBtn').addEventListener('click', () => this.toggleBookmark());

    // Sidebar panels
    document.getElementById('bookmarksBtn').addEventListener('click', () => this.togglePanel('bookmarksPanel'));
    document.getElementById('historyBtn').addEventListener('click', () => this.togglePanel('historyPanel'));
    document.getElementById('downloadsBtn').addEventListener('click', () => this.togglePanel('downloadsPanel'));
    document.getElementById('settingsBtn').addEventListener('click', () => this.togglePanel('settingsPanel'));
    document.getElementById('userBtn').addEventListener('click', () => this.togglePanel('userPanel'));

    // Panel close buttons
    document.querySelectorAll('.panel-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllPanels());
    });

    // Clear history
    document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());

    // Downloads
    document.getElementById('openDownloadsFolderBtn').addEventListener('click', () => this.openDownloadsFolder());
    document.getElementById('clearDownloadsBtn').addEventListener('click', () => this.clearDownloadsList());

    // Settings
    this.setupSettingsListeners();

    // Auth
    this.setupAuthListeners();

    // Context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('click', () => this.hideContextMenu());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  // ================================================
  // Window State & Animations
  // ================================================

  async toggleMaximize() {
    const container = document.querySelector('.browser-container');
    const btn = document.getElementById('maximizeBtn');
    
    this.isMaximized = await window.electronAPI.isMaximized();
    
    if (this.isMaximized) {
      container.classList.add('unmaximizing');
      container.classList.remove('maximizing');
      btn.innerHTML = '<i class="fas fa-square"></i>';
    } else {
      container.classList.add('maximizing');
      container.classList.remove('unmaximizing');
      btn.innerHTML = '<i class="far fa-window-restore"></i>';
    }
    
    await window.electronAPI.maximize();
    
    setTimeout(() => {
      container.classList.remove('maximizing', 'unmaximizing');
    }, 300);
  }

  setupWindowStateListener() {
    // Add CSS for close animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes containerFadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }

  animateButton(btn) {
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 100);
  }

  // ================================================
  // Customization Listeners
  // ================================================

  setupCustomizationListeners() {
    // Color presets
    document.querySelectorAll('.color-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        
        const hue = preset.dataset.hue;
        this.applyAccentColor(hue);
        this.updateSettings({ accentHue: parseInt(hue) });
      });
    });

    // Blur range
    const blurRange = document.getElementById('blurRange');
    if (blurRange) {
      blurRange.addEventListener('input', (e) => {
        this.applyBlur(e.target.value);
        this.updateSettings({ blur: parseInt(e.target.value) });
      });
    }

    // Shape selector
    document.querySelectorAll('.shape-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.shape-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');

        const radius = option.dataset.radius;
        this.applyTabRadius(radius);
        this.updateSettings({ tabRadius: parseInt(radius) });
      });
    });

    // UI Shape selector
    document.querySelectorAll('.ui-shape-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.ui-shape-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');

        const shape = option.dataset.shape;
        this.applyUiShape(shape);
        this.updateSettings({ uiShape: shape });
      });
    });
  }

  applyAccentColor(hue) {
    document.documentElement.style.setProperty('--accent-hue', hue);
    
    // Animate the change
    document.querySelectorAll('.tab.active, .nav-btn.active, .auth-submit-btn').forEach(el => {
      el.style.transition = 'all 0.5s ease';
    });
  }

  applyBlur(value) {
    document.documentElement.style.setProperty('--blur-amount', value + 'px');
  }

  applyTabRadius(value) {
    document.documentElement.style.setProperty('--tab-radius', value + 'px');
  }

  applyUiShape(shape) {
    const body = document.body;
    body.classList.remove('ui-shape-square', 'ui-shape-rounded', 'ui-shape-pill');
    if (shape && shape !== 'rounded') {
      body.classList.add('ui-shape-' + shape);
    }
  }

  setupSettingsListeners() {
    document.getElementById('homepageInput').addEventListener('change', (e) => {
      this.updateSettings({ homepage: e.target.value });
    });

    document.getElementById('searchEngineSelect').addEventListener('change', (e) => {
      this.updateSettings({ searchEngine: e.target.value });
    });

    document.getElementById('themeSelect').addEventListener('change', (e) => {
      this.updateSettings({ theme: e.target.value });
      this.applyTheme(e.target.value);
    });

    document.getElementById('transparencyRange').addEventListener('input', (e) => {
      this.applyTransparency(e.target.value);
    });
    
    document.getElementById('transparencyRange').addEventListener('change', (e) => {
      this.updateSettings({ transparency: parseFloat(e.target.value) });
    });
  }

  setupAuthListeners() {
    // Tab switching with animation
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const isLogin = tab.dataset.tab === 'login';
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (isLogin) {
          loginForm.classList.remove('hidden');
          loginForm.style.animation = 'sectionFadeIn 0.3s ease-out';
          registerForm.classList.add('hidden');
        } else {
          registerForm.classList.remove('hidden');
          registerForm.style.animation = 'sectionFadeIn 0.3s ease-out';
          loginForm.classList.add('hidden');
        }
      });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      const result = await window.electronAPI.loginAccount({ email, password });
      if (result.success) {
        this.user = result.user;
        this.showUserProfile();
        this.showToast('Erfolgreich angemeldet!', 'success');
      } else {
        this.showToast(result.error, 'error');
      }
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
      
      if (password !== passwordConfirm) {
        this.showToast('Passwörter stimmen nicht überein!', 'error');
        return;
      }
      
      const result = await window.electronAPI.registerAccount({ email, password, name });
      if (result.success) {
        this.user = result.user;
        await window.electronAPI.setUser(result.user);
        this.showUserProfile();
        this.showToast('Konto erfolgreich erstellt!', 'success');
      } else {
        this.showToast(result.error, 'error');
      }
    });

    // Google auth
    document.getElementById('googleLoginBtn').addEventListener('click', async () => {
      const result = await window.electronAPI.googleAuth();
      if (result.success) {
        this.showToast('Google-Anmeldung erfolgreich!', 'success');
      } else {
        this.showToast('Google-Anmeldung abgebrochen', 'warning');
      }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await window.electronAPI.logout();
      this.user = null;
      this.hideUserProfile();
      this.showToast('Erfolgreich abgemeldet', 'success');
    });

    // Profile image upload
    document.getElementById('editAvatarBtn').addEventListener('click', () => {
      document.getElementById('profileImageInput').click();
    });

    document.getElementById('profileImageInput').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          this.showToast('Bild ist zu groß (max. 5MB)', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          const imageData = event.target.result;
          await this.updateSettings({ profileImage: imageData });
          this.updateProfileAvatar(imageData);
          this.showToast('Profilbild aktualisiert', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ================================================
  // Tab Management with Animations
  // ================================================

  createNewTab(url = null) {
    const tabId = 'tab-' + Date.now();
    const tab = {
      id: tabId,
      title: 'Neuer Tab',
      url: url || '',
      favicon: null,
      isLoading: false,
      canGoBack: false,
      canGoForward: false
    };
    
    this.tabs.push(tab);
    this.renderTab(tab);
    
    if (url) {
      this.createWebview(tabId, url);
    }
    
    this.setActiveTab(tabId);
    
    // Scroll to new tab
    const container = document.getElementById('tabsContainer');
    container.scrollLeft = container.scrollWidth;
    
    return tabId;
  }

  renderTab(tab) {
    const container = document.getElementById('tabsContainer');
    const tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.id = tab.id;
    tabEl.style.animationDelay = '0s';
    tabEl.innerHTML = `
      <div class="tab-favicon default"><i class="fas fa-globe"></i></div>
      <span class="tab-title">${tab.title}</span>
      <button class="tab-close"><i class="fas fa-times"></i></button>
    `;
    
    tabEl.addEventListener('click', (e) => {
      if (!e.target.closest('.tab-close')) {
        this.setActiveTab(tab.id);
      }
    });
    
    tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tab.id);
    });
    
    container.appendChild(tabEl);
  }

  setActiveTab(tabId) {
    this.activeTabId = tabId;
    const tab = this.tabs.find(t => t.id === tabId);
    
    // Update tab UI with smooth transition
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
    });
    
    const activeTabEl = document.getElementById(tabId);
    if (activeTabEl) {
      activeTabEl.classList.add('active');
      // Scroll tab into view
      activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
    
    // Update webviews with fade
    document.querySelectorAll('webview').forEach(wv => wv.classList.remove('active'));
    const webview = document.getElementById(`webview-${tabId}`);
    if (webview) {
      webview.classList.add('active');
      document.getElementById('startPage').classList.remove('active');
    } else {
      document.getElementById('startPage').classList.add('active');
    }
    
    // Update URL bar and navigation
    this.updateURLBar(tab.url);
    this.updateNavButtons(tab);
    this.updateBookmarkButton(tab.url);
  }

  closeTab(tabId) {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;
    
    const tabEl = document.getElementById(tabId);
    
    // Animate tab closing
    if (tabEl) {
      tabEl.classList.add('closing');
      tabEl.addEventListener('animationend', () => {
        this.removeTab(tabId, index);
      }, { once: true });
    } else {
      this.removeTab(tabId, index);
    }
  }

  removeTab(tabId, index) {
    // Remove tab
    this.tabs.splice(index, 1);
    document.getElementById(tabId)?.remove();
    document.getElementById(`webview-${tabId}`)?.remove();
    
    // If no tabs left, create new one
    if (this.tabs.length === 0) {
      this.createNewTab();
      return;
    }
    
    // If closed active tab, activate another
    if (this.activeTabId === tabId) {
      const newIndex = Math.min(index, this.tabs.length - 1);
      this.setActiveTab(this.tabs[newIndex].id);
    }
  }

  updateTab(tabId, updates) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    Object.assign(tab, updates);
    
    const tabEl = document.getElementById(tabId);
    if (tabEl) {
      const titleEl = tabEl.querySelector('.tab-title');
      titleEl.textContent = tab.title;
      
      const faviconEl = tabEl.querySelector('.tab-favicon');
      
      if (tab.isLoading) {
        faviconEl.innerHTML = '<div class="tab-loading"></div>';
        faviconEl.classList.remove('default');
      } else if (tab.favicon) {
        faviconEl.innerHTML = `<img src="${tab.favicon}" alt="" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-globe\\'></i>'; this.parentElement.classList.add('default');">`;
        faviconEl.classList.remove('default');
      } else {
        faviconEl.innerHTML = '<i class="fas fa-globe"></i>';
        faviconEl.classList.add('default');
      }
    }
    
    if (tabId === this.activeTabId) {
      this.updateURLBar(tab.url);
      this.updateNavButtons(tab);
      this.updateBookmarkButton(tab.url);
    }
  }

  // ================================================
  // Webview Management
  // ================================================

  createWebview(tabId, url) {
    const contentArea = document.getElementById('contentArea');
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.src = this.normalizeURL(url);
    webview.setAttribute('allowpopups', '');
    webview.setAttribute('webpreferences', 'contextIsolation=yes');
    
    this.setupWebviewListeners(webview, tabId);
    contentArea.appendChild(webview);
    
    document.getElementById('startPage').classList.remove('active');
    webview.classList.add('active');
  }

  setupWebviewListeners(webview, tabId) {
    webview.addEventListener('did-start-loading', () => {
      this.updateTab(tabId, { isLoading: true });
      document.getElementById('loadingBar').classList.add('loading');
    });
    
    webview.addEventListener('did-stop-loading', () => {
      this.updateTab(tabId, { isLoading: false });
      document.getElementById('loadingBar').classList.remove('loading');
    });
    
    webview.addEventListener('page-title-updated', (e) => {
      this.updateTab(tabId, { title: e.title });
    });
    
    webview.addEventListener('page-favicon-updated', (e) => {
      if (e.favicons && e.favicons.length > 0) {
        this.updateTab(tabId, { favicon: e.favicons[0] });
      }
    });
    
    webview.addEventListener('did-navigate', (e) => {
      this.updateTab(tabId, {
        url: e.url,
        canGoBack: webview.canGoBack(),
        canGoForward: webview.canGoForward()
      });
      this.addToHistory(e.url, this.tabs.find(t => t.id === tabId)?.title);
    });
    
    webview.addEventListener('did-navigate-in-page', (e) => {
      if (e.isMainFrame) {
        this.updateTab(tabId, {
          url: e.url,
          canGoBack: webview.canGoBack(),
          canGoForward: webview.canGoForward()
        });
      }
    });
    
    webview.addEventListener('new-window', (e) => {
      this.createNewTab(e.url);
    });
  }

  getActiveWebview() {
    if (!this.activeTabId) return null;
    return document.getElementById(`webview-${this.activeTabId}`);
  }

  // ================================================
  // Navigation
  // ================================================

  navigate(input) {
    const url = this.normalizeURL(input);
    const webview = this.getActiveWebview();
    
    if (webview) {
      webview.src = url;
    } else {
      this.createWebview(this.activeTabId, url);
    }
    
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    if (tab) tab.url = url;
  }

  normalizeURL(input) {
    input = input.trim();
    
    // Check if it's a search query
    if (!input.includes('.') || input.includes(' ')) {
      return this.getSearchURL(input);
    }
    
    // Add protocol if missing
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      return 'https://' + input;
    }
    
    return input;
  }

  getSearchURL(query) {
    const engines = {
      google: 'https://www.google.com/search?q=',
      bing: 'https://www.bing.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
      ecosia: 'https://www.ecosia.org/search?q='
    };
    
    const engine = engines[this.settings.searchEngine] || engines.google;
    return engine + encodeURIComponent(query);
  }

  search(query) {
    if (query.trim()) {
      this.navigate(query);
    }
  }

  goBack() {
    const webview = this.getActiveWebview();
    if (webview?.canGoBack()) {
      webview.goBack();
    }
  }

  goForward() {
    const webview = this.getActiveWebview();
    if (webview?.canGoForward()) {
      webview.goForward();
    }
  }

  refresh() {
    const webview = this.getActiveWebview();
    if (webview) {
      // Add rotation animation to refresh button
      const btn = document.getElementById('refreshBtn');
      btn.querySelector('i').style.animation = 'spin 0.5s ease-out';
      setTimeout(() => {
        btn.querySelector('i').style.animation = '';
      }, 500);
      
      webview.reload();
    }
  }

  goHome() {
    this.navigate(this.settings.homepage || 'https://www.google.com');
  }

  updateURLBar(url) {
    const input = document.getElementById('urlInput');
    input.value = url || '';
    
    const securityIndicator = document.getElementById('securityIndicator');
    if (url?.startsWith('https://')) {
      securityIndicator.innerHTML = '<i class="fas fa-lock"></i>';
      securityIndicator.className = 'security-indicator';
    } else if (url?.startsWith('http://')) {
      securityIndicator.innerHTML = '<i class="fas fa-unlock"></i>';
      securityIndicator.className = 'security-indicator insecure';
    } else {
      securityIndicator.innerHTML = '<i class="fas fa-search"></i>';
      securityIndicator.className = 'security-indicator';
    }
  }

  updateNavButtons(tab) {
    document.getElementById('backBtn').disabled = !tab?.canGoBack;
    document.getElementById('forwardBtn').disabled = !tab?.canGoForward;
  }

  // ================================================
  // Bookmarks
  // ================================================

  async toggleBookmark() {
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    if (!tab?.url) return;
    
    const existing = this.bookmarks.find(b => b.url === tab.url);
    
    if (existing) {
      this.bookmarks = await window.electronAPI.removeBookmark(existing.id);
      this.showToast('Lesezeichen entfernt', 'success');
    } else {
      this.bookmarks = await window.electronAPI.addBookmark({
        title: tab.title,
        url: tab.url,
        favicon: tab.favicon
      });
      this.showToast('Lesezeichen hinzugefügt', 'success');
    }
    
    this.updateBookmarkButton(tab.url);
    this.renderBookmarksBar();
    this.renderBookmarksList();
  }

  updateBookmarkButton(url) {
    const btn = document.getElementById('bookmarkBtn');
    const isBookmarked = this.bookmarks.some(b => b.url === url);
    btn.innerHTML = `<i class="${isBookmarked ? 'fas' : 'far'} fa-star"></i>`;
    btn.classList.toggle('bookmarked', isBookmarked);
  }

  renderBookmarksBar() {
    const bar = document.getElementById('bookmarksBar');
    bar.innerHTML = '';

    this.bookmarks.slice(0, 10).forEach((bookmark, index) => {
      const item = document.createElement('button');
      item.className = 'bookmark-item';
      item.style.animationDelay = `${index * 0.05}s`;
      item.innerHTML = `
        ${bookmark.favicon ? `<img src="${bookmark.favicon}" alt="" onerror="this.outerHTML='<i class=\\'fas fa-globe\\'></i>'">` : '<i class="fas fa-globe"></i>'}
        <span>${bookmark.title}</span>
      `;
      item.addEventListener('click', () => this.navigate(bookmark.url));
      bar.appendChild(item);
    });
  }

  renderQuickLinks() {
    const container = document.getElementById('quickLinks');
    const defaultLinks = [
      { title: 'Google', url: 'https://google.com', icon: 'fab fa-google', color: '#4285f4', isDefault: true },
      { title: 'YouTube', url: 'https://youtube.com', icon: 'fab fa-youtube', color: '#ff0000', isDefault: true },
      { title: 'GitHub', url: 'https://github.com', icon: 'fab fa-github', color: '#333', isDefault: true },
      { title: 'Reddit', url: 'https://reddit.com', icon: 'fab fa-reddit', color: '#ff4500', isDefault: true },
      { title: 'Twitter', url: 'https://twitter.com', icon: 'fab fa-twitter', color: '#1da1f2', isDefault: true },
      { title: 'Wikipedia', url: 'https://wikipedia.org', icon: 'fab fa-wikipedia-w', color: '#000', isDefault: true }
    ];

    // Get hidden default links from settings
    const hiddenDefaults = this.settings.hiddenDefaultLinks || [];

    // Filter out hidden default links
    const visibleDefaults = defaultLinks.filter((_, index) => !hiddenDefaults.includes(index));

    // Combine visible defaults with custom links
    let links = [...visibleDefaults, ...this.customQuickLinks];

    // Limit to 12 links max
    links = links.slice(0, 12);

    container.innerHTML = links.map((link, index) => `
      <div class="quick-link" data-url="${link.url}" data-index="${index}" data-is-default="${link.isDefault || false}">
        <button class="quick-link-delete" data-index="${index}" data-is-default="${link.isDefault || false}"><i class="fas fa-times"></i></button>
        <div class="quick-link-icon" style="background: ${link.color || '#6366f1'}">
          ${link.favicon
            ? `<img src="${link.favicon}" alt="" style="width:24px;height:24px;border-radius:4px;" onerror="this.outerHTML='<i class=\\'fas fa-globe\\'></i>'">`
            : `<i class="${link.icon || 'fas fa-globe'}"></i>`}
        </div>
        <span class="quick-link-title">${link.title}</span>
      </div>
    `).join('') + `
      <div class="quick-link add-link" id="addQuickLinkBtn">
        <div class="quick-link-icon">
          <i class="fas fa-plus"></i>
        </div>
        <span class="quick-link-title">Hinzufügen</span>
      </div>
    `;

    // Navigate on click
    container.querySelectorAll('.quick-link:not(.add-link)').forEach(el => {
      el.addEventListener('click', (e) => {
        if (!e.target.closest('.quick-link-delete')) {
          this.navigate(el.dataset.url);
        }
      });
    });

    // Delete button
    container.querySelectorAll('.quick-link-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        const isDefault = btn.dataset.isDefault === 'true';
        this.deleteQuickLink(index, isDefault);
      });
    });

    // Add button
    document.getElementById('addQuickLinkBtn').addEventListener('click', () => {
      this.openAddLinkModal();
    });
  }

  setupQuickLinkModal() {
    const modal = document.getElementById('addLinkModal');
    const closeBtn = document.getElementById('closeAddLinkModal');
    const cancelBtn = document.getElementById('cancelAddLink');
    const saveBtn = document.getElementById('saveQuickLink');

    closeBtn.addEventListener('click', () => this.closeAddLinkModal());
    cancelBtn.addEventListener('click', () => this.closeAddLinkModal());

    // Color selection
    document.querySelectorAll('.ql-color').forEach(color => {
      color.addEventListener('click', () => {
        document.querySelectorAll('.ql-color').forEach(c => c.classList.remove('active'));
        color.classList.add('active');
      });
    });

    saveBtn.addEventListener('click', () => this.saveQuickLink());

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeAddLinkModal();
    });

    // Enter key to save
    document.getElementById('quickLinkUrl').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveQuickLink();
    });
  }

  openAddLinkModal() {
    const modal = document.getElementById('addLinkModal');
    modal.classList.add('active');
    document.getElementById('quickLinkName').value = '';
    document.getElementById('quickLinkUrl').value = '';
    document.getElementById('quickLinkName').focus();
  }

  closeAddLinkModal() {
    document.getElementById('addLinkModal').classList.remove('active');
  }

  async saveQuickLink() {
    const name = document.getElementById('quickLinkName').value.trim();
    const url = document.getElementById('quickLinkUrl').value.trim();
    const activeColor = document.querySelector('.ql-color.active');
    const color = activeColor ? activeColor.dataset.color : '#6366f1';

    if (!name || !url) {
      this.showToast('Bitte Name und URL eingeben', 'warning');
      return;
    }

    const normalizedUrl = url.startsWith('http') ? url : 'https://' + url;

    const newLink = {
      title: name,
      url: normalizedUrl,
      icon: 'fas fa-globe',
      color: color
    };

    this.customQuickLinks.push(newLink);
    await this.updateSettings({ customQuickLinks: this.customQuickLinks });
    this.renderQuickLinks();
    this.closeAddLinkModal();
    this.showToast('Schnellzugriff hinzugefügt', 'success');
  }

  async deleteQuickLink(index, isDefault = false) {
    if (isDefault) {
      // Hide default link instead of deleting
      const hiddenDefaults = this.settings.hiddenDefaultLinks || [];
      // Find the original index of this default link
      const defaultLinks = [
        { url: 'https://google.com' },
        { url: 'https://youtube.com' },
        { url: 'https://github.com' },
        { url: 'https://reddit.com' },
        { url: 'https://twitter.com' },
        { url: 'https://wikipedia.org' }
      ];
      const visibleDefaults = defaultLinks.filter((_, i) => !hiddenDefaults.includes(i));
      const originalIndex = defaultLinks.findIndex(d => d.url === visibleDefaults[index]?.url);
      if (originalIndex !== -1 && !hiddenDefaults.includes(originalIndex)) {
        hiddenDefaults.push(originalIndex);
        await this.updateSettings({ hiddenDefaultLinks: hiddenDefaults });
      }
    } else {
      // Remove custom link
      const visibleDefaultsCount = 6 - (this.settings.hiddenDefaultLinks || []).length;
      const customIndex = index - visibleDefaultsCount;
      if (customIndex >= 0 && customIndex < this.customQuickLinks.length) {
        this.customQuickLinks.splice(customIndex, 1);
        await this.updateSettings({ customQuickLinks: this.customQuickLinks });
      }
    }
    this.renderQuickLinks();
    this.showToast('Schnellzugriff entfernt', 'success');
  }

  renderBookmarksList() {
    const list = document.getElementById('bookmarkList');
    
    if (this.bookmarks.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="far fa-bookmark"></i>
          <p>Keine Lesezeichen vorhanden</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = this.bookmarks.map((bookmark, index) => `
      <div class="bookmark-entry" data-url="${bookmark.url}" style="animation-delay: ${index * 0.05}s">
        ${bookmark.favicon ? `<img src="${bookmark.favicon}" alt="" onerror="this.outerHTML='<i class=\\'fas fa-globe\\'></i>'">` : '<i class="fas fa-globe"></i>'}
        <div class="entry-info">
          <div class="entry-title">${bookmark.title}</div>
          <div class="entry-url">${bookmark.url}</div>
        </div>
        <button class="entry-delete" data-id="${bookmark.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
    
    list.querySelectorAll('.bookmark-entry').forEach(entry => {
      entry.addEventListener('click', (e) => {
        if (!e.target.closest('.entry-delete')) {
          this.navigate(entry.dataset.url);
          this.closeAllPanels();
        }
      });
    });
    
    list.querySelectorAll('.entry-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const entry = btn.closest('.bookmark-entry');
        entry.style.animation = 'tabSlideOut 0.2s ease-out forwards';
        
        setTimeout(async () => {
          this.bookmarks = await window.electronAPI.removeBookmark(id);
          this.renderBookmarksList();
          this.renderBookmarksBar();
          this.showToast('Lesezeichen entfernt', 'success');
        }, 200);
      });
    });
  }

  // ================================================
  // History
  // ================================================

  async addToHistory(url, title) {
    if (!url || url === 'about:blank') return;
    this.history = await window.electronAPI.addHistory({ url, title: title || url });
  }

  async clearHistory() {
    this.history = await window.electronAPI.clearHistory();
    this.renderHistoryList();
    this.showToast('Verlauf gelöscht', 'success');
  }

  renderHistoryList() {
    const list = document.getElementById('historyList');
    
    if (this.history.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history"></i>
          <p>Kein Verlauf vorhanden</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = this.history.slice(0, 50).map((entry, index) => `
      <div class="history-entry" data-url="${entry.url}" style="animation-delay: ${index * 0.03}s">
        <i class="fas fa-globe"></i>
        <div class="entry-info">
          <div class="entry-title">${entry.title}</div>
          <div class="entry-url">${entry.url}</div>
        </div>
        <span class="entry-time">${this.formatTime(entry.visitedAt)}</span>
      </div>
    `).join('');
    
    list.querySelectorAll('.history-entry').forEach(entry => {
      entry.addEventListener('click', () => {
        this.navigate(entry.dataset.url);
        this.closeAllPanels();
      });
    });
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Gerade eben';
    if (diff < 3600000) return `vor ${Math.floor(diff / 60000)} Min`;
    if (diff < 86400000) return `vor ${Math.floor(diff / 3600000)} Std`;
    return date.toLocaleDateString('de-DE');
  }

  // ================================================
  // Downloads
  // ================================================

  renderDownloadsList() {
    const list = document.getElementById('downloadsList');
    const downloads = this.downloads || [];

    if (downloads.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-download"></i>
          <p>Keine Downloads vorhanden</p>
        </div>
      `;
      return;
    }

    list.innerHTML = downloads.map((download, index) => `
      <div class="download-entry" data-path="${download.path || ''}" style="animation-delay: ${index * 0.03}s">
        <div class="download-icon">
          <i class="fas ${this.getFileIcon(download.filename)}"></i>
        </div>
        <div class="entry-info">
          <div class="entry-title">${download.filename}</div>
          <div class="entry-url">${this.formatFileSize(download.totalBytes)}</div>
          ${download.state === 'progressing' ? `
            <div class="download-progress">
              <div class="download-progress-bar" style="width: ${(download.receivedBytes / download.totalBytes * 100) || 0}%"></div>
            </div>
          ` : ''}
        </div>
        <span class="download-state ${download.state}">
          ${download.state === 'completed' ? '<i class="fas fa-check"></i>' :
            download.state === 'progressing' ? '<i class="fas fa-spinner fa-spin"></i>' :
            '<i class="fas fa-times"></i>'}
        </span>
      </div>
    `).join('');

    // Click to open file
    list.querySelectorAll('.download-entry').forEach(entry => {
      entry.addEventListener('click', () => {
        const path = entry.dataset.path;
        if (path) {
          window.electronAPI.openPath(path);
        }
      });
    });
  }

  getFileIcon(filename) {
    if (!filename) return 'fa-file';
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: 'fa-file-pdf',
      doc: 'fa-file-word', docx: 'fa-file-word',
      xls: 'fa-file-excel', xlsx: 'fa-file-excel',
      ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint',
      zip: 'fa-file-archive', rar: 'fa-file-archive', '7z': 'fa-file-archive',
      jpg: 'fa-file-image', jpeg: 'fa-file-image', png: 'fa-file-image', gif: 'fa-file-image', svg: 'fa-file-image',
      mp3: 'fa-file-audio', wav: 'fa-file-audio', flac: 'fa-file-audio',
      mp4: 'fa-file-video', avi: 'fa-file-video', mkv: 'fa-file-video', mov: 'fa-file-video',
      js: 'fa-file-code', ts: 'fa-file-code', html: 'fa-file-code', css: 'fa-file-code', py: 'fa-file-code',
      txt: 'fa-file-alt', md: 'fa-file-alt',
      exe: 'fa-file-export', msi: 'fa-file-export'
    };
    return iconMap[ext] || 'fa-file';
  }

  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  async openDownloadsFolder() {
    await window.electronAPI.openDownloadsFolder();
  }

  clearDownloadsList() {
    this.downloads = [];
    this.renderDownloadsList();
    this.showToast('Download-Liste geleert', 'success');
  }

  // ================================================
  // Settings
  // ================================================

  async updateSettings(updates) {
    this.settings = await window.electronAPI.updateSettings(updates);
  }

  applySettings() {
    // Apply theme
    this.applyTheme(this.settings.theme);
    
    // Apply transparency
    this.applyTransparency(this.settings.transparency || 0.85);
    
    // Apply accent color
    if (this.settings.accentHue !== undefined) {
      this.applyAccentColor(this.settings.accentHue);
      document.querySelectorAll('.color-preset').forEach(p => {
        p.classList.toggle('active', parseInt(p.dataset.hue) === this.settings.accentHue);
      });
    }
    
    // Apply blur
    if (this.settings.blur !== undefined) {
      this.applyBlur(this.settings.blur);
      const blurRange = document.getElementById('blurRange');
      if (blurRange) blurRange.value = this.settings.blur;
    }
    
    // Apply tab radius
    if (this.settings.tabRadius !== undefined) {
      this.applyTabRadius(this.settings.tabRadius);
      document.querySelectorAll('.shape-option').forEach(o => {
        o.classList.toggle('active', parseInt(o.dataset.radius) === this.settings.tabRadius);
      });
    }

    // Apply UI shape
    if (this.settings.uiShape) {
      this.applyUiShape(this.settings.uiShape);
      document.querySelectorAll('.ui-shape-option').forEach(o => {
        o.classList.toggle('active', o.dataset.shape === this.settings.uiShape);
      });
    }
    
    // Update settings UI
    document.getElementById('homepageInput').value = this.settings.homepage || '';
    document.getElementById('searchEngineSelect').value = this.settings.searchEngine || 'google';
    document.getElementById('themeSelect').value = this.settings.theme || 'dark';
    document.getElementById('transparencyRange').value = this.settings.transparency || 0.85;
  }

  applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
    
    // Smooth theme transition
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }

  applyTransparency(value) {
    const theme = document.body.getAttribute('data-theme');
    if (theme === 'light') {
      document.documentElement.style.setProperty('--bg-primary', `rgba(245, 245, 250, ${value})`);
    } else {
      document.documentElement.style.setProperty('--bg-primary', `rgba(15, 15, 25, ${value})`);
    }
  }

  // ================================================
  // User Profile
  // ================================================

  showUserProfile() {
    document.getElementById('authContainer').classList.add('hidden');
    const profile = document.getElementById('userProfile');
    profile.classList.remove('hidden');
    profile.style.animation = 'sectionFadeIn 0.4s ease-out';
    document.getElementById('profileName').textContent = this.user.name || 'Benutzer';
    document.getElementById('profileEmail').textContent = this.user.email;
    document.getElementById('userBtn').classList.add('logged-in');

    // Load profile image if saved
    if (this.settings.profileImage) {
      this.updateProfileAvatar(this.settings.profileImage);
    }
  }

  updateProfileAvatar(imageData) {
    const icon = document.getElementById('profileAvatarIcon');
    const img = document.getElementById('profileAvatarImg');

    if (imageData) {
      icon.style.display = 'none';
      img.src = imageData;
      img.style.display = 'block';
    } else {
      icon.style.display = 'block';
      img.style.display = 'none';
      img.src = '';
    }
  }

  hideUserProfile() {
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('userProfile').classList.add('hidden');
    document.getElementById('userBtn').classList.remove('logged-in');
    
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
  }

  // ================================================
  // Panels
  // ================================================

  togglePanel(panelId) {
    const sidebar = document.getElementById('sidebar');
    const panel = document.getElementById(panelId);
    const isOpen = panel.classList.contains('active');
    
    // Close all panels
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    
    if (isOpen) {
      sidebar.classList.remove('open');
    } else {
      sidebar.classList.add('open');
      panel.classList.add('active');
      
      // Load content
      if (panelId === 'bookmarksPanel') this.renderBookmarksList();
      if (panelId === 'historyPanel') this.renderHistoryList();
      if (panelId === 'downloadsPanel') this.renderDownloadsList();
    }
    
    // Update nav button states
    document.querySelectorAll('.nav-tools .nav-btn').forEach(btn => btn.classList.remove('active'));
    if (!isOpen) {
      const btnId = {
        bookmarksPanel: 'bookmarksBtn',
        historyPanel: 'historyBtn',
        downloadsPanel: 'downloadsBtn',
        settingsPanel: 'settingsBtn',
        userPanel: 'userBtn'
      }[panelId];
      document.getElementById(btnId)?.classList.add('active');
    }
  }

  closeAllPanels() {
    document.getElementById('sidebar').classList.remove('open');
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tools .nav-btn').forEach(btn => btn.classList.remove('active'));
  }

  // ================================================
  // Context Menu
  // ================================================

  showContextMenu(x, y, items) {
    const menu = document.getElementById('contextMenu');
    menu.innerHTML = items.map(item => {
      if (item.divider) return '<div class="context-menu-divider"></div>';
      return `
        <div class="context-menu-item" data-action="${item.action}">
          <i class="${item.icon}"></i>
          ${item.label}
        </div>
      `;
    }).join('');
    
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('visible');
    
    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        this.handleContextAction(item.dataset.action);
        this.hideContextMenu();
      });
    });
  }

  hideContextMenu() {
    document.getElementById('contextMenu').classList.remove('visible');
  }

  handleContextAction(action) {
    // Handle context menu actions
  }

  // ================================================
  // Toast Notifications with Animation
  // ================================================

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
      <i class="fas ${icons[type]} toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    });
    
    container.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // ================================================
  // Extended Settings
  // ================================================

  setupExtendedSettingsListeners() {
    // Font select
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        this.applyFont(e.target.value);
        this.updateSettings({ font: e.target.value });
      });
    }

    // Font size
    const fontSizeRange = document.getElementById('fontSizeRange');
    if (fontSizeRange) {
      fontSizeRange.addEventListener('input', (e) => {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        this.applyFontSize(e.target.value);
      });
      fontSizeRange.addEventListener('change', (e) => {
        this.updateSettings({ fontSize: parseInt(e.target.value) });
      });
    }

    // Compact mode
    const compactCheck = document.getElementById('compactModeCheck');
    if (compactCheck) {
      compactCheck.addEventListener('change', (e) => {
        this.applyCompactMode(e.target.checked);
        this.updateSettings({ compactMode: e.target.checked });
      });
    }

    // Animation speed
    const animSpeedSelect = document.getElementById('animationSpeedSelect');
    if (animSpeedSelect) {
      animSpeedSelect.addEventListener('change', (e) => {
        this.applyAnimationSpeed(e.target.value);
        this.updateSettings({ animationSpeed: e.target.value });
      });
    }

    // Glow effects
    const glowCheck = document.getElementById('glowEffectsCheck');
    if (glowCheck) {
      glowCheck.addEventListener('change', (e) => {
        this.applyGlowEffects(e.target.checked);
        this.updateSettings({ glowEffects: e.target.checked });
      });
    }

    // Hover animations
    const hoverCheck = document.getElementById('hoverAnimationsCheck');
    if (hoverCheck) {
      hoverCheck.addEventListener('change', (e) => {
        this.applyHoverAnimations(e.target.checked);
        this.updateSettings({ hoverAnimations: e.target.checked });
      });
    }

    // Background style
    document.querySelectorAll('.bg-style-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.bg-style-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        const style = option.dataset.style;
        this.applyBackgroundStyle(style);
        this.updateSettings({ bgStyle: style });

        // Show/hide custom bg settings
        const customBgSetting = document.getElementById('customBgSetting');
        if (customBgSetting) {
          customBgSetting.style.display = style === 'custom' ? 'block' : 'none';
        }
      });
    });

    // Custom background upload
    document.getElementById('uploadBgBtn').addEventListener('click', () => {
      document.getElementById('customBgInput').click();
    });

    document.getElementById('customBgInput').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          this.showToast('Bild ist zu groß (max. 10MB)', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          const imageData = event.target.result;
          await this.updateSettings({ customBgImage: imageData });
          this.applyCustomBackground(imageData);
          document.getElementById('removeBgBtn').style.display = 'block';
          this.showToast('Hintergrundbild aktualisiert', 'success');
        };
        reader.readAsDataURL(file);
      }
    });

    document.getElementById('removeBgBtn').addEventListener('click', async () => {
      await this.updateSettings({ customBgImage: null });
      this.removeCustomBackground();
      document.getElementById('removeBgBtn').style.display = 'none';
      this.showToast('Hintergrundbild entfernt', 'success');
    });

    // Background opacity
    const bgOpacityRange = document.getElementById('bgOpacityRange');
    if (bgOpacityRange) {
      bgOpacityRange.addEventListener('input', (e) => {
        document.getElementById('bgOpacityValue').textContent = e.target.value + '%';
        this.applyBgOpacity(e.target.value);
      });
      bgOpacityRange.addEventListener('change', (e) => {
        this.updateSettings({ bgOpacity: parseInt(e.target.value) });
      });
    }

    // Animated background
    const animBgCheck = document.getElementById('animatedBgCheck');
    if (animBgCheck) {
      animBgCheck.addEventListener('change', (e) => {
        this.applyAnimatedBg(e.target.checked);
        this.updateSettings({ animatedBg: e.target.checked });
      });
    }

    // Tab preview (future feature placeholder)
    const tabPreviewCheck = document.getElementById('tabPreviewCheck');
    if (tabPreviewCheck) {
      tabPreviewCheck.addEventListener('change', (e) => {
        this.updateSettings({ tabPreview: e.target.checked });
      });
    }

    // Confirm close
    const confirmCloseCheck = document.getElementById('confirmCloseCheck');
    if (confirmCloseCheck) {
      confirmCloseCheck.addEventListener('change', (e) => {
        this.updateSettings({ confirmClose: e.target.checked });
      });
    }

    // Tab width
    const tabWidthRange = document.getElementById('tabWidthRange');
    if (tabWidthRange) {
      tabWidthRange.addEventListener('input', (e) => {
        document.getElementById('tabWidthValue').textContent = e.target.value + 'px';
        this.applyTabWidth(e.target.value);
      });
      tabWidthRange.addEventListener('change', (e) => {
        this.updateSettings({ tabWidth: parseInt(e.target.value) });
      });
    }

    // Bookmarks bar visibility
    const showBookmarksCheck = document.getElementById('showBookmarksBarCheck');
    if (showBookmarksCheck) {
      showBookmarksCheck.addEventListener('change', (e) => {
        this.applyBookmarksBarVisibility(e.target.checked);
        this.updateSettings({ showBookmarksBar: e.target.checked });
      });
    }

    // URL bar style
    const urlBarStyleSelect = document.getElementById('urlBarStyleSelect');
    if (urlBarStyleSelect) {
      urlBarStyleSelect.addEventListener('change', (e) => {
        this.applyUrlBarStyle(e.target.value);
        this.updateSettings({ urlBarStyle: e.target.value });
      });
    }
  }

  applyExtendedSettings() {
    const s = this.settings;

    // Font
    if (s.font) {
      this.applyFont(s.font);
      const fontSelect = document.getElementById('fontSelect');
      if (fontSelect) fontSelect.value = s.font;
    }

    // Font size
    if (s.fontSize) {
      this.applyFontSize(s.fontSize);
      const fontSizeRange = document.getElementById('fontSizeRange');
      if (fontSizeRange) fontSizeRange.value = s.fontSize;
      const fontSizeValue = document.getElementById('fontSizeValue');
      if (fontSizeValue) fontSizeValue.textContent = s.fontSize + 'px';
    }

    // Compact mode
    if (s.compactMode !== undefined) {
      this.applyCompactMode(s.compactMode);
      const compactCheck = document.getElementById('compactModeCheck');
      if (compactCheck) compactCheck.checked = s.compactMode;
    }

    // Animation speed
    if (s.animationSpeed) {
      this.applyAnimationSpeed(s.animationSpeed);
      const animSpeedSelect = document.getElementById('animationSpeedSelect');
      if (animSpeedSelect) animSpeedSelect.value = s.animationSpeed;
    }

    // Glow effects
    if (s.glowEffects !== undefined) {
      this.applyGlowEffects(s.glowEffects);
      const glowCheck = document.getElementById('glowEffectsCheck');
      if (glowCheck) glowCheck.checked = s.glowEffects;
    }

    // Hover animations
    if (s.hoverAnimations !== undefined) {
      this.applyHoverAnimations(s.hoverAnimations);
      const hoverCheck = document.getElementById('hoverAnimationsCheck');
      if (hoverCheck) hoverCheck.checked = s.hoverAnimations;
    }

    // Background style
    if (s.bgStyle) {
      this.applyBackgroundStyle(s.bgStyle);
      document.querySelectorAll('.bg-style-option').forEach(o => {
        o.classList.toggle('active', o.dataset.style === s.bgStyle);
      });

      // Show/hide custom bg settings
      const customBgSetting = document.getElementById('customBgSetting');
      if (customBgSetting) {
        customBgSetting.style.display = s.bgStyle === 'custom' ? 'block' : 'none';
      }
    }

    // Custom background image
    if (s.customBgImage) {
      this.applyCustomBackground(s.customBgImage);
      const removeBgBtn = document.getElementById('removeBgBtn');
      if (removeBgBtn) removeBgBtn.style.display = 'block';
    }

    // Background opacity
    if (s.bgOpacity !== undefined) {
      this.applyBgOpacity(s.bgOpacity);
      const bgOpacityRange = document.getElementById('bgOpacityRange');
      if (bgOpacityRange) bgOpacityRange.value = s.bgOpacity;
      const bgOpacityValue = document.getElementById('bgOpacityValue');
      if (bgOpacityValue) bgOpacityValue.textContent = s.bgOpacity + '%';
    }

    // Animated background
    if (s.animatedBg !== undefined) {
      this.applyAnimatedBg(s.animatedBg);
      const animBgCheck = document.getElementById('animatedBgCheck');
      if (animBgCheck) animBgCheck.checked = s.animatedBg;
    }

    // Tab width
    if (s.tabWidth) {
      this.applyTabWidth(s.tabWidth);
      const tabWidthRange = document.getElementById('tabWidthRange');
      if (tabWidthRange) tabWidthRange.value = s.tabWidth;
      const tabWidthValue = document.getElementById('tabWidthValue');
      if (tabWidthValue) tabWidthValue.textContent = s.tabWidth + 'px';
    }

    // Bookmarks bar
    if (s.showBookmarksBar !== undefined) {
      this.applyBookmarksBarVisibility(s.showBookmarksBar);
      const showBookmarksCheck = document.getElementById('showBookmarksBarCheck');
      if (showBookmarksCheck) showBookmarksCheck.checked = s.showBookmarksBar;
    }

    // URL bar style
    if (s.urlBarStyle) {
      this.applyUrlBarStyle(s.urlBarStyle);
      const urlBarStyleSelect = document.getElementById('urlBarStyleSelect');
      if (urlBarStyleSelect) urlBarStyleSelect.value = s.urlBarStyle;
    }

    // Checkboxes for other settings
    const tabPreviewCheck = document.getElementById('tabPreviewCheck');
    if (tabPreviewCheck) tabPreviewCheck.checked = s.tabPreview || false;

    const confirmCloseCheck = document.getElementById('confirmCloseCheck');
    if (confirmCloseCheck) confirmCloseCheck.checked = s.confirmClose || false;
  }

  applyFont(font) {
    const body = document.body;
    body.classList.remove('font-inter', 'font-roboto', 'font-poppins', 'font-fira', 'font-ubuntu');
    if (font && font !== 'system') {
      body.classList.add('font-' + font);
    }
  }

  applyFontSize(size) {
    document.documentElement.style.setProperty('font-size', size + 'px');
  }

  applyCompactMode(enabled) {
    document.body.classList.toggle('compact-mode', enabled);
  }

  applyAnimationSpeed(speed) {
    const body = document.body;
    body.classList.remove('animation-slow', 'animation-fast', 'animation-off');
    if (speed !== 'normal') {
      body.classList.add('animation-' + speed);
    }
  }

  applyGlowEffects(enabled) {
    document.body.classList.toggle('no-glow', !enabled);
  }

  applyHoverAnimations(enabled) {
    document.body.classList.toggle('no-hover-animations', !enabled);
  }

  applyBackgroundStyle(style) {
    const bgEffects = document.getElementById('bgEffects');
    const startPage = document.getElementById('startPage');
    if (!bgEffects) return;

    bgEffects.className = 'background-effects';
    bgEffects.innerHTML = '';

    // Remove custom background if switching to another style
    if (style !== 'custom') {
      startPage.classList.remove('custom-bg');
      startPage.style.backgroundImage = '';
    }

    if (style === 'particles') {
      bgEffects.classList.add('particles');
      this.createParticles(bgEffects);
    } else if (style === 'waves') {
      bgEffects.classList.add('waves');
    } else if (style === 'mesh') {
      bgEffects.classList.add('mesh');
    } else if (style === 'custom' && this.settings.customBgImage) {
      this.applyCustomBackground(this.settings.customBgImage);
    }
  }

  applyCustomBackground(imageData) {
    const startPage = document.getElementById('startPage');
    if (startPage && imageData) {
      startPage.classList.add('custom-bg');
      startPage.style.backgroundImage = `url(${imageData})`;
    }
  }

  removeCustomBackground() {
    const startPage = document.getElementById('startPage');
    if (startPage) {
      startPage.classList.remove('custom-bg');
      startPage.style.backgroundImage = '';
    }
  }

  applyBgOpacity(value) {
    const startPage = document.getElementById('startPage');
    const bgEffects = document.getElementById('bgEffects');
    const opacity = value / 100;

    if (bgEffects) {
      bgEffects.style.opacity = opacity;
    }

    // For custom backgrounds, adjust the overlay
    if (startPage && startPage.classList.contains('custom-bg')) {
      startPage.style.setProperty('--bg-overlay-opacity', 1 - opacity);
    }
  }

  createParticles(container) {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (10 + Math.random() * 20) + 's';
      particle.style.width = (2 + Math.random() * 4) + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  }

  applyAnimatedBg(enabled) {
    const bgEffects = document.getElementById('bgEffects');
    if (bgEffects) {
      bgEffects.style.animationPlayState = enabled ? 'running' : 'paused';
      bgEffects.querySelectorAll('*').forEach(el => {
        el.style.animationPlayState = enabled ? 'running' : 'paused';
      });
    }
  }

  applyTabWidth(width) {
    document.documentElement.style.setProperty('--tab-max-width', width + 'px');
    document.querySelectorAll('.tab').forEach(tab => {
      tab.style.maxWidth = width + 'px';
    });
  }

  applyBookmarksBarVisibility(visible) {
    const bar = document.querySelector('.bookmarks-bar');
    if (bar) {
      bar.style.display = visible ? 'flex' : 'none';
    }
  }

  applyUrlBarStyle(style) {
    const nav = document.querySelector('.nav-bar');
    if (!nav) return;
    nav.classList.remove('url-style-pill', 'url-style-square', 'url-style-rounded');
    if (style && style !== 'rounded') {
      nav.classList.add('url-style-' + style);
    }
  }

  initBackgroundEffect() {
    const style = this.settings.bgStyle || 'gradient';
    this.applyBackgroundStyle(style);
  }

  // ================================================
  // Tab Preview
  // ================================================

  setupTabPreview() {
    let hoverTimeout;
    const tooltip = document.getElementById('tabPreviewTooltip');

    document.getElementById('tabsContainer').addEventListener('mouseover', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab || !this.settings.tabPreview) return;

      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.showTabPreview(tab);
      }, 500);
    });

    document.getElementById('tabsContainer').addEventListener('mouseout', (e) => {
      clearTimeout(hoverTimeout);
      const relatedTarget = e.relatedTarget;
      if (!relatedTarget || !relatedTarget.closest('.tab')) {
        this.hideTabPreview();
      }
    });

    // Hide on click
    document.getElementById('tabsContainer').addEventListener('click', () => {
      clearTimeout(hoverTimeout);
      this.hideTabPreview();
    });
  }

  async showTabPreview(tabEl) {
    const tabId = tabEl.id;
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    const tooltip = document.getElementById('tabPreviewTooltip');
    const previewImage = document.getElementById('previewImage');
    const previewPlaceholder = tooltip.querySelector('.preview-placeholder');
    const previewTitle = document.getElementById('previewTitle');
    const previewUrl = document.getElementById('previewUrl');

    previewTitle.textContent = tab.title || 'Neuer Tab';
    previewUrl.textContent = tab.url || 'about:blank';

    // Try to capture screenshot from webview
    const webview = document.getElementById(`webview-${tabId}`);
    if (webview && tab.url) {
      try {
        const image = await webview.capturePage();
        if (image && !image.isEmpty()) {
          const dataUrl = image.toDataURL();
          previewImage.src = dataUrl;
          previewImage.style.display = 'block';
          previewPlaceholder.style.display = 'none';
        } else {
          previewImage.style.display = 'none';
          previewPlaceholder.style.display = 'block';
        }
      } catch (e) {
        previewImage.style.display = 'none';
        previewPlaceholder.style.display = 'block';
      }
    } else {
      previewImage.style.display = 'none';
      previewPlaceholder.style.display = 'block';
    }

    // Position tooltip below tab
    const tabRect = tabEl.getBoundingClientRect();
    let left = tabRect.left;
    let top = tabRect.bottom + 8;

    // Keep tooltip within viewport
    const tooltipWidth = 320;
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 16;
    }
    if (left < 16) left = 16;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
  }

  hideTabPreview() {
    const tooltip = document.getElementById('tabPreviewTooltip');
    tooltip.classList.remove('visible');
  }

  // ================================================
  // Keyboard Shortcuts
  // ================================================

  handleKeyboard(e) {
    // Ctrl/Cmd + T: New tab
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      this.createNewTab();
    }
    
    // Ctrl/Cmd + W: Close tab
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
      e.preventDefault();
      this.closeTab(this.activeTabId);
    }
    
    // Ctrl/Cmd + L: Focus URL bar
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      document.getElementById('urlInput').focus();
    }
    
    // Ctrl/Cmd + R: Refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      this.refresh();
    }
    
    // Ctrl/Cmd + D: Bookmark
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      this.toggleBookmark();
    }
    
    // Ctrl/Cmd + Shift + B: Toggle bookmarks panel
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
      e.preventDefault();
      this.togglePanel('bookmarksPanel');
    }
    
    // Ctrl/Cmd + H: Toggle history panel
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      this.togglePanel('historyPanel');
    }
    
    // Escape: Close panels
    if (e.key === 'Escape') {
      this.closeAllPanels();
    }
    
    // Alt + Left: Back
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      this.goBack();
    }
    
    // Alt + Right: Forward
    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      this.goForward();
    }
    
    // Ctrl/Cmd + Tab: Next tab
    if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
      e.preventDefault();
      const currentIndex = this.tabs.findIndex(t => t.id === this.activeTabId);
      const nextIndex = (currentIndex + 1) % this.tabs.length;
      this.setActiveTab(this.tabs[nextIndex].id);
    }
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  window.browser = new GlassBrowser();
});
