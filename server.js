const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'terms.html'));
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'terms.html')));
app.get('/terms.html', (req, res) => res.sendFile(path.join(__dirname, 'terms.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/chat.html', (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));

let waitingUser = null;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    if (waitingUser) {
        socket.emit('matched');
        waitingUser.emit('matched');

        socket.partner = waitingUser;
        waitingUser.partner = socket;

        waitingUser = null;
    } else {
        waitingUser = socket;
    }

    socket.on('signal', (data) => {
        if (socket.partner) socket.partner.emit('signal', data);
    });

    socket.on('disconnect', () => {
        if (socket.partner) socket.partner.emit('partnerDisconnected');
        if (waitingUser === socket) waitingUser = null;
        console.log('User disconnected:', socket.id);
    });
});

server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
