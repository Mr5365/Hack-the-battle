const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve the frontend files
app.use(express.static('public'));

let players = {}; // Stores player data

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Create a new player and add them to the players object
    players[socket.id] = {
        x: Math.floor(Math.random() * 700) + 50,
        y: 500, // Start at the bottom
        width: 50,
        height: 100,
        color: `hsl(${Math.random() * 360}, 100%, 50%)` // Assign a random color
    };

    // Send the new player their ID and the current list of all players
    socket.emit('currentPlayers', players);
    socket.emit('yourId', socket.id);


    // Broadcast the new player to all other players
    socket.broadcast.emit('newPlayer', {
        playerId: socket.id,
        playerInfo: players[socket.id]
    });

    // Listen for player movement
    socket.on('playerMovement', (movementData) => {
        const player = players[socket.id];
        if (player) {
            player.x = movementData.x;
            player.y = movementData.y;
            // Broadcast the movement to all other players
            socket.broadcast.emit('playerMoved', {
                playerId: socket.id,
                playerInfo: player
            });
        }
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove the player from the players object
        delete players[socket.id];
        // Broadcast that a player has disconnected
        io.emit('playerDisconnected', socket.id);
    });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));