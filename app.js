const express = require("express");
const app = express()

app.use(express.static("public"))

const PORT = process.env.PORT || 4000
const expressServer = app.listen(PORT, () => {
    console.log(`ChatNest Server started on port ${PORT}`)
})

const socketIo = require('socket.io')

const io = socketIo(expressServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

// Track connected users: socketId -> name
const connectedUsers = new Map()

io.on('connection', (socket) => {
    console.log(socket.id, 'has connected')

    io.emit('clients-total', io.engine.clientsCount)

    // ── Client announces their name on join ───────────────────────────────────
    socket.on('join', (name) => {
        const displayName = (name || 'Anonymous').trim()
        connectedUsers.set(socket.id, displayName)
        console.log(`${displayName} (${socket.id}) joined`)
        // Notify everyone else
        socket.broadcast.emit('user-joined', displayName)
    })

    // ── Client updates their display name ─────────────────────────────────────
    socket.on('name-change', (name) => {
        connectedUsers.set(socket.id, (name || 'Anonymous').trim())
    })

    // ── Disconnect: broadcast leave notification ───────────────────────────────
    socket.on('disconnect', () => {
        const name = connectedUsers.get(socket.id) || 'Someone'
        connectedUsers.delete(socket.id)
        console.log(`${name} (${socket.id}) disconnected`)
        socket.broadcast.emit('stop-typing', socket.id)
        socket.broadcast.emit('user-left', name)
        io.emit('clients-total', io.engine.clientsCount)
    })

    // ── Messages ───────────────────────────────────────────────────────────────
    socket.on('message', (data) => {
        const msgId = `${socket.id}-${Date.now()}`
        console.log('message from', connectedUsers.get(socket.id) || socket.id, ':', data.message)
        io.emit('chat-message', {
            id: msgId,
            name: data.name,
            text: data.message,
            senderId: socket.id,
            dateTime: new Date()
        })
    })

    // ── Read receipts: relay to the original sender ────────────────────────────
    socket.on('message-read', ({ msgId, senderId }) => {
        // Tell only the sender their message was read
        io.to(senderId).emit('message-read', msgId)
    })

    // ── Typing indicator ───────────────────────────────────────────────────────
    socket.on('typing', (name) => {
        socket.broadcast.emit('typing', { id: socket.id, name })
    })

    socket.on('stop-typing', () => {
        socket.broadcast.emit('stop-typing', socket.id)
    })
})