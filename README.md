# 🌐 GlassBrowser
A modern, sleek browser with stunning glassmorphism design. Beautiful, fast, and functional!

**Version: 1.0.0**

---

## ✨ Features

### 🎨 Glassmorphism Design
- **Transparent UI** with blur effects
- **Modern aesthetic** inspired by iOS/macOS
- **Smooth animations** throughout the interface
- **Dark theme** that's easy on the eyes

### 📑 Tab System
- **Multiple tabs** - Open as many sites as you need
- **Tab management** - Click to switch, X to close
- **New tab button** - Quick access with +
- **Active tab highlighting** - Always know where you are

### ⭐ Bookmarks Bar
- **Quick access** to your favorite sites
- **Add bookmarks** with one click
- **Remove bookmarks** easily
- **Persistent storage** - Bookmarks survive restarts

### 🔍 Smart Address Bar
- **Direct URLs** - Type any website address
- **Google Search** - Type anything else to search
- **Clean design** - Minimalist and functional

### 🧭 Navigation
- ⬅️ **Back** - Go to previous page
- ➡️ **Forward** - Go to next page
- 🔄 **Reload** - Refresh current page
- 🏠 **Home** - Return to start page

### ⚙️ Settings
- **Custom homepage** - Set your preferred start page
- **Search engine selection** - Choose your favorite
- **Bookmarks bar toggle** - Show/hide as needed
- **Persistent preferences** - Settings are saved automatically

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New Tab |
| `Ctrl+W` | Close Tab |
| `Ctrl+L` | Focus Address Bar |
| `Ctrl+R` | Reload Page |
| `Ctrl+D` | Add/Remove Bookmark |
| `Ctrl+Shift+B` | Bookmarks Panel |
| `Ctrl+H` | History Panel |
| `Alt+Left` | Go Back |
| `Alt+Right` | Go Forward |
| `Escape` | Close Panels |

---

## 🎯 How It Works

### Architecture
```
GlassBrowser
├── Electron Framework (Chromium-based)
├── Glassmorphism CSS Design
├── Multi-tab Webview System
└── Persistent Storage (electron-store)
```

### Tech Stack
| Component | Technology |
|-----------|------------|
| Framework | Electron 28 |
| Rendering | Chromium |
| Storage | electron-store |
| Styling | Custom CSS with backdrop-filter |
| IDs | UUID v4 |

---

## 🚀 Installation

### Option 1: Installer (Recommended)
1. Download `GlassBrowser Setup 1.0.0.exe`
2. Run the installer
3. Choose installation directory
4. ✅ Done! Launch from Start Menu or Desktop

### Option 2: Portable Version
1. Download `GlassBrowser-Portable-1.0.0.exe`
2. Run directly - no installation needed!
3. ✅ Done! Perfect for USB drives

### Option 3: Build from Source
```bash
# Clone the repository
git clone https://github.com/TheCoderr28/Project-Glass.git

# Navigate to directory
cd GlassBrowser

# Install dependencies
npm install

# Run in development mode
npm start

# Build executable
npm run build:win
```

---

## 📊 Usage

### Opening Websites
1. Click on the address bar
2. Type a URL (e.g., `google.com`) or search term
3. Press Enter

### Managing Tabs
| Action | How |
|--------|-----|
| New Tab | Click the `+` button |
| Switch Tab | Click on the tab |
| Close Tab | Click the `×` on the tab |

### Adding Bookmarks
1. Navigate to a website
2. Click the ⭐ button in the address bar
3. Bookmark appears in the bookmarks bar

### Settings
1. Click the ⚙️ gear icon
2. Adjust your preferences:
   - Homepage URL
   - Search engine
   - Show/hide bookmarks bar
3. Click Save

---

## 🎨 Design Philosophy

### Glassmorphism Elements
- **Frosted glass effect** using `backdrop-filter: blur()`
- **Subtle transparency** for depth
- **Soft shadows** for elevation
- **Border highlights** for definition

### Color Palette
| Element | Color |
|---------|-------|
| Background | Semi-transparent dark |
| Accents | Vibrant purple/blue |
| Text | Clean white |
| Borders | Subtle white opacity |

---

## 🔧 Technology

- **Electron** - Cross-platform desktop apps with web tech
- **Chromium** - Modern, fast web rendering engine
- **electron-store** - Simple persistent storage
- **CSS Backdrop Filter** - Native blur effects
- **Webview Tag** - Secure embedded browsing

---

## 📁 Project Structure

```
GlassBrowser/
├── src/
│   ├── main/
│   │   ├── main.js          # Electron main process
│   │   └── preload.js       # Preload script for IPC
│   └── renderer/
│       ├── index.html       # Main window HTML
│       ├── scripts/
│       │   └── app.js       # Browser logic
│       └── styles/
│           └── main.css     # Glassmorphism styles
├── package.json             # Dependencies & build config
└── README.md               # This file
```

---

## 🆕 Changelog

### v1.0.0 (Initial Release)
- 🎉 Initial release
- 🎨 Glassmorphism UI design
- 📑 Multi-tab browsing
- ⭐ Bookmarks system
- 🔍 Integrated search
- 🧭 Full navigation controls
- ⚙️ Settings panel
- 💾 Persistent storage
- ⌨️ Keyboard shortcuts

---

## 💻 System Requirements

| Requirement | Minimum |
|-------------|---------|
| OS | Windows 10/11 (64-bit) |
| RAM | 4 GB |
| Storage | 200 MB |
| Display | 1280x720 |

---

## 📄 License

**MIT License** - Free for personal and commercial use.

---

## 🤝 Contribute

Issues and pull requests are welcome!

- 🐛 Found a bug? Open an issue!
- 💡 Have a feature idea? Let's discuss!
- 🔧 Want to contribute? Fork and submit a PR!

---

## 🔗 Links

- **GitHub**: <a href="https://github.com/TheCoderr28/Project-Glass" target="_blank">github.com/TheCoderr28/Project-Glass</a>
- **Releases**: <a href="https://github.com/TheCoderr28/Project-Glass/releases" target="_blank">Download Latest</a>
- **Developer**: <a href="https://x.com/seperate_acc" target="_blank">@Seperate_Acc</a>

---

Made with ❤️ and lots of `backdrop-filter: blur()`
