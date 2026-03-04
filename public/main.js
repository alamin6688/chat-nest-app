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

// ── Announce ourselves on connect ─────────────────────────────────────────────
socket.emit('join', nameInput.value.trim() || 'Anonymous')

// ── Re-announce when user changes their name ──────────────────────────────────
nameInput.addEventListener('change', () => {
    const name = nameInput.value.trim() || 'Anonymous'
    socket.emit('name-change', name)
})

// ── Send message on form submit ───────────────────────────────────────────────
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

    clearTimeout(typingTimeout)
    socket.emit('stop-typing')

    messageInput.value = ''
    messageInput.focus()
}

// ── Typing indicator ──────────────────────────────────────────────────────────
messageInput.addEventListener('input', () => {
    if (messageInput.value.trim()) {
        socket.emit('typing', nameInput.value.trim() || 'Anonymous')
        clearTimeout(typingTimeout)
        typingTimeout = setTimeout(() => socket.emit('stop-typing'), 2000)
    } else {
        clearTimeout(typingTimeout)
        socket.emit('stop-typing')
    }
})

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

// ── Join / Leave notifications ─────────────────────────────────────────────────
socket.on('user-joined', (name) => {
    addSystemMessage(`👋 ${name} joined the chat`)
})

socket.on('user-left', (name) => {
    addSystemMessage(`👋 ${name} left the chat`)
})

function addSystemMessage(text) {
    removeWelcomePlaceholder()
    const li = document.createElement('li')
    li.className = 'system-msg'
    li.innerHTML = `<span>${text}</span>`
    messageContainer.appendChild(li)
    scrollToBottom()
}

// ── Receive broadcast messages from server ────────────────────────────────────
socket.on('chat-message', (data) => {
    // data = { id, name, text, senderId, dateTime }
    const isMe = data.senderId === socket.id
    addMessageToUI(isMe, data)

    // If it's someone else's message, tell the server we received/read it
    if (!isMe) {
        socket.emit('message-read', { msgId: data.id, senderId: data.senderId })
    }
})

// ── Read receipts: update tick when server confirms ───────────────────────────
socket.on('message-read', (msgId) => {
    const li = messageContainer.querySelector(`[data-msg-id="${msgId}"]`)
    if (!li) return
    const receipt = li.querySelector('.receipt')
    if (receipt) {
        receipt.textContent = '✓✓'
        receipt.classList.add('read')
    }
})

// ── Dynamic client count ──────────────────────────────────────────────────────
socket.on('clients-total', (count) => {
    if (!clientsTotal) return
    const pill = clientsTotal.closest('.clients-pill')
    pill.classList.remove('pop')
    void pill.offsetWidth
    clientsTotal.textContent = count
    pill.classList.add('pop')
})

// ── Render a message bubble ───────────────────────────────────────────────────
function addMessageToUI(isOwnMessage, data) {
    removeWelcomePlaceholder()

    const li = document.createElement('li')
    li.className = isOwnMessage ? 'message-right' : 'message-left'

    // Attach message ID so we can find it when receipt arrives
    if (isOwnMessage && data.id) {
        li.dataset.msgId = data.id
    }

    const time = data.dateTime
        ? moment(data.dateTime).format('h:mm A')
        : moment().format('h:mm A')

    // Own messages get a receipt tick (✓ = sent, ✓✓ = read)
    const receiptHtml = isOwnMessage
        ? `<span class="receipt" title="Sent">✓</span>`
        : ''

    li.innerHTML = `
        <p class="message">
            ${data.text}
            <span class="msg-meta">
                ${isOwnMessage ? 'You' : data.name} &bull; ${time}${receiptHtml}
            </span>
        </p>
    `

    messageContainer.appendChild(li)
    scrollToBottom()
}

function removeWelcomePlaceholder() {
    const welcome = messageContainer.querySelector('.welcome-msg')
    if (welcome) welcome.remove()
}

function scrollToBottom() {
    messageContainer.scrollTo({ top: messageContainer.scrollHeight, behavior: 'smooth' })
}