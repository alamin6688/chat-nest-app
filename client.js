const socket = io(); // Connects & knocks on the door to the server.

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('newClient', (data) => {
    console.log('Message to all clients: A new socket has joined', data);
    // socket.emit('message', `Welcome to the chat ${data}`);
});



const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value.trim()) {
            socket.emit('message', input.value.trim());
            input.value = '';
            input.focus();
        }
    });
}

// Listen for messages broadcast by the server
socket.on('message', (msg) => {
    if (messagesContainer) {
        const isMe = msg.senderId === socket.id;

        // Wrapper for alignment
        const wrapper = document.createElement('div');
        wrapper.className = `flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'} animate-bubble`;

        // Bubble
        const item = document.createElement('div');
        const textStr = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text);

        item.textContent = textStr;

        // Different colors and shapes for Me vs Others
        if (isMe) {
            item.className = 'bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-md text-sm transition-all hover:scale-[1.02] cursor-default';
        } else {
            item.className = 'bg-white text-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-md text-sm border border-gray-100 transition-all hover:scale-[1.02] cursor-default';
        }

        wrapper.appendChild(item);
        messagesContainer.appendChild(wrapper);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});