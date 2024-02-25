const fs = require('fs');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const config = await readConfigFile('botinfo.txt');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A client has connected');

  // Listen for 'toast' event from client
  socket.on('toast', (data) => {
    // Broadcast the received data to all clients
    io.emit('toast', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = config.port || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
