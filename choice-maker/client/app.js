const socket = io();
const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameIdInput = document.getElementById('gameIdInput');
const startVoteBtn = document.getElementById('startVoteBtn');
const playersList = document.getElementById('playersList');
const voteList = document.getElementById('voteList');
const voteSection = document.getElementById('vote');

createGameBtn.addEventListener('click', () => {
  socket.emit('createGame');
});

joinGameBtn.addEventListener('click', () => {
  const gameId = gameIdInput.value;
  socket.emit('joinGame', gameId);
});

startVoteBtn.addEventListener('click', () => {
  const gameId = gameIdInput.value;
  socket.emit('startVote', gameId);
});

// --- CORRECTIONS BELOW ---

socket.on('gameCreated', (gameId) => {
  // CORRECTED: Used backticks (`) for the template literal.
  // ADDED: Automatically populate the input field with the new game ID for convenience.
  alert(`Game created! Game ID: ${gameId}`);
  gameIdInput.value = gameId; 
});

socket.on('gameState', (state) => {
  playersList.innerHTML = '';
  state.players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player;
    playersList.appendChild(li);
  });

  if (state.voting) {
    voteSection.style.display = 'block';
    voteList.innerHTML = '';
    state.players.forEach(player => {
      if (!state.eliminated.includes(player)) {
        const li = document.createElement('li');
        li.textContent = player;
        li.addEventListener('click', () => {
          socket.emit('vote', gameIdInput.value, player);
        });
        voteList.appendChild(li);
      }
    });
  } else {
    voteSection.style.display = 'none';
  }
});

socket.on('voteStarted', () => {
  alert('Voting has started!');
});

socket.on('playerEliminated', (playerId) => {
  // CORRECTED: Used backticks (`) for the template literal.
  alert(`${playerId} has been eliminated!`);
});