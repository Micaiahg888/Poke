const API = "https://pokeapi.co/api/v2/";
let allPokemon = [];

window.onload = async () => {
  const response = await fetch(`${API}pokemon?limit=1000`);
  const data = await response.json();
  allPokemon = data.results.map(p => p.name);
  setupAutocomplete();
};

function setupAutocomplete() {
  const inputs = [document.getElementById('pokemon1-input'), document.getElementById('pokemon2-input')];
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      const val = input.value.toLowerCase();
      const match = allPokemon.find(p => p.startsWith(val));
      if (match) input.value = match;
    });
  });

  // Move dropdown triggers
  document.getElementById("pokemon1-input").addEventListener("change", () => {
    populateMoves(document.getElementById("pokemon1-input").value, "pokemon1-move");
  });
  document.getElementById("pokemon2-input").addEventListener("change", () => {
    populateMoves(document.getElementById("pokemon2-input").value, "pokemon2-move");
  });
}

async function populateMoves(name, selectId) {
  const res = await fetch(`${API}pokemon/${name.toLowerCase()}`);
  const data = await res.json();
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  data.moves.slice(0, 10).forEach(m => {
    const option = document.createElement('option');
    option.value = m.move.name;
    option.text = m.move.name;
    select.appendChild(option);
  });
}

async function getPokemonData(name) {
  const res = await fetch(`${API}pokemon/${name.toLowerCase()}`);
  return await res.json();
}

async function getTypeEffectiveness(attackerType, defenderTypes) {
  let multiplier = 1;
  const res = await fetch(`${API}type/${attackerType}`);
  const typeData = await res.json();
  const { double_damage_to, half_damage_to, no_damage_to } = typeData.damage_relations;

  for (const defender of defenderTypes) {
    if (double_damage_to.some(t => t.name === defender)) multiplier *= 2;
    if (half_damage_to.some(t => t.name === defender)) multiplier *= 0.5;
    if (no_damage_to.some(t => t.name === defender)) multiplier *= 0;
  }

  return multiplier;
}

async function simulateTurn(p1, p2) {
  const move1Name = document.getElementById("pokemon1-move").value;
  const move2Name = document.getElementById("pokemon2-move").value;

  const move1Data = await (await fetch(`${API}move/${move1Name}`)).json();
  const move2Data = await (await fetch(`${API}move/${move2Name}`)).json();

  const power1 = move1Data.power || 50;
  const power2 = move2Data.power || 50;

  const type1 = p1.types.map(t => t.type.name);
  const type2 = p2.types.map(t => t.type.name);

  const effectiveness1 = await getTypeEffectiveness(move1Data.type.name, type2);
  const effectiveness2 = await getTypeEffectiveness(move2Data.type.name, type1);

  const p1Attack = ((p1.stats[1].base_stat + power1) * effectiveness1) - p2.stats[2].base_stat;
  const p2Attack = ((p2.stats[1].base_stat + power2) * effectiveness2) - p1.stats[2].base_stat;

  const p1Speed = p1.stats[5].base_stat;
  const p2Speed = p2.stats[5].base_stat;

  let p1HP = p1.stats[0].base_stat;
  let p2HP = p2.stats[0].base_stat;

  const log = [`⚔️ Battle: ${p1.name} vs ${p2.name}`];

  while (p1HP > 0 && p2HP > 0) {
    if (p1Speed >= p2Speed) {
      p2HP -= p1Attack;
      log.push(`${p1.name} uses ${move1Name} and hits ${p2.name} for ${p1Attack.toFixed(1)}!`);
      if (p2HP <= 0) break;
      p1HP -= p2Attack;
      log.push(`${p2.name} uses ${move2Name} and hits ${p1.name} for ${p2Attack.toFixed(1)}!`);
    } else {
      p1HP -= p2Attack;
      log.push(`${p2.name} uses ${move2Name} and hits ${p1.name} for ${p2Attack.toFixed(1)}!`);
      if (p1HP <= 0) break;
      p2HP -= p1Attack;
      log.push(`${p1.name} uses ${move1Name} and hits ${p2.name} for ${p1Attack.toFixed(1)}!`);
    }
  }

  const winner = p1HP > 0 ? p1.name : p2.name;
  log.push(`🎉 ${winner.toUpperCase()} WINS!`);
  return log;
}

async function startBattle() {
  const name1 = document.getElementById("pokemon1-input").value;
  const name2 = document.getElementById("pokemon2-input").value;

  const p1 = await getPokemonData(name1);
  const p2 = await getPokemonData(name2);

  const log = await simulateTurn(p1, p2);
  document.getElementById("battle-log").innerHTML = log.map(line => `<p>${line}</p>`).join("");
}

function getRandomBattle() {
  const rand1 = allPokemon[Math.floor(Math.random() * allPokemon.length)];
  const rand2 = allPokemon[Math.floor(Math.random() * allPokemon.length)];

  document.getElementById('pokemon1-input').value = rand1;
  document.getElementById('pokemon2-input').value = rand2;

  populateMoves(rand1, 'pokemon1-move');
  populateMoves(rand2, 'pokemon2-move');
}
