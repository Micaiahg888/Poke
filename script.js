const poke1Select = document.getElementById('pokemon1');
const poke2Select = document.getElementById('pokemon2');
const startBtn = document.getElementById('startBattle');
const stats1Div = document.getElementById('stats1');
const stats2Div = document.getElementById('stats2');
const battleLog = document.getElementById('battleLog');
const battleScreen = document.getElementById('battleScreen');
const moveButtons = document.getElementById('moveButtons');

let poke1 = null;
let poke2 = null;

const pokemonCache = {};

// Capitalize helper
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// Populate dropdowns
fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
  .then(res => res.json())
  .then(data => {
    data.results.forEach(pokemon => {
      const option1 = document.createElement('option');
      option1.value = pokemon.name;
      option1.textContent = capitalize(pokemon.name);
      poke1Select.appendChild(option1);

      const option2 = option1.cloneNode(true);
      poke2Select.appendChild(option2);
    });
  });

// Event listeners
poke1Select.addEventListener('change', () => handleSelect(poke1Select.value, 1));
poke2Select.addEventListener('change', () => handleSelect(poke2Select.value, 2));
startBtn.addEventListener('click', startBattle);

// Load and cache Pokémon
function handleSelect(name, player) {
  if (pokemonCache[name]) {
    assignPokemon(pokemonCache[name], player);
  } else {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then(res => res.json())
      .then(data => {
        const formatted = {
          name: capitalize(data.name),
          sprite: data.sprites.front_default,
          hp: data.stats.find(s => s.stat.name === 'hp').base_stat,
          attack: data.stats.find(s => s.stat.name === 'attack').base_stat,
          defense: data.stats.find(s => s.stat.name === 'defense').base_stat,
          type: data.types[0].type.name,
          moves: data.moves.slice(0, 4).map(m => m.move.name),
        };
        pokemonCache[name] = formatted;
        assignPokemon(formatted, player);
      });
  }
}

// Assign to player
function assignPokemon(data, player) {
  if (player === 1) {
    poke1 = { ...data, currentHp: data.hp };
    stats1Div.innerHTML = showStats(poke1);
  } else {
    poke2 = { ...data, currentHp: data.hp };
    stats2Div.innerHTML = showStats(poke2);
  }

  if (poke1 && poke2) startBtn.disabled = false;
}

// Render stats
function showStats(p) {
  return `
    <img src="${p.sprite}" alt="${p.name}"><br>
    <strong>${p.name}</strong><br>
    Type: ${capitalize(p.type)}<br>
    HP: ${p.hp}<br>
    Attack: ${p.attack}<br>
    Defense: ${p.defense}<br>
    Moves: ${p.moves.map(capitalize).join(', ')}
  `;
}

// Start battle
function startBattle() {
  battleScreen.classList.remove('hidden');
  moveButtons.innerHTML = '';
  battleLog.innerHTML = `<h3>Battle Begins!</h3>`;

  poke1.currentHp = poke1.hp;
  poke2.currentHp = poke2.hp;

  poke1.moves.forEach(move => {
    const btn = document.createElement('button');
    btn.textContent = capitalize(move);
    btn.onclick = () => takeTurn(poke1, poke2, move);
    moveButtons.appendChild(btn);
  });
}

// Take a turn
function takeTurn(attacker, defender, move) {
  const damage = Math.max(5, Math.floor((attacker.attack - defender.defense / 2) + Math.random() * 10));
  defender.currentHp -= damage;

  battleLog.innerHTML += `<p>${attacker.name} used ${capitalize(move)}! It dealt ${damage} damage.</p>`;

  if (defender.currentHp <= 0) {
    battleLog.innerHTML += `<h3>${attacker.name} wins!</h3>`;
    moveButtons.innerHTML = '';
  } else {
    setTimeout(() => {
      const counterMove = defender.moves[Math.floor(Math.random() * defender.moves.length)];
      takeTurn(defender, attacker, counterMove);
    }, 1000);
  }
}
