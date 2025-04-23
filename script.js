// References to the HTML elements
const pokemon1Select = document.getElementById('pokemon1');
const pokemon2Select = document.getElementById('pokemon2');
const startBattleButton = document.getElementById('start-battle');
const battleLog = document.getElementById('log-list');
const winnerDisplay = document.getElementById('winner');
const statsDisplay = document.getElementById('stats');
const moveUsageDisplay = document.getElementById('move-usage');

// Pokémon data storage
let pokemons = [];
let selectedPokemon1 = {};
let selectedPokemon2 = {};

// Fetch list of Pokémon from the Pokémon API
async function fetchPokemons() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100');
    const data = await response.json();

    // Populate dropdowns with Pokémon names
    pokemons = data.results;
    pokemons.forEach(pokemon => {
        const option1 = document.createElement('option');
        option1.value = pokemon.name;
        option1.textContent = pokemon.name;
        pokemon1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = pokemon.name;
        option2.textContent = pokemon.name;
        pokemon2Select.appendChild(option2);
    });

    // Enable the start battle button once Pokémon are loaded
    startBattleButton.disabled = false;
}

// Fetch detailed data of a selected Pokémon (stats, moves)
async function fetchPokemonData(pokemonName) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const data = await response.json();
    
    return {
        name: data.name,
        hp: data.stats.find(stat => stat.stat.name === 'hp').base_stat,
        attack: data.stats.find(stat => stat.stat.name === 'attack').base_stat,
        defense: data.stats.find(stat => stat.stat.name === 'defense').base_stat,
        speed: data.stats.find(stat => stat.stat.name === 'speed').base_stat,
        moves: data.moves.slice(0, 4).map(move => move.move.name),  // Take the first 4 moves
        type: data.types[0].type.name,  // Simplification: take the first type
    };
}

// Function to calculate damage
function calculateDamage(attacker, defender, move) {
    let baseDamage = attacker.attack - defender.defense;
    let effectiveness = 1;

    // Example: Electric move vs. Water (high effectiveness)
    if (move === "Thunderbolt" && defender.type === "water") {
        effectiveness = 2; // Double damage for Electric move on Water type
    }

    return Math.max(baseDamage * effectiveness, 1);  // Ensure at least 1 damage
}

// Battle simulation function
async function startBattle() {
    // Get selected Pokémon data
    selectedPokemon1 = await fetchPokemonData(pokemon1Select.value);
    selectedPokemon2 = await fetchPokemonData(pokemon2Select.value);

    // Battle simulation
    let turn = 0;
    let battleLogMessages = [];
    let winner = "";

    while (selectedPokemon1.hp > 0 && selectedPokemon2.hp > 0) {
        turn++;
        battleLogMessages.push(`Turn ${turn}:`);

        // Player 1 attacks Player 2
        const damageToP2 = calculateDamage(selectedPokemon1, selectedPokemon2, "Thunderbolt");
        selectedPokemon2.hp -= damageToP2;
        battleLogMessages.push(`${selectedPokemon1.name} uses Thunderbolt! ${selectedPokemon2.name} takes ${damageToP2} damage.`);

        if (selectedPokemon2.hp <= 0) {
            winner = selectedPokemon1.name;
            break;
        }

        // Player 2 attacks Player 1
        const damageToP1 = calculateDamage(selectedPokemon2, selectedPokemon1, "Flamethrower");
        selectedPokemon1.hp -= damageToP1;
        battleLogMessages.push(`${selectedPokemon2.name} uses Flamethrower! ${selectedPokemon1.name} takes ${damageToP1} damage.`);

        if (selectedPokemon1.hp <= 0) {
            winner = selectedPokemon2.name;
            break;
        }
    }

    // Display battle log and results
    battleLog.innerHTML = battleLogMessages.map(msg => `<li>${msg}</li>`).join('');
    winnerDisplay.textContent = `Winner: ${winner}`;
    statsDisplay.textContent = `Damage Dealt: ${selectedPokemon1.attack + selectedPokemon2.attack}`; // Example stats
    moveUsageDisplay.textContent = `Move Usage: Thunderbolt, Flamethrower`; // Example move usage
}

// Initialize the Pokémon dropdowns when the page loads
document.addEventListener('DOMContentLoaded', fetchPokemons);

// Event listener for the "Start Battle" button
startBattleButton.addEventListener('click', startBattle);
