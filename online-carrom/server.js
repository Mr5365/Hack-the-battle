// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve the frontend files from the 'public' directory
app.use(express.static('public'));

const rooms = {}; // This will store our game rooms

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Event listener for creating a new room
    socket.on('createRoom', () => {
        let roomCode;
        // Generate a unique 4-digit room code
        do {
            roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        } while (rooms[roomCode]);

        // Create the room object
        rooms[roomCode] = {
            players: {},
            playerCount: 0
        };

        socket.join(roomCode); // The creator joins the room
        rooms[roomCode].players[socket.id] = { playerNum: 1 };
        rooms[roomCode].playerCount = 1;

        // Send the room code back to the creator
        socket.emit('roomCreated', roomCode);
        console.log(`Room ${roomCode} created by ${socket.id}`);
    });

    // Event listener for joining an existing room
    socket.on('joinRoom', (roomCode) => {
        if (!rooms[roomCode]) {
            socket.emit('error', 'Room not found.');
            return;
        }
        if (rooms[roomCode].playerCount >= 2) {
            socket.emit('error', 'Room is full.');
            return;
        }

        socket.join(roomCode);
        rooms[roomCode].players[socket.id] = { playerNum: 2 };
        rooms[roomCode].playerCount++;

        console.log(`${socket.id} joined room ${roomCode}`);
        // Notify both players that the game can start
        io.to(roomCode).emit('startGame', rooms[roomCode].players);
    });

    // Relay game moves to the other player in the room
    socket.on('gameMove', (data) => {
        // socket.rooms is a Set, the first value is the socket.id, the second is the roomCode
        const roomCode = Array.from(socket.rooms)[1];
        if (roomCode) {
            // Broadcast the move to the other player in the room
            socket.to(roomCode).emit('opponentMove', data);
        }
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Find the room the player was in and notify the other player
        for (const roomCode in rooms) {
            if (rooms[roomCode].players[socket.id]) {
                io.to(roomCode).emit('opponentLeft');
                delete rooms[roomCode]; // Simple cleanup: just delete the room
                break;
            }
        }
    });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));