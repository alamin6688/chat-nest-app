const socket = io()

const clientsTotal = document.getElementById('client-total')
const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

// ── Send message on form submit ──────────────────────────────────────────────
messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    sendMessage()
})

function sendMessage() {
    if (messageInput.value.trim() === '') return

    // Send name + message so server can broadcast both
    socket.emit('message', {
        name: nameInput.value.trim() || 'Anonymous',
        message: messageInput.value.trim()
    })

    messageInput.value = ''
    messageInput.focus()
}

// ── Receive broadcast messages from server ───────────────────────────────────
socket.on('chat-message', (data) => {
    // data = { name, text, senderId }
    const isMe = data.senderId === socket.id
    addMessageToUI(isMe, data)
})

// ── Dynamic client count with animation ─────────────────────────────────────
socket.on('clients-total', (count) => {
    if (!clientsTotal) return
    clientsTotal.classList.remove('pop')
    // Trigger reflow so animation restarts every update
    void clientsTotal.offsetWidth
    clientsTotal.innerText = `Total Clients: ${count}`
    clientsTotal.classList.add('pop')
})

// ── Render a message bubble ──────────────────────────────────────────────────
function addMessageToUI(isOwnMessage, data) {
    const li = document.createElement('li')
    li.className = isOwnMessage ? 'message-right' : 'message-left'

    li.innerHTML = `
        <p class="message">
            ${data.text}
            <span>${isOwnMessage ? 'You' : data.name} ● ${moment(data.dateTime).fromNow()}</span>
        </p>
    `

    messageContainer.appendChild(li)
    scrollToBottom()
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
}