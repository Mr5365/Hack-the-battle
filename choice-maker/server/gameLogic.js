let games = {};

function createGame(hostId) {
  const gameId = Math.random().toString(36).substring(2, 7);
  games[gameId] = {
    host: hostId,
    players: [hostId],
    voting: false,
    eliminated: [],
  };
  return gameId;
}

function joinGame(gameId, playerId) {
  if (games[gameId] && games[gameId].players.length < 10) {
    games[gameId].players.push(playerId);
  }
}

function startVote(gameId) {
  const game = games[gameId];
  if (game && !game.voting) {
    game.voting = true;
  }
}

function eliminatePlayer(gameId, playerId) {
  const game = games[gameId];
  if (game && game.voting) {
    const index = game.players.indexOf(playerId);
    if (index !== -1) {
      game.players.splice(index, 1);
      game.eliminated.push(playerId);
      game.voting = false;
      return playerId;
    }
  }
  return null;
}

function getGameState(gameId) {
  const game = games[gameId];
  if (game) {
    return {
      players: game.players,
      eliminated: game.eliminated,
      voting: game.voting,
    };
  }
  return null;
}

module.exports = { createGame, joinGame, startVote, eliminatePlayer, getGameState };