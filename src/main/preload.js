const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  addBookmark: (bookmark) => ipcRenderer.invoke('add-bookmark', bookmark),
  removeBookmark: (id) => ipcRenderer.invoke('remove-bookmark', id),
  updateBookmark: (id, data) => ipcRenderer.invoke('update-bookmark', { id, data }),

  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  addHistory: (entry) => ipcRenderer.invoke('add-history', entry),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),

  // User/Auth
  getUser: () => ipcRenderer.invoke('get-user'),
  setUser: (user) => ipcRenderer.invoke('set-user', user),
  logout: () => ipcRenderer.invoke('logout'),
  registerAccount: (data) => ipcRenderer.invoke('register-account', data),
  loginAccount: (data) => ipcRenderer.invoke('login-account', data),
  googleAuth: () => ipcRenderer.invoke('google-auth'),

  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized')
});
