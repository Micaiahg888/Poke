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
  const move1 = p1.moves[0]?.move.name;
  const move2 = p2.moves[0]?.move.name;

  const type1 = p1.types.map(t => t.type.name);
  const type2 = p2.types.map(t => t.type.name);

  const effectiveness1 = await getTypeEffectiveness(type1[0], type2);
  const effectiveness2 = await getTypeEffectiveness(type2[0], type1);

  const p1Attack = (p1.stats[1].base_stat * effectiveness1) - p2.stats[2].base_stat;
  const p2Attack = (p2.stats[1].base_stat * effectiveness2) - p1.stats[2].base_stat;

  const p1Speed = p1.stats[5].base_stat;
  const p2Speed = p2.stats[5].base_stat;

  let p1HP = p1.stats[0].base_stat;
  let p2HP = p2.stats[0].base_stat;

  const log = [`Battle starts between ${p1.name} and ${p2.name}!`];

  while (p1HP > 0 && p2HP > 0) {
    if (p1Speed >= p2Speed) {
      p2HP -= p1Attack;
      log.push(`${p1.name} hits ${p2.name} for ${p1Attack.toFixed(1)}!`);
      if (p2HP <= 0) break;
      p1HP -= p2Attack;
      log.push(`${p2.name} hits ${p1.name} for ${p2Attack.toFixed(1)}!`);
    } else {
      p1HP -= p2Attack;
      log.push(`${p2.name} hits ${p1.name} for ${p2Attack.toFixed(1)}!`);
      if (p1HP <= 0) break;
      p2HP -= p1Attack;
      log.push(`${p1.name} hits ${p2.name} for ${p1Attack.toFixed(1)}!`);
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
}
