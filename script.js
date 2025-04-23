let poke1 = {}, poke2 = {};
let currentTurn = 0;

async function fetchPokemon(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
  if (!res.ok) throw new Error("Pokémon not found");
  return await res.json();
}

function getRandomMove(pokemon) {
  const damageMoves = pokemon.moves.filter(m => m.move.name !== "growl");
  return damageMoves[Math.floor(Math.random() * damageMoves.length)].move.name;
}

function log(message) {
  const logBox = document.getElementById("log");
  logBox.innerHTML += message + "<br/>";
  logBox.scrollTop = logBox.scrollHeight;
}

function animateAttack(attackerId) {
  const attacker = document.getElementById(attackerId);
  attacker.classList.add("attack");
  setTimeout(() => attacker.classList.remove("attack"), 300);
}

async function getMoveData(moveName) {
  const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
  return await res.json();
}

function calculateDamage(move, attacker, defender) {
  const power = move.power || 50;
  const attack = attacker.stats[1].base_stat;
  const defense = defender.stats[2].base_stat;
  return Math.max(1, Math.floor(((2 * 50 / 5 + 2) * power * attack / defense) / 50) + 2);
}

async function battleTurn() {
  const attacker = currentTurn % 2 === 0 ? poke1 : poke2;
  const defender = currentTurn % 2 === 0 ? poke2 : poke1;
  const attackerId = currentTurn % 2 === 0 ? "poke1" : "poke2";
  const defenderHpId = currentTurn % 2 === 0 ? "hp2" : "hp1";

  animateAttack(attackerId);
  const moveName = getRandomMove(attacker);
  const move = await getMoveData(moveName);
  const damage = calculateDamage(move, attacker, defender);
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
