// client.js
const socket = io();
let board = null;
let gameId = null;
let playerColor = null;

const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const playerColorDisplay = document.getElementById('playerColor');
const gameStatus = document.getElementById('gameStatus');

createGameBtn.addEventListener('click', () => {
    socket.emit('createGame');
});

joinGameBtn.addEventListener('click', () => {
    gameId = gameCodeInput.value;
    socket.emit('joinGame', gameId);
});

socket.on('gameCreated', (data) => {
    gameId = data.gameId;
    playerColor = data.color;
    gameCodeDisplay.textContent = gameId;
    playerColorDisplay.textContent = playerColor === 'w' ? 'White' : 'Black';
    initBoard();
    alert(`Game created! Your code is ${gameId}. Share it with a friend.`);
});

socket.on('gameStart', (data) => {
    gameStatus.textContent = "Game Started!";
    playerColorDisplay.textContent = socket.id === Object.keys(data.players).find(key => data.players[key] === 'w') ? 'White' : 'Black';
    initBoard();
    board.position(data.fen);
});

socket.on('boardUpdate', (fen) => {
    if (board) {
        board.position(fen);
    }
});

socket.on('invalidMove', (data) => {
    alert(`Invalid Move: ${data.message}`);
});

socket.on('gameOver', (message) => {
    gameStatus.textContent = "Game Over!";
    alert(message);
});

socket.on('error', (message) => {
    alert(`Error: ${message}`);
});

function onDrop(source, target) {
    const move = {
        from: source,
        to: target,
        promotion: 'q'
    };
    socket.emit('move', { gameId, move });
}

function initBoard() {
    const config = {
        draggable: true,
        position: 'start',
        onDrop: onDrop,
        orientation: playerColor === 'w' ? 'white' : 'black',
        // This is the 100% correct URL
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };
    board = Chessboard('myBoard', config);
}