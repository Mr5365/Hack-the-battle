// client.js

const socket = io();

// UI Elements
const lobbyDiv = document.getElementById('lobby');
const gameDiv = document.getElementById('game-container');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const statusP = document.getElementById('status');
const gameStatusP = document.getElementById('game-status');
const canvas = document.getElementById('carrom-board');
const ctx = canvas.getContext('2d');

let myPlayerNum = null;

// --- Lobby Logic ---
createRoomBtn.addEventListener('click', () => {
    socket.emit('createRoom');
});

joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value;
    if (code) {
        socket.emit('joinRoom', code);
    }
});

// --- Socket.IO Event Listeners ---
socket.on('roomCreated', (roomCode) => {
    statusP.textContent = `Room created! Your Team Code is: ${roomCode}. Share it with a friend.`;
    roomCodeInput.value = roomCode;
    myPlayerNum = 1;
});

socket.on('startGame', (players) => {
    lobbyDiv.style.display = 'none';
    gameDiv.style.display = 'block';

    if (!myPlayerNum) {
       myPlayerNum = 2; // If game starts and we don't have a number, we are player 2
    }

    gameStatusP.textContent = `You are Player ${myPlayerNum}. The game has started!`;
    drawBoard(); // Initial drawing of the board
});

socket.on('opponentMove', (moveData) => {
    console.log('Opponent made a move:', moveData);
    gameStatusP.textContent = "Opponent's turn finished. Your turn!";
    // TODO: Update your local game state with the moveData and redraw the board
    // e.g., updateCoinPositions(moveData.newPositions);
    drawBoard();
});

socket.on('opponentLeft', () => {
    gameStatusP.textContent = "Your opponent has left the game.";
});



socket.on('error', (message) => {
    statusP.textContent = `Error: ${message}`;
});

// --- Game Drawing and Logic (Placeholder) ---

function drawBoard() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outer frame
    ctx.strokeStyle = '#654321'; // Darker brown
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw center circle
    ctx.beginPath();
    ctx.arc(300, 300, 50, 0, 2 * Math.PI);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();

    // TODO: Draw all the coins (black, white, queen) and the striker based on game state
    // This is where your main game logic will go.
}

// Example of sending a move
canvas.addEventListener('click', (event) => {
    // This is a placeholder for your actual game move logic
    // For example, calculating striker position and velocity
    const moveData = {
        strikerX: event.offsetX,
        strikerY: event.offsetY,
        velocity: { x: 5, y: -5 }
    };

    // Send the move to the server
    socket.emit('gameMove', moveData);
    gameStatusP.textContent = "You made a move. Waiting for opponent...";
});