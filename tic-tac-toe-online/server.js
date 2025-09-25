const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static('public'));

const rooms = {};

function checkWinner(board) {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes(null) ? null : 'Tie';
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('createRoom', () => {
        let roomCode;
        do {
            roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        } while (rooms[roomCode]);

        rooms[roomCode] = {
            players: [{ id: socket.id, symbol: 'X' }],
            board: Array(9).fill(null),
            currentPlayer: 'X'
        };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
        console.log(`Room ${roomCode} created by ${socket.id}`);
    });

    socket.on('joinRoom', (roomCode) => {
        const room = rooms[roomCode];
        if (!room) {
            return socket.emit('error', 'Room not found.');
        }
        if (room.players.length >= 2) {
            return socket.emit('error', 'Room is full.');
        }

        room.players.push({ id: socket.id, symbol: 'O' });
        socket.join(roomCode);
        console.log(`${socket.id} joined room ${roomCode}`);

        io.to(roomCode).emit('gameStart', { players: room.players, currentPlayer: room.currentPlayer, roomCode: roomCode });
    });

    socket.on('makeMove', ({ index, roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;
        
        const player = room.players.find(p => p.id === socket.id);
        if (player && player.symbol === room.currentPlayer && room.board[index] === null) {
            room.board[index] = room.currentPlayer;
            const winner = checkWinner(room.board);

            io.to(roomCode).emit('updateBoard', { board: room.board });

            if (winner) {
                io.to(roomCode).emit('gameOver', winner);
            } else {
                room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
                io.to(roomCode).emit('turnChange', room.currentPlayer);
            }
        }
    });

    socket.on('playAgainRequest', (roomCode) => {
        const room = rooms[roomCode];
        if (room) {
            room.board = Array(9).fill(null);
            room.currentPlayer = 'X';
            io.to(roomCode).emit('gameStart', { players: room.players, currentPlayer: room.currentPlayer, roomCode: roomCode });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                io.to(roomCode).emit('opponentLeft');
                delete rooms[roomCode];
                console.log(`Room ${roomCode} has been closed.`);
                break;
            }
        }
    });
});

server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));