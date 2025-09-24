// Get the canvas and its 2D rendering context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get scoreboard and control elements
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const restartBtn = document.getElementById('restartBtn');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 4,
    velocityX: 4,
    velocityY: 4,
    color: 'white'
};

const userPaddle = {
    x: 0,
    y: canvas.height / 2 - 40,
    width: 8,
    height: 80,
    score: 0,
    color: 'white'
};

const computerPaddle = {
    x: canvas.width - 8,
    y: canvas.height / 2 - 40,
    width: 8,
    height: 80,
    score: 0,
    color: 'white'
};

// Function to draw a rectangle
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Function to draw a circle
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// Function to draw the net
function drawNet() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.setLineDash([8, 4]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#7f8c8d';
    ctx.stroke();
    ctx.setLineDash([]); // Reset dashed line
}

// Function to render the game
function render() {
    // Clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, 'black');

    // Draw game objects
    drawNet();
    drawRect(userPaddle.x, userPaddle.y, userPaddle.width, userPaddle.height, userPaddle.color);
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, computerPaddle.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Function to update game logic
function update() {
    // Move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Ball collision with top and bottom walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }

    // Determine which paddle the ball is going towards
    let player = (ball.x < canvas.width / 2) ? userPaddle : computerPaddle;

    // Check for collision with paddles
    if (collision(ball, player)) {
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.2; // Increase ball speed slightly
    }

    // AI for the computer's paddle
    let computerLevel = 0.1;
    computerPaddle.y += ((ball.y - (computerPaddle.y + computerPaddle.height / 2)) * computerLevel);

    // Scoring
    if (ball.x - ball.radius < 0) {
        computerPaddle.score++;
        computerScoreEl.textContent = computerPaddle.score;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        userPaddle.score++;
        playerScoreEl.textContent = userPaddle.score;
        resetBall();
    }
}

// Function to reset the ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 4;
    ball.velocityX = -ball.velocityX;
    ball.velocityY = 4;
}

// Function to reset the entire game
function resetGame() {
    userPaddle.score = 0;
    computerPaddle.score = 0;
    playerScoreEl.textContent = userPaddle.score;
    computerScoreEl.textContent = computerPaddle.score;
    resetBall();
}

// Function to check for collision between ball and paddle
function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return b.right > p.left && b.top < p.bottom && b.left < p.right && b.bottom > p.top;
}

// Event listener for user input (mouse movement)
canvas.addEventListener('mousemove', (evt) => {
    let rect = canvas.getBoundingClientRect();
    userPaddle.y = evt.clientY - rect.top - userPaddle.height / 2;
});

// Event listener for the restart button
restartBtn.addEventListener('click', resetGame);

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();