const socket = io()

const clientsTotal = document.querySelector('#client-total span')
const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const typingIndicator = document.getElementById('typing-indicator')
const typingText = document.getElementById('typing-text')

// Track who is currently typing: Map<socketId, name>
const typers = new Map()
let typingTimeout

// ── Send message on form submit ──────────────────────────────────────────────
messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    sendMessage()
})

function sendMessage() {
    if (messageInput.value.trim() === '') return

    socket.emit('message', {
        name: nameInput.value.trim() || 'Anonymous',
        message: messageInput.value.trim()
    })

    // Stop typing indicator immediately on send
    clearTimeout(typingTimeout)
    socket.emit('stop-typing')

    messageInput.value = ''
    messageInput.focus()
}

// ── Typing indicator – emit events on input ──────────────────────────────────
messageInput.addEventListener('input', () => {
    if (messageInput.value.trim()) {
        socket.emit('typing', nameInput.value.trim() || 'Anonymous')
        clearTimeout(typingTimeout)
        // Auto-stop after 2s of no input
        typingTimeout = setTimeout(() => {
            socket.emit('stop-typing')
        }, 2000)
    } else {
        clearTimeout(typingTimeout)
        socket.emit('stop-typing')
    }
})

// ── Receive typing events ────────────────────────────────────────────────────
socket.on('typing', ({ id, name }) => {
    typers.set(id, name)
    renderTypingIndicator()
})

socket.on('stop-typing', (id) => {
    typers.delete(id)
    renderTypingIndicator()
})

function renderTypingIndicator() {
    const names = [...typers.values()]
    if (names.length === 0) {
        typingIndicator.classList.remove('visible')
        return
    }

    let label
    if (names.length === 1) label = `${names[0]} is typing`
    else if (names.length === 2) label = `${names[0]} and ${names[1]} are typing`
    else label = `${names[0]} and ${names.length - 1} others are typing`

    typingText.textContent = label
    typingIndicator.classList.add('visible')
    scrollToBottom()
}

// ── Receive broadcast messages from server ───────────────────────────────────
socket.on('chat-message', (data) => {
    // data = { name, text, senderId, dateTime }
    const isMe = data.senderId === socket.id
    addMessageToUI(isMe, data)
})

// ── Dynamic client count with animation ─────────────────────────────────────
socket.on('clients-total', (count) => {
    if (!clientsTotal) return
    const pill = clientsTotal.closest('.clients-pill')
    pill.classList.remove('pop')
    void pill.offsetWidth
    clientsTotal.textContent = count
    pill.classList.add('pop')
})

// ── Render a message bubble ──────────────────────────────────────────────────
function addMessageToUI(isOwnMessage, data) {
    // Remove welcome placeholder on first real message
    const welcome = messageContainer.querySelector('.welcome-msg')
    if (welcome) welcome.remove()

    const li = document.createElement('li')
    li.className = isOwnMessage ? 'message-right' : 'message-left'

    // Format timestamp as "2:45 PM"
    const time = data.dateTime
        ? moment(data.dateTime).format('h:mm A')
        : moment().format('h:mm A')

    li.innerHTML = `
        <p class="message">
            ${data.text}
            <span class="msg-meta">${isOwnMessage ? 'You' : data.name} &bull; ${time}</span>
        </p>
    `

    messageContainer.appendChild(li)
    scrollToBottom()
}

function scrollToBottom() {
    messageContainer.scrollTo({ top: messageContainer.scrollHeight, behavior: 'smooth' })
}