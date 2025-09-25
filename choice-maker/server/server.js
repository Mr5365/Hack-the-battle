const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createGame, joinGame, startVote, eliminatePlayer, getGameState } = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('client'));

let games = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('createGame', () => {
    const gameId = createGame(socket.id);
    socket.emit('gameCreated', gameId);
  });

  socket.on('joinGame', (gameId) => {
    if (games[gameId] && games[gameId].players.length < 10) {
      joinGame(gameId, socket.id);
      io.to(gameId).emit('gameState', getGameState(gameId));
    } else {
      socket.emit('error', 'Game is full or does not exist');
    }
  });

  socket.on('startVote', (gameId) => {
    if (games[gameId]) {
      startVote(gameId);
      io.to(gameId).emit('voteStarted');
    }
  });

  socket.on('vote', (gameId, votedPlayerId) => {
    if (games[gameId]) {
      const eliminated = eliminatePlayer(gameId, votedPlayerId);
      if (eliminated) {
        io.to(gameId).emit('playerEliminated', eliminated);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Handle user disconnection logic
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});