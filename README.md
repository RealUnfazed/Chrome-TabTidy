# 🧹 TabTidy - Your Chrome Tab Cleaner

A lightweight Chrome extension that automatically closes or archives tabs you haven't touched in a while.

TabTidy watches Chrome's own record of tab activity and sweeps away anything that's been idle longer than the time you set — no manual tab-hunting required.

This is the Chrome build of TabTidy, built for Chromium-based browsers using the `chrome.*` Extensions API and Chrome's Manifest V3 background model. Looking for the Firefox version instead? See the [Firefox build](https://github.com/RealUnfazed/Firefox-TabTidy).

## ✨ Features

- ⏱️ Set your own idle threshold, from **30 minutes** up to **14 days**
- 🗄️ **Archive mode** saves the link so you can reopen it later, or **Close mode** removes it for good
- 📌 Never sweeps pinned tabs, tabs playing audio, or your own whitelist of sites
- 🌗 Light, dark, or system appearance
- 📋 **Open Tabs** view shows every tab sorted by idle time, with sweep-eligible ones highlighted
- ♻️ **Archive** view lets you reopen or permanently delete anything that's been swept
- 🧹 "Sweep now" for on-demand cleanup instead of waiting for the next check
- 🪶 Lightweight Manifest V3 extension
- 🌐 No external servers or accounts required

## 📸 How It Works

TabTidy checks every open tab against Chrome's own activity record on a repeating timer:

```text
Open Browser Tabs
       │
       ▼
 tab.lastAccessed
       │
       ▼
   Idle Time Check
       │
       ▼
   Sweep Decision
       │
       ▼
  Archive or Close
```

The idle threshold can be set anywhere from:

```text
30 min ─────────────────────────────── 14 days
```

## 🚀 Installation

### Chrome

1. Download or clone this repository.

```bash
git clone https://github.com/RealUnfazed/Chrome-TabTidy.git
```

2. Open Chrome and navigate to:

```text
chrome://extensions
```

3. Enable **Developer mode**.

4. Click **Load unpacked**.

5. Select the project directory.

6. Pin **TabTidy** to your browser toolbar.

7. Click the TabTidy icon.

8. Set your idle threshold and sweep mode.

9. TabTidy is on by default — it checks for idle tabs every 5 minutes in the background.

## 🎛️ Controls

### Enable Toggle

Turns automatic sweeping on or off for the whole extension.

### Sweep Tabs Idle For

Controls how long a tab must sit untouched before it's eligible for sweeping.

```text
30 min = Very aggressive
4 hrs  = Default
1 day  = Relaxed
14 days = Rare cleanup only
```

### Mode

```text
Archive = Save the link, then close the tab
Close   = Remove the tab immediately, no record kept
```

### Never Sweep

Pinned tabs, tabs currently playing audio, and any domains you whitelist are always left alone, regardless of idle time.

## 🧩 Project Structure

```text
tab-cleaner/
│
├── manifest.json
├── background.js
├── shared.js
│
├── popup.html
├── popup.css
├── popup.js
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── LICENSE
└── README.md
```

## 🔐 Permissions

The extension uses the following Chrome permissions:

- `tabs` — reads tab titles, URLs, and idle time, and closes tabs.
- `storage` — stores your settings and archived tabs locally on your device.
- `alarms` — runs the periodic sweep every 5 minutes.

The extension does not require an external server, user account, or cloud service.

## ⚠️ Limitations

Chrome does not allow extensions to read or close certain browser-owned pages, such as `chrome://` pages, `devtools://`, and other internal URLs — these are always left alone.

`tab.lastAccessed` requires **Chrome 121 or newer**; older versions may not report idle time accurately.

The extension is currently focused on Chromium-based browsers with support for the required Manifest V3 APIs.

## 🛠️ Technologies

- JavaScript
- HTML
- CSS
- Chrome Extensions Manifest V3
- Chrome `tabs` API
- Chrome `alarms` API
- Chrome `storage` API

## 👨‍💻 Author

Created and maintained by **RealUnfazed**.

GitHub:
https://github.com/realunfazed

## 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the complete license text.

## ⭐ Support

If you find TabTidy useful, consider giving the repository a ⭐ on GitHub.

Made with ❤️ and 🧹 by **RealUnfazed**.
