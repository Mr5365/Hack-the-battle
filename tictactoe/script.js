const cells = Array.from(document.querySelectorAll('.cell'));
const turnIndicator = document.getElementById('turn-indicator');
const resultDiv = document.getElementById('result');
const startBtn = document.getElementById('start-btn');
const levelSelect = document.getElementById('level');
const homeBtn = document.getElementById('home-btn'); // New: get the home button

let board = ['', '', '', '', '', '', '', '', ''];
let human = 'X';
let ai = 'O';
let currentPlayer = human;
let gameActive = false;
let difficulty = 'medium'; 

const winningCombinations = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

// Start / Restart
startBtn.addEventListener('click', () => {
    difficulty = levelSelect.value;
    resetGame();
    gameActive = true;
    turnIndicator.textContent = `Your turn (${human})`;
});

// New: Home Button
homeBtn.addEventListener('click', () => {
    window.location.href = '../page3.html'; // Redirect to your home page
});

// Cell click handler
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const idx = +cell.getAttribute('data-index');
        if (!gameActive || board[idx] !== '') return;
        makeMove(idx, human);
        if (gameActive) {
            turnIndicator.textContent = "Computer thinking...";
            setTimeout(() => {
                aiMove();
            }, 300);
        }
    });
});

// Make a move (for either human or AI)
function makeMove(idx, player) {
    board[idx] = player;
    cells[idx].textContent = player;
    cells[idx].classList.add('disabled');
    if (checkWin(board, player)) {
        endGame(player);
        return;
    }
    if (checkDraw(board)) {
        endGame(null);
        return;
    }
    currentPlayer = (player === human) ? ai : human;
    if (currentPlayer === human) {
        turnIndicator.textContent = `Your turn (${human})`;
    }
}

// AI Move
function aiMove() {
    let moveIdx;
    if (difficulty === 'easy') {
        moveIdx = getRandomMove();
    } else if (difficulty === 'medium') {
        if (Math.random() < 0.5) moveIdx = getRandomMove();
        else moveIdx = minimaxMove(board, ai).index;
    } else {
        moveIdx = minimaxMove(board, ai).index;
    }
    makeMove(moveIdx, ai);
}

// Get list of empty cells
function emptyIndices(b) {
    return b.map((v,i) => v === '' ? i : null).filter(i => i !== null);
}

// Random move
function getRandomMove() {
    const empties = emptyIndices(board);
    return empties[Math.floor(Math.random()*empties.length)];
}

// Check win - Now accepts a board as an argument
function checkWin(currentBoard, player) {
    return winningCombinations.some(comb => {
        return comb.every(idx => currentBoard[idx] === player);
    });
}

// Check draw - Now accepts a board as an argument
function checkDraw(currentBoard) {
    return currentBoard.every(cell => cell !== '');
}

// End game
function endGame(winner) {
    gameActive = false;
    if (winner) {
        resultDiv.textContent = (winner === human) ? "You win!" : "Computer wins!";
    } else {
        resultDiv.textContent = "It's a draw!";
    }
    resultDiv.classList.remove('hide');
}

// Reset
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(c => {
        c.textContent = '';
        c.classList.remove('disabled');
    });
    resultDiv.classList.add('hide');
    currentPlayer = human;
}

// Minimax Algorithm
function minimaxMove(newBoard, player) {
    let avail = emptyIndices(newBoard);
    if (checkWin(newBoard, human)) {
        return { score: -10 };
    } else if (checkWin(newBoard, ai)) {
        return { score: +10 };
    } else if (checkDraw(newBoard)) {
        return { score: 0 };
    }
    let moves = [];
    for (let i = 0; i < avail.length; i++) {
        const idx = avail[i];
        let move = {};
        move.index = idx;
        newBoard[idx] = player;
        if (player === ai) {
            let result = minimaxMove(newBoard, human);
            move.score = result.score;
        } else {
            let result = minimaxMove(newBoard, ai);
            move.score = result.score;
        }
        newBoard[idx] = '';
        moves.push(move);
    }
    let bestMove;
    if (player === ai) {
        let bestScore = -Infinity;
        moves.forEach(m => {
            if (m.score > bestScore) {
                bestScore = m.score;
                bestMove = m;
            }
        });
    } else {
        let bestScore = +Infinity;
        moves.forEach(m => {
            if (m.score < bestScore) {
                bestScore = m.score;
                bestMove = m;
            }
        });
    }
    return bestMove;
}