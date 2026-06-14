# 📻 Radio Programme Planner

A web application for planning and organizing radio programmes. Built with Vue 3, Tailwind CSS, and a Node.js + Express backend, it allows users to define show structure, manage durations, assign contributors, and export data to XML or Excel formats.

---

## ✨ Features

- 🎙️ Define programme structure with entries (jingles, moderation, songs)
- ⏱️ Input durations using mm:ss format
- 🧠 Auto-calculates start times based on entry order
- 📝 Add moderation text for spoken segments
- 📦 Save and load programme data as XML
- 📊 Export programme plan as Excel
- 🔃 Drag-and-drop entries to rearrange

---

## 🛠 Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **File I/O**: XML parsing & writing with `xml2js`
- **Excel Export**: `xlsx` package
- **Drag & Drop**: `vuedraggable` (Sortable.js)
---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Build the frontend

```bash
npm run build
```
This outputs production-ready frontend files in /dist. Diese Dateien müssen auf den Server kopiert werden.

Or if you want to run the development server:

```bash
npm run dev
```

### 3. Start the backend

```bash
node server.js
```
Backend will serve the frontend and expose API routes on http://localhost:3000

Auf dem Server läuft die Anwendung unter https://radioli.blaton.ch/api.

Falls sich ein File ändert des Servers (server.js, routes/*.js), muss der Server neu gestartet werden.

```bash
sudo -u nodejs pm2 restart radioli
# oder
sudo -u nodejs pm2 start /var/www/html/radioli/server.js --name radioli
```

Bei Unklarheiten kann man den Server auch direkt starten und sieht dann die Fehlermeldungen in der Konsole:

```bash
sudo -u nodejs node /var/www/html/radioli/server.js
```