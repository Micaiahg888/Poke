document.getElementById('start-battle').addEventListener('click', async () => {
  const pokemon1 = document.getElementById('pokemon1').value;
  const pokemon2 = document.getElementById('pokemon2').value;

  if (!pokemon1 || !pokemon2) {
      alert("Please select both Pokémon.");
      return;
  }

  const battleResult = await battle(pokemon1, pokemon2);
  displayBattleLog(battleResult.battleLog);
  displayWinner(battleResult.winner);
});

const displayBattleLog = (battleLog) => {
  const logList = document.getElementById('log-list');
  logList.innerHTML = '';
  battleLog.forEach(log => {
      const logItem = document.createElement('li');
      logItem.textContent = log;
      logList.appendChild(logItem);
  });
  document.querySelector('.battle-log').style.display = 'block';
};

const displayWinner = (winner) => {
  const winnerDiv = document.getElementById('winner');
  winnerDiv.textContent = `${winner.name} wins!`;
  document.querySelector('.battle-results').style.display = 'block';
};
