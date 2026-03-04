const express = require("express");
const app = express()

app.use(express.static("public"))

const expressServer = app.listen(4000)

const socketIo = require('socket.io')

const io = socketIo(expressServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

io.on('connection', (socket) => {
    console.log(socket.id, 'has joined our server!')

    // Broadcast updated client count to everyone
    io.emit('clients-total', io.engine.clientsCount)

    socket.on('disconnect', () => {
        console.log(socket.id, 'has left the server')
        io.emit('clients-total', io.engine.clientsCount)
    })

    socket.on('message', (data) => {
        // data = { name: string, message: string }
        console.log('message from client', data)
        io.emit('chat-message', {
            name: data.name,
            text: data.message,
            senderId: socket.id
        })
    })
})