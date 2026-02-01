const { app, BrowserWindow, ipcMain, session, Menu, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({
  defaults: {
    bookmarks: [],
    history: [],
    settings: {
      homepage: 'https://www.google.com',
      searchEngine: 'google',
      theme: 'dark',
      transparency: 0.85
    },
    user: null,
    syncEnabled: false
  }
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: true,
    vibrancy: 'ultra-dark',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Blur effect for Windows
  if (process.platform === 'win32') {
    const { execSync } = require('child_process');
    // Windows Acrylic blur will be handled via CSS
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-bookmarks', () => store.get('bookmarks'));
ipcMain.handle('add-bookmark', (event, bookmark) => {
  const bookmarks = store.get('bookmarks');
  bookmarks.push({ ...bookmark, id: Date.now(), createdAt: new Date().toISOString() });
  store.set('bookmarks', bookmarks);
  return bookmarks;
});
ipcMain.handle('remove-bookmark', (event, id) => {
  const bookmarks = store.get('bookmarks').filter(b => b.id !== id);
  store.set('bookmarks', bookmarks);
  return bookmarks;
});
ipcMain.handle('update-bookmark', (event, { id, data }) => {
  const bookmarks = store.get('bookmarks').map(b => b.id === id ? { ...b, ...data } : b);
  store.set('bookmarks', bookmarks);
  return bookmarks;
});

ipcMain.handle('get-history', () => store.get('history'));
ipcMain.handle('add-history', (event, entry) => {
  const history = store.get('history');
  history.unshift({ ...entry, id: Date.now(), visitedAt: new Date().toISOString() });
  // Keep only last 1000 entries
  if (history.length > 1000) history.pop();
  store.set('history', history);
  return history;
});
ipcMain.handle('clear-history', () => {
  store.set('history', []);
  return [];
});

ipcMain.handle('get-settings', () => store.get('settings'));
ipcMain.handle('update-settings', (event, settings) => {
  store.set('settings', { ...store.get('settings'), ...settings });
  return store.get('settings');
});

ipcMain.handle('get-user', () => store.get('user'));
ipcMain.handle('set-user', (event, user) => {
  store.set('user', user);
  return user;
});
ipcMain.handle('logout', () => {
  store.set('user', null);
  store.set('syncEnabled', false);
  return null;
});

ipcMain.handle('window-minimize', () => mainWindow?.minimize());
ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle('window-close', () => mainWindow?.close());
ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized());

// Local account management
const users = new Store({ name: 'users', defaults: { accounts: [] } });

ipcMain.handle('register-account', (event, { email, password, name }) => {
  const accounts = users.get('accounts');
  if (accounts.find(a => a.email === email)) {
    return { success: false, error: 'Email bereits registriert' };
  }
  const newUser = {
    id: Date.now().toString(),
    email,
    password: Buffer.from(password).toString('base64'), // Simple encoding (use bcrypt in production)
    name,
    createdAt: new Date().toISOString()
  };
  accounts.push(newUser);
  users.set('accounts', accounts);
  return { success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } };
});

ipcMain.handle('login-account', (event, { email, password }) => {
  const accounts = users.get('accounts');
  const encoded = Buffer.from(password).toString('base64');
  const user = accounts.find(a => a.email === email && a.password === encoded);
  if (user) {
    const userData = { id: user.id, email: user.email, name: user.name };
    store.set('user', userData);
    return { success: true, user: userData };
  }
  return { success: false, error: 'Ungültige Anmeldedaten' };
});

// Google OAuth (simplified - in production use proper OAuth flow)
ipcMain.handle('google-auth', async () => {
  const authWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual client ID
  const redirectUri = 'http://localhost';
  const scope = 'email profile';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
  
  authWindow.loadURL(authUrl);

  return new Promise((resolve) => {
    authWindow.webContents.on('will-redirect', (event, url) => {
      if (url.startsWith(redirectUri)) {
        const urlParams = new URL(url.replace('#', '?'));
        const accessToken = urlParams.searchParams.get('access_token');
        authWindow.close();
        resolve({ success: true, token: accessToken });
      }
    });

    authWindow.on('closed', () => {
      resolve({ success: false, error: 'Auth cancelled' });
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
