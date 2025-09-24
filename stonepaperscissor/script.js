const buttons = document.querySelectorAll('.choice-btn');
const resultText = document.getElementById('result-text');
const playerScoreSpan = document.getElementById('player-score');
const computerScoreSpan = document.getElementById('computer-score');
const resetBtn = document.getElementById('reset-btn');

let playerScore = 0;
let computerScore = 0;

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const playerChoice = btn.getAttribute('data-choice');
    playRound(playerChoice);
  });
});

resetBtn.addEventListener('click', () => {
  playerScore = 0;
  computerScore = 0;
  updateScores();
  resultText.textContent = "Make your choice";
});

function getComputerChoice() {
  const options = ['stone', 'paper', 'scissors'];
  const idx = Math.floor(Math.random() * options.length);
  return options[idx];
}

function playRound(playerChoice) {
  const computerChoice = getComputerChoice();

  // Decide result
  let result = '';
  if (playerChoice === computerChoice) {
    result = "It's a tie!";
  } else if (
    (playerChoice === 'stone' && computerChoice === 'scissors') ||
    (playerChoice === 'paper' && computerChoice === 'stone') ||
    (playerChoice === 'scissors' && computerChoice === 'paper')
  ) {
    result = 'You win!';
    playerScore++;
  } else {
    result = 'Computer wins!';
    computerScore++;
  }

  // Corrected line: use backticks (`) for template literals
  resultText.textContent = `You chose ${playerChoice}, Computer chose ${computerChoice}. ${result}`;
  updateScores();
}

function updateScores() {
  playerScoreSpan.textContent = playerScore;
  computerScoreSpan.textContent = computerScore;
}