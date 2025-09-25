// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { Chess } = require('chess.js');
const { nanoid } = require('nanoid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const games = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('createGame', () => {
        const gameId = nanoid(5);
        games[gameId] = {
            players: {},
            chess: new Chess(),
            gameId: gameId,
        };
        games[gameId].players[socket.id] = 'w';
        socket.join(gameId);
        console.log(`Game created with ID: ${gameId} by ${socket.id}`);
        socket.emit('gameCreated', { gameId, color: 'w' });
    });

    socket.on('joinGame', (gameId) => {
        if (!games[gameId]) {
            return socket.emit('error', 'Game not found.');
        }
        const game = games[gameId];
        const playersCount = Object.keys(game.players).length;
        if (playersCount >= 2) {
            return socket.emit('error', 'Game is full.');
        }
        game.players[socket.id] = 'b';
        socket.join(gameId);
        console.log(`${socket.id} joined game ${gameId}`);
        io.to(gameId).emit('gameStart', {
            fen: game.chess.fen(),
            players: game.players
        });
    });

    socket.on('move', (data) => {
        const { gameId, move } = data;
        const game = games[gameId];
        if (!game) {
            return socket.emit('error', 'Game not found.');
        }
        try {
            const playerColor = game.players[socket.id];
            if (game.chess.turn() !== playerColor) {
                throw new Error("Not your turn!");
            }
            const result = game.chess.move(move);
            if (result === null) {
                throw new Error("Invalid move");
            }
            io.to(gameId).emit('boardUpdate', game.chess.fen());
            if (game.chess.isGameOver()) {
                let winner = game.chess.turn() === 'w' ? 'Black' : 'White';
                if (game.chess.isCheckmate()) {
                    io.to(gameId).emit('gameOver', `${winner} wins by checkmate!`);
                } else if (game.chess.isDraw()) {
                    io.to(gameId).emit('gameOver', `The game is a draw.`);
                }
            }
        } catch (err) {
            console.error(`Invalid move attempt in ${gameId}: ${err.message}`);
            socket.emit('invalidMove', { message: err.message });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});