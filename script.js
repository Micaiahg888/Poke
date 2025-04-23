let poke1 = {}, poke2 = {};
let currentTurn = 0;

// Fetch Pokémon type data for effectiveness calculation
async function fetchPokemon(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
  if (!res.ok) throw new Error("Pokémon not found");
  return await res.json();
}

// Fetch type effectiveness data
async function fetchTypeEffectiveness() {
  const res = await fetch('https://pokeapi.co/api/v2/type');
  const data = await res.json();
  let effectiveness = {};
  for (let type of data.results) {
    effectiveness[type.name] = {};
    const resType = await fetch(type.url);
    const typeData = await resType.json();
    for (let damageRel of typeData.damage_relations.double_damage_to) {
      effectiveness[type.name][damageRel.name] = 2;  // Effective
    }
    for (let damageRel of typeData.damage_relations.half_damage_to) {
      effectiveness[type.name][damageRel.name] = 0.5;  // Not effective
    }
    for (let damageRel of typeData.damage_relations.no_damage_to) {
      effectiveness[type.name][damageRel.name] = 0;  // Immune
    }
  }
  return effectiveness;
}

// Initialize effectiveness data
let typeEffectiveness = {};

async function initialize() {
  typeEffectiveness = await fetchTypeEffectiveness();
}

// Calculate effectiveness of a move based on attack and defender types
function calculateEffectiveness(moveType, defenderTypes) {
  let effectiveness = 1;
  for (let defenderType of defenderTypes) {
    if (typeEffectiveness[moveType] && typeEffectiveness[moveType][defenderType]) {
      effectiveness *= typeEffectiveness[moveType][defenderType];
    }
  }
  return effectiveness;
}

// Get random move for the Pokémon
function getRandomMove(pokemon) {
  const damageMoves = pokemon.moves.filter(m => m.move.name !== "growl");
  return damageMoves[Math.floor(Math.random() * damageMoves.length)].move.name;
}

// Log messages in the log box
function log(message) {
  const logBox = document.getElementById("log");
  logBox.innerHTML += message + "<br/>";
  logBox.scrollTop = logBox.scrollHeight;
}

// Handle attack animation
function animateAttack(attackerId) {
  const attacker = document.getElementById(attackerId);
  attacker.classList.add("attack");
  setTimeout(() => attacker.classList.remove("attack"), 300);
}

// Fetch move data from the API
async function getMoveData(moveName) {
  const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
  return await res.json();
}

// Calculate damage considering type effectiveness
function calculateDamage(move, attacker, defender, moveType) {
  const power = move.power || 50;
  const attack = attacker.stats[1].base_stat;
  const defense = defender.stats[2].base_stat;
  const typeEffect = calculateEffectiveness(moveType, defender.types.map(type => type.type.name));

  // Damage formula with type effectiveness multiplier
  return Math.max(1, Math.floor(((2 * 50 / 5 + 2) * power * attack / defense) / 50) + 2) * typeEffect;
}

// Battle turn logic
async function battleTurn() {
  const attacker = currentTurn % 2 === 0 ? poke1 : poke2;
  const defender = currentTurn % 2 === 0 ? poke2 : poke1;
  const attackerId = currentTurn % 2 === 0 ? "poke1" : "poke2";
  const defenderHpId = currentTurn % 2 === 0 ? "hp2" : "hp1";

  animateAttack(attackerId);
  const moveName = getRandomMove(attacker);
  const move = await getMoveData(moveName);
  const moveType = move.type.name;

  const damage = calculateDamage(move, attacker, defender, moveType);
  defender.hp -= damage;
  document.getElementById(defenderHpId).textContent = `HP: ${defender.hp}`;
  log(`${attacker.name} used ${move.name}! It did ${damage} damage!`);

  if (defender.hp <= 0) {
    log(`${defender.name} fainted!`);
    return;
  }

  currentTurn++;
  setTimeout(battleTurn, 1000);
}

// Start the battle after user inputs Pokémon names
async function startBattle() {
  document.getElementById("log").innerHTML = "";
  const name1 = document.getElementById("pokemon1").value;
  const name2 = document.getElementById("pokemon2").value;

  try {
    poke1 = await fetchPokemon(name1);
    poke2 = await fetchPokemon(name2);
  } catch (e) {
    alert("Failed to fetch one or both Pokémon.");
    return;
  }

  document.getElementById("img1").src = poke1.sprites.front_default;
  document.getElementById("img2").src = poke2.sprites.front_default;
  document.getElementById("hp1").textContent = "HP: 100";
  document.getElementById("hp2").textContent = "HP: 100";

  poke1.hp = 100;
  poke2.hp = 100;
  currentTurn = 0;

  battleTurn();
}

// Initialize type effectiveness data
initialize();
