const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const homeBtn = document.getElementById('homeBtn'); // Added this line

const gridSize = 20;
const canvasSize = 400;
const initialSnakeLength = 5;

let snake = [];
let direction = 'RIGHT';
let food = {};
let score = 0;
let gameInterval;
let isPaused = false;

function initGame() {
    snake = [];
    for (let i = initialSnakeLength - 1; i >= 0; i--) {
        snake.push({ x: i, y: 0 });
    }
    direction = 'RIGHT';
    score = 0;
    generateFood();
    updateScore();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
}

function gameLoop() {
    if (isPaused) return;
    moveSnake();
    if (checkCollision()) {
        clearInterval(gameInterval);
        alert('Game Over! Your score: ' + score);
        return;
    }
    if (checkFoodCollision()) {
        score += 10;
        generateFood();
        updateScore();
    }
    drawGame();
}

function moveSnake() {
    const head = { ...snake[0] };
    switch (direction) {
        case 'UP':
            head.y -= 1;
            break;
        case 'DOWN':
            head.y += 1;
            break;
        case 'LEFT':
            head.x -= 1;
            break;
        case 'RIGHT':
            head.x += 1;
            break;
    }
    snake.unshift(head);
    
    // Check if the snake has eaten food before popping the tail
    if (!checkFoodCollision()) {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvasSize / gridSize || head.y < 0 || head.y >= canvasSize / gridSize) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function checkFoodCollision() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        return true;
    }
    return false;
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvasSize / gridSize)),
        y: Math.floor(Math.random() * (canvasSize / gridSize))
    };
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && direction !== 'DOWN') {
        direction = 'UP';
    } else if (e.key === 'ArrowDown' && direction !== 'UP') {
        direction = 'DOWN';
    } else if (e.key === 'ArrowLeft' && direction !== 'RIGHT') {
        direction = 'LEFT';
    } else if (e.key === 'ArrowRight' && direction !== 'LEFT') {
        direction = 'RIGHT';
    }
});

startBtn.addEventListener('click', initGame);
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
});

homeBtn.addEventListener('click', () => { // Added this event listener
    window.location.href = '../page3.html'; 
});

// Initial call to start the game when the page loads
initGame();