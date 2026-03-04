# ChatNest 💬

A real-time chat application built with **Node.js**, **Express**, and **Socket.IO**. ChatNest delivers instant messaging with a modern, polished UI featuring a light blue-violet glassmorphism design.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ Real-time messaging | Instant bi-directional communication via WebSockets |
| ✍️ Typing indicator | Animated bouncing dots show when someone is typing |
| ✓✓ Read receipts | `✓` when sent, `✓✓` when another user receives your message |
| 👋 Join / Leave notifications | System messages appear when users enter or leave the chat |
| 👥 Online user count | Live pill counter in the header updates on every connect/disconnect |
| 🎨 Modern UI | Light blue-violet glassmorphism theme with smooth animations |
| 🕒 Formatted timestamps | Messages show exact time in `h:mm A` format (e.g. `2:45 PM`) |
| 📛 Custom display name | Set your name before chatting; server tracks it per session |

---

## 🛠️ Tech Stack

**Backend**
- [Node.js](https://nodejs.org/) — runtime
- [Express 5](https://expressjs.com/) — HTTP server & static file serving
- [Socket.IO 4](https://socket.io/) — WebSocket abstraction

**Frontend**
- Vanilla HTML, CSS, JavaScript (no framework)
- [Socket.IO client](https://socket.io/docs/v4/client-api/) — auto-served by the server
- [Moment.js](https://momentjs.com/) — timestamp formatting
- [Inter font](https://fonts.google.com/specimen/Inter) via Google Fonts
- [Font Awesome 6](https://fontawesome.com/) for icons

**Dev tooling**
- [nodemon](https://nodemon.io/) — auto-restart on file changes

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/alamin6688/chat-nest-app.git
cd chat-nest-app

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open your browser and go to:

```
http://localhost:4000
```

> Open multiple tabs or browser windows to simulate multiple users chatting in real time.

---

## 📁 Project Structure

```
ChatNest/
├── app.js              # Express + Socket.IO server
├── package.json
├── public/             # Static files served to the browser
│   ├── index.html      # App shell & markup
│   ├── main.js         # Client-side Socket.IO logic
│   └── style.css       # All styles (glassmorphism theme)
└── client.js           # (Legacy / unused – safe to ignore)
```

---

## ⚙️ How It Works

### Server → Client events

| Event | Payload | Description |
|---|---|---|
| `chat-message` | `{ id, name, text, senderId, dateTime }` | Broadcasts a new chat message to all clients |
| `clients-total` | `number` | Current count of connected sockets |
| `user-joined` | `string` (name) | Notifies others when a user joins |
| `user-left` | `string` (name) | Notifies others when a user disconnects |
| `typing` | `{ id, name }` | Relays typing state to all other clients |
| `stop-typing` | `string` (socketId) | Clears typing state for a specific client |
| `message-read` | `string` (msgId) | Notifies the original sender their message was read |

### Client → Server events

| Event | Payload | Description |
|---|---|---|
| `join` | `string` (name) | Announces the user's display name on connect |
| `name-change` | `string` (name) | Updates server-side name when user edits the field |
| `message` | `{ name, message }` | Sends a new chat message |
| `typing` | `string` (name) | Signals the user is actively typing |
| `stop-typing` | — | Signals the user stopped typing |
| `message-read` | `{ msgId, senderId }` | Tells the server to notify the sender of a read receipt |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (auto-restart on changes) |
| `npm start` | Start server with plain node (production) |

---

## 🔮 Potential Extensions

- 💬 **Chat rooms / channels** — `socket.join(room)` namespaces
- 🔒 **Authentication** — JWT or sessions with named accounts
- 🗄️ **Persistent history** — MongoDB or SQLite message storage
- 🖼️ **Image sharing** — File uploads with `multer`
- 🔔 **Push notifications** — Web Push API for background alerts
- 🌙 **Dark mode toggle** — CSS custom property swap
- 👥 **User list sidebar** — Show all online users with avatar initials

---

## 📄 License

ISC © [Alamin](https://github.com/alamin6688)
