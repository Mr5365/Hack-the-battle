// client.js
const socket = io();

const lobbyDiv = document.getElementById('lobby');
const gameContainer = document.getElementById('game-container');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const roomCodeInput = document.getElementById('room-code-input');

const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const playAgainButton = document.getElementById('play-again');
const cells = document.querySelectorAll('.cell');

let mySymbol = '';
let myTurn = false;
let currentRoom = '';

// Lobby Logic
createRoomButton.addEventListener('click', () => {
    socket.emit('createRoom');
});

joinRoomButton.addEventListener('click', () => {
    const roomCode = roomCodeInput.value;
    if (roomCode) {
        socket.emit('joinRoom', roomCode);
    }
});

socket.on('roomCreated', (roomCode) => {
    currentRoom = roomCode;
    lobbyDiv.style.display = 'none';
    gameContainer.style.display = 'block';
    statusDiv.textContent = `Room Code: ${roomCode}. Waiting for opponent...`;
});

// Game Logic
socket.on('gameStart', ({ players, currentPlayer }) => {
    lobbyDiv.style.display = 'none';
    gameContainer.style.display = 'block';

    const me = players.find(p => p.id === socket.id);
    mySymbol = me.symbol;
    
    statusDiv.textContent = `You are Player ${mySymbol}.`;
    updateTurnStatus(currentPlayer);
    boardDiv.style.pointerEvents = 'auto';
    playAgainButton.style.display = 'none';
});

socket.on('updateBoard', ({ board }) => {
    board.forEach((value, index) => {
        cells[index].textContent = value;
        cells[index].className = `cell ${value || ''}`;
    });
});

socket.on('turnChange', (currentPlayer) => {
    updateTurnStatus(currentPlayer);
});

socket.on('gameOver', (winner) => {
    if (winner === 'Tie') {
        statusDiv.textContent = "It's a Tie!";
    } else {
        statusDiv.textContent = `Player ${winner} wins!`;
    }
    boardDiv.style.pointerEvents = 'none';
    playAgainButton.style.display = 'block';
});

socket.on('opponentLeft', () => {
    statusDiv.textContent = 'Your opponent has left the room.';
    boardDiv.style.pointerEvents = 'none';
    playAgainButton.style.display = 'none'; // No one to play again with
});

socket.on('error', (message) => {
    alert(message);
});

function updateTurnStatus(currentPlayer) {
    myTurn = mySymbol === currentPlayer;
    if (myTurn) {
        statusDiv.textContent = 'Your turn!';
    } else {
        statusDiv.textContent = `Waiting for Player ${currentPlayer}...`;
    }
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (myTurn && !cell.textContent) {
            socket.emit('makeMove', { index: cell.dataset.index, roomCode: currentRoom });
        }
    });
});

playAgainButton.addEventListener('click', () => {
    socket.emit('playAgainRequest', currentRoom);
});