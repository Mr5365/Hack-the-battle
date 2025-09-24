const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const messageEl = document.getElementById('message');

// Game state variables
let score = 0;
let highScore = 0;
let isPlaying = false;
let knifeThrown = false;
let knives = [];
let targetStabbed = [];

// Game objects
const knife = {
    width: 15,
    height: 80,
    speedY: 10,
    color: '#bdc3c7',
};

const target = {
    x: canvas.width / 2,
    y: 200,
    radius: 120,
    angle: 0,
    speed: 0.02,
    color: '#34495e',
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
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

// Function to draw the knife
function drawKnife(k) {
    ctx.save();
    ctx.translate(k.x, k.y);
    ctx.rotate(k.rotation);
    drawRect(-k.width / 2, -k.height / 2, k.width, k.height, k.color);
    ctx.restore();
}

// Function to draw the target
function drawTarget() {
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.rotate(target.angle);
    drawCircle(0, 0, target.radius, target.color);
    ctx.restore();
}

// Function to draw knives stuck in the target
function drawStabbedKnives() {
    targetStabbed.forEach(k => {
        ctx.save();
        ctx.translate(target.x, target.y);
        ctx.rotate(k.rotation);
        drawRect(-k.width / 2, -k.height / 2, k.width, k.height, k.color);
        ctx.restore();
    });
}

// Function to update the game
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isPlaying) {
        // Spin the target
        target.angle += target.speed;

        // Update knives in the air
        for (let i = 0; i < knives.length; i++) {
            knives[i].y -= knives[i].speedY;

            // Collision detection with the target
            const distance = Math.sqrt(
                Math.pow(knives[i].x - target.x, 2) + Math.pow(knives[i].y - target.y, 2)
            );

            if (distance < target.radius && !knives[i].isStabbed) {
                let isHitAnotherKnife = false;
                for (const stabbedKnife of targetStabbed) {
                    const angleBetween = Math.abs(knives[i].rotation - stabbedKnife.rotation);
                    if (angleBetween < Math.PI / 15 || angleBetween > 2 * Math.PI - Math.PI / 15) {
                        isHitAnotherKnife = true;
                        break;
                    }
                }

                if (isHitAnotherKnife) {
                    gameOver();
                    return;
                } else {
                    knives[i].isStabbed = true;
                    knives[i].rotation = target.angle;
                    targetStabbed.push(knives[i]);
                    knives.splice(i, 1);
                    score++;
                    scoreEl.textContent = score;
                }
            }

            // If a knife goes off screen without hitting
            if (knives[i] && knives[i].y < -knife.height) {
                gameOver();
                return;
            }
        }
    }

    // Draw all elements
    drawTarget();
    drawStabbedKnives();
    knives.forEach(drawKnife);
}

// Function to start or restart the game
function startGame() {
    score = 0;
    scoreEl.textContent = score;
    isPlaying = true;
    knives = [];
    targetStabbed = [];
    messageEl.textContent = '';
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Function to handle game over
function gameOver() {
    isPlaying = false;
    messageEl.textContent = `Game Over! Your score: ${score}. Click to play again.`;
    
    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;
    }
}

// The main game loop
function gameLoop() {
    update();
    if (isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

// Event listener for user input
canvas.addEventListener('click', () => {
    if (!isPlaying) {
        startGame();
    } else {
        if (knives.length < 1) { // Only one knife in the air at a time
            knives.push({
                x: canvas.width / 2,
                y: canvas.height - 50,
                width: knife.width,
                height: knife.height,
                speedY: knife.speedY,
                isStabbed: false,
                rotation: 0
            });
        }
    }
});