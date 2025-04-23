async function getAllPokemon() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await res.json();
  return data.results;
}

async function fetchPokemon(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  return await res.json();
}

async function fetchMoveDetails(url) {
  const res = await fetch(url);
  const data = await res.json();
  return {
    name: data.name,
    power: data.power || 50,
    accuracy: data.accuracy || 100,
    type: data.type.name,
  };
}

async function getTypeEffectiveness(attackType, defenderTypes) {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${attackType}`);
  const data = await res.json();
  let multiplier = 1;
  defenderTypes.forEach(t => {
    if (data.damage_relations.double_damage_to.some(d => d.name === t.type.name)) {
      multiplier *= 2;
    }
    if (data.damage_relations.half_damage_to.some(d => d.name === t.type.name)) {
      multiplier *= 0.5;
    }
    if (data.damage_relations.no_damage_to.some(d => d.name === t.type.name)) {
      multiplier *= 0;
    }
  });
  return multiplier;
}

async function populateMoves(pokemon, selectId) {
  const moveSelect = document.getElementById(selectId);
  moveSelect.innerHTML = '';
  const moveOptions = pokemon.moves.slice(0, 10);
  for (const move of moveOptions) {
    const option = document.createElement('option');
    option.value = move.move.url;
    option.textContent = move.move.name;
    moveSelect.appendChild(option);
  }
}

async function startBattle() {
  const p1Name = document.getElementById('pokemon1').value;
  const p2Name = document.getElementById('pokemon2').value;

  const p1 = await fetchPokemon(p1Name);
  const p2 = await fetchPokemon(p2Name);

  const move1Url = document.getElementById('move1-select').value;
  const move2Url = document.getElementById('move2-select').value;

  const move1 = await fetchMoveDetails(move1Url);
  const move2 = await fetchMoveDetails(move2Url);

  const eff1 = await getTypeEffectiveness(move1.type, p2.types);
  const eff2 = await getTypeEffectiveness(move2.type, p1.types);

  const damage1 = Math.floor((move1.power * eff1) - p2.stats[2].base_stat / 2);
  const damage2 = Math.floor((move2.power * eff2) - p1.stats[2].base_stat / 2);

  let winner = "It's a tie!";
  if (p1.stats[5].base_stat > p2.stats[5].base_stat) {
    winner = damage1 > damage2 ? p1.name : p2.name;
  } else {
    winner = damage2 > damage1 ? p2.name : p1.name;
  }

  document.getElementById('battle-result').innerText = `
    ${p1.name} used ${move1.name} for ${damage1} damage.\n
    ${p2.name} used ${move2.name} for ${damage2} damage.\n
    Winner: ${winner.toUpperCase()}
  `;
}

async function initialize() {
  const pokemonList = await getAllPokemon();
  const select1 = document.getElementById('pokemon1');
  const select2 = document.getElementById('pokemon2');

  pokemonList.forEach(p => {
    const option1 = document.createElement('option');
    option1.value = p.name;
    option1.textContent = p.name;
    select1.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = p.name;
    option2.textContent = p.name;
    select2.appendChild(option2);
  });

  select1.addEventListener('change', async () => {
    const p1 = await fetchPokemon(select1.value);
    populateMoves(p1, 'move1-select');
  });

  select2.addEventListener('change', async () => {
    const p2 = await fetchPokemon(select2.value);
    populateMoves(p2, 'move2-select');
  });

  // Load initial options
  const initialP1 = await fetchPokemon(select1.value || pokemonList[0].name);
  const initialP2 = await fetchPokemon(select2.value || pokemonList[1].name);
  populateMoves(initialP1, 'move1-select');
  populateMoves(initialP2, 'move2-select');
}

initialize();
