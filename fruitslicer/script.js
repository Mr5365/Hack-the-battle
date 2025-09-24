let score = 0;
let lives = 3;
let playing = false;
let fruitElement = document.getElementById('fruit');
let scoreElement = document.getElementById('score');
let livesElement = document.getElementById('lives');
let gameOverElement = document.getElementById('game-over');
let startResetButton = document.getElementById('start-reset');
let homeButton = document.getElementById('home-btn'); // Added this line
let gameArea = document.getElementById('game-area');

startResetButton.addEventListener('click', function() {
  if (playing) {
    location.reload();
  } else {
    playing = true;
    score = 0;
    lives = 3;
    scoreElement.textContent = 'Score: ' + score;
    livesElement.textContent = 'Lives: ' + lives;
    gameOverElement.style.display = 'none';
    startResetButton.textContent = 'Reset Game';
    startFruitFall();
  }
});

homeButton.addEventListener('click', function() {
    window.location.href = '../page3.html'; // Redirect to your home page
});

function startFruitFall() {
  let fruit = document.createElement('div');
  fruit.classList.add('fruit');
  fruit.style.width = '50px';
  fruit.style.height = '50px';
  fruit.style.backgroundColor = 'red';
  fruit.style.borderRadius = '50%';
  fruit.style.position = 'absolute';
  fruit.style.top = '-60px';
  fruit.style.left = Math.random() * (gameArea.offsetWidth - 50) + 'px';
  gameArea.appendChild(fruit);

  let fallSpeed = 2; // Slower falling speed
  let fallInterval = setInterval(function() {
    if (parseInt(fruit.style.top) > gameArea.offsetHeight) {
      clearInterval(fallInterval);
      gameArea.removeChild(fruit);
      if (playing) {
        lives--;
        livesElement.textContent = 'Lives: ' + lives;
        if (lives === 0) {
          gameOver();
        }
      }
    } else {
      fruit.style.top = parseInt(fruit.style.top) + fallSpeed + 'px';
      fallSpeed += 0.01; // Gradually increase speed
    }
  }, 20);

  fruit.addEventListener('click', function() {
    clearInterval(fallInterval);
    gameArea.removeChild(fruit);
    if (playing) {
      score++;
      scoreElement.textContent = 'Score: ' + score;
    }
  });

  if (playing) {
    setTimeout(startFruitFall, Math.random() * 2000 + 1000);
  }
}

function gameOver() {
  playing = false;
  gameOverElement.style.display = 'block';
  startResetButton.textContent = 'Start Game';
}