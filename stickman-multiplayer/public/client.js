const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

let players = {};
let myId = '';
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false
};

const playerSpeed = 5;
const jumpHeight = 12;
let yVelocity = 0;
const gravity = 0.5;
const groundY = 500; // Ground level

socket.on('yourId', (id) => {
    myId = id;
});

socket.on('currentPlayers', (serverPlayers) => {
    players = serverPlayers;
});

socket.on('newPlayer', ({ playerId, playerInfo }) => {
    players[playerId] = playerInfo;
});

socket.on('playerDisconnected', (playerId) => {
    delete players[playerId];
});

socket.on('playerMoved', ({ playerId, playerInfo }) => {
    if (players[playerId]) {
        players[playerId] = playerInfo;
    }
});

function drawStickman(player) {
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 5;
    
    // Head
    ctx.beginPath();
    ctx.arc(player.x, player.y - 40, 20, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 20);
    ctx.lineTo(player.x, player.y + 40);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(player.x - 30, player.y);
    ctx.lineTo(player.x + 30, player.y);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + 40);
    ctx.lineTo(player.x - 20, player.y + 80);
    ctx.moveTo(player.x, player.y + 40);
    ctx.lineTo(player.x + 20, player.y + 80);
    ctx.stroke();
}


function update() {
    // Handle local player movement
    const me = players[myId];
    if (me) {
        // Horizontal movement
        if (keys.ArrowLeft) me.x -= playerSpeed;
        if (keys.ArrowRight) me.x += playerSpeed;

        // Jumping and gravity
        me.y += yVelocity;
        if (me.y < groundY) {
            yVelocity += gravity;
        } else {
            yVelocity = 0;
            me.y = groundY;
        }

        // Send updated position to the server
        socket.emit('playerMovement', { x: me.x, y: me.y });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const id in players) {
        const player = players[id];
        drawStickman(player);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Keyboard event listeners
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    // Jumping
    if (e.key === 'ArrowUp' && players[myId] && players[myId].y === groundY) {
        yVelocity = -jumpHeight;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

gameLoop();