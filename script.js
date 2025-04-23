let pokemon1 = {};
let pokemon2 = {};
let moves1 = [];
let moves2 = [];

async function fetchPokemonNames() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100');
  const data = await response.json();
  const pokemonNames = data.results;

  const select1 = document.getElementById('pokemon1');
  const select2 = document.getElementById('pokemon2');
  
  pokemonNames.forEach(pokemon => {
    const option1 = document.createElement('option');
    const option2 = document.createElement('option');
    option1.value = pokemon.name;
    option2.value = pokemon.name;
    option1.innerText = pokemon.name;
    option2.innerText = pokemon.name;
    select1.appendChild(option1);
    select2.appendChild(option2);
  });
}

async function getPokemonData(pokemonNumber) {
  const pokemonName = pokemonNumber === 1 ? document.getElementById('pokemon1').value : document.getElementById('pokemon2').value;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  const data = await response.json();
  
  if (pokemonNumber === 1) {
    pokemon1 = data;
    moves1 = data.moves;
  } else {
    pokemon2 = data;
    moves2 = data.moves;
  }

  displayPokemonStats(pokemonNumber);
}

function displayPokemonStats(pokemonNumber) {
  const pokemon = pokemonNumber === 1 ? pokemon1 : pokemon2;
  const log = document.getElementById('battleLog');
  const pokemonName = pokemonNumber === 1 ? 'Pokémon 1' : 'Pokémon 2';

  log.innerHTML += `<b>${pokemonName}:</b> ${pokemon.name.toUpperCase()} | HP: ${pokemon.stats[0].base_stat} | Attack: ${pokemon.stats[1].base_stat} | Defense: ${pokemon.stats[2].base_stat} <br>`;
}

function startBattle() {
  const battleLog = document.getElementById('battleLog');
  battleLog.innerHTML += "<br><b>Battle Begins!</b><br>";

  let turn = 1;
  let hp1 = pokemon1.stats[0].base_stat;
  let hp2 = pokemon2.stats[0].base_stat;

  while (hp1 > 0 && hp2 > 0) {
    battleLog.innerHTML += `<b>Turn ${turn}:</b><br>`;

    if (turn % 2 !== 0) {
      const move = getRandomMove(moves1);
      battleLog.innerHTML += `${pokemon1.name.toUpperCase()} used ${move.move.name}.<br>`;
      hp2 -= calculateDamage(pokemon1, move);
      battleLog.innerHTML += `HP left for ${pokemon2.name.toUpperCase()}: ${hp2}<br><br>`;
    } else {
      const move = getRandomMove(moves2);
      battleLog.innerHTML += `${pokemon2.name.toUpperCase()} used ${move.move.name}.<br>`;
      hp1 -= calculateDamage(pokemon2, move);
      battleLog.innerHTML += `HP left for ${pokemon1.name.toUpperCase()}: ${hp1}<br><br>`;
    }

    turn++;
  }

  if (hp1 <= 0) {
    battleLog.innerHTML += `<b>${pokemon2.name.toUpperCase()} wins!</b><br>`;
    document.getElementById('battleResult').innerHTML = `${pokemon2.name.toUpperCase()} wins!`;
  } else {
    battleLog.innerHTML += `<b>${pokemon1.name.toUpperCase()} wins!</b><br>`;
    document.getElementById('battleResult').innerHTML = `${pokemon1.name.toUpperCase()} wins!`;
  }
}

function getRandomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

function calculateDamage(pokemon, move) {
  const baseDamage = pokemon.stats[1].base_stat / 2;
  const movePower = move.move.name.length * 5;
  return Math.floor(baseDamage + movePower);
}

fetchPokemonNames();
