const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');
const gameWonDisplay = document.getElementById('game-won');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');
const homeBtn = document.getElementById('homeBtn'); // Get a reference to the new button

// Game variables
let isGameOver = false;
let isGameWon = false;
let isPaused = false;
let score = 0;
const WINNING_SCORE = 50;
let obstacles = [];
let gameSpeed = 3;
let frame = 0;
let obstacleTimer = 0;
let nextObstacleTime = 0;

// Player properties
const player = {
    x: 50,
    y: 100,
    width: 20,
    height: 30,
    color: '#535353',
    velocityY: 0,
    isJumping: false
};

// Player movement
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !player.isJumping && !isGameOver && !isPaused && !isGameWon) {
        player.isJumping = true;
        player.velocityY = -10;
    }
});

// Obstacle properties
class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#535353';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= gameSpeed;
    }
}

// Function to draw the ground line
function drawGround() {
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 130);
    ctx.lineTo(canvas.width, 130);
    ctx.stroke();
}

// Function to generate a random time for the next obstacle
function getNextObstacleTime() {
    return Math.random() * (1200 - 600) + 600;
}

// Function to generate an obstacle group
function generateObstacleGroup() {
    const obstacleCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 obstacles
    const initialX = canvas.width;
    const initialWidth = 15;
    const initialHeight = 40;

    for (let i = 0; i < obstacleCount; i++) {
        // Space out obstacles within a group
        const xPos = initialX + i * (initialWidth + 10);
        obstacles.push(new Obstacle(xPos, 130 - initialHeight, initialWidth, initialHeight));
    }
}

// Draw the player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Main game loop
function gameLoop() {
    if (isGameOver || isGameWon || isPaused) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    
    // Increase game speed every 10 points
    if (score % 10 === 0 && score > 0) {
        gameSpeed += 0.005;
    }

    // Update player
    if (player.isJumping) {
        player.y += player.velocityY;
        player.velocityY += 0.5;
        if (player.y >= 100) {
            player.y = 100;
            player.isJumping = false;
            player.velocityY = 0;
        }
    }
    
    // Manage obstacle generation
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 250) {
        generateObstacleGroup();
    }
    
    // Update and draw obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        obstacle.draw();

        // Remove off-screen obstacles and update score
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 1;
            scoreDisplay.textContent = score;
        }

        // Collision detection
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            isGameOver = true;
            gameOverDisplay.style.display = 'block';
        }
    });

    // Check win condition
    if (score >= WINNING_SCORE) {
        isGameWon = true;
        gameWonDisplay.style.display = 'block';
    }

    drawGround();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

// Event listeners for control buttons
restartBtn.addEventListener('click', () => {
    isGameOver = false;
    isGameWon = false;
    isPaused = false;
    score = 0;
    gameSpeed = 3;
    frame = 0;
    obstacles = [];
    player.y = 100;
    player.isJumping = false;
    player.velocityY = 0;
    scoreDisplay.textContent = score;
    gameOverDisplay.style.display = 'none';
    gameWonDisplay.style.display = 'none';
    pauseBtn.textContent = 'Pause';
    gameLoop();
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
        pauseBtn.textContent = 'Resume';
    } else {
        pauseBtn.textContent = 'Pause';
        gameLoop(); // Resume the loop
    }
});

homeBtn.addEventListener('click', () => {
    window.location.href = '../page3.html'; // Redirects to your game selection page
});

gameLoop(); // Initial call to start the game