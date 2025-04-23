const pokemon1Select = document.getElementById('pokemon1');
const pokemon2Select = document.getElementById('pokemon2');
const startBattleButton = document.getElementById('start-battle');
const battleLog = document.getElementById('log-list');
const winnerDisplay = document.getElementById('winner');
const statsDisplay = document.getElementById('stats');
const moveUsageDisplay = document.getElementById('move-usage');

// Sample Pokémon data (you can expand this or fetch it from the API)
const pokedex = {
    "Pikachu": { hp: 35, attack: 55, defense: 40, speed: 90, type: "electric", moves: ["Thunderbolt", "Quick Attack"] },
    "Charizard": { hp: 78, attack: 84, defense: 78, speed: 100, type: "fire", moves: ["Flamethrower", "Scratch"] },
    "Bulbasaur": { hp: 45, attack: 49, defense: 49, speed: 45, type: "grass", moves: ["Vine Whip", "Tackle"] },
    // Add more Pokémon here...
};

// Function to populate the dropdowns with Pokémon options
function populatePokemonDropdowns() {
    const pokemonList = Object.keys(pokedex);
    
    // Populate both dropdowns with the Pokémon list
    pokemonList.forEach(pokemon => {
        const option1 = document.createElement('option');
        option1.value = pokemon;
        option1.textContent = pokemon;
        pokemon1Select.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = pokemon;
        option2.textContent = pokemon;
        pokemon2Select.appendChild(option2);
    });
}

// Function to calculate damage
function calculateDamage(attacker, defender, move) {
    let baseDamage = attacker.attack - defender.defense;
    let effectiveness = 1; // Type effectiveness multiplier (can be extended based on type advantages)
    
    // Example: Electric move vs. Water (high effectiveness)
    if (move === "Thunderbolt" && defender.type === "water") {
        effectiveness = 2; // Double damage for Electric move on Water type
    }

    return Math.max(baseDamage * effectiveness, 1); // Ensure at least 1 damage
}

// Battle logic
function startBattle() {
    const pokemon1Name = pokemon1Select.value;
    const pokemon2Name = pokemon2Select.value;

    if (!pokedex[pokemon1Name] || !pokedex[pokemon2Name]) {
        alert("Please choose valid Pokémon.");
        return;
    }

    const pokemon1 = pokedex[pokemon1Name];
    const pokemon2 = pokedex[pokemon2Name];
    let turn = 0;
    let battleLogMessages = [];
    let winner = "";
    
    // Turn-based battle
    while (pokemon1.hp > 0 && pokemon2.hp > 0) {
        turn++;
        battleLogMessages.push(`Turn ${turn}:`);

        // Player 1 attacks Player 2
        let damageToP2 = calculateDamage(pokemon1, pokemon2, "Thunderbolt");
        pokemon2.hp -= damageToP2;
        battleLogMessages.push(`${pokemon1Name} uses Thunderbolt! ${pokemon2Name} takes ${damageToP2} damage.`);

        if (pokemon2.hp <= 0) {
            winner = pokemon1Name;
            break;
        }

        // Player 2 attacks Player 1
        let damageToP1 = calculateDamage(pokemon2, pokemon1, "Flamethrower");
        pokemon1.hp -= damageToP1;
        battleLogMessages.push(`${pokemon2Name} uses Flamethrower! ${pokemon1Name} takes ${damageToP1} damage.`);

        if (pokemon1.hp <= 0) {
            winner = pokemon2Name;
            break;
        }
    }

    // Show battle log and results
    battleLog.innerHTML = battleLogMessages.map(msg => `<li>${msg}</li>`).join('');
    winnerDisplay.textContent = `Winner: ${winner}`;
    statsDisplay.textContent = `Damage Dealt: ${pokedex[pokemon1Name].attack + pokedex[pokemon2Name].attack}`; // Example stats
    moveUsageDisplay.textContent = `Move Usage: Thunderbolt, Flamethrower`; // Example move usage
}

// Initialize the dropdowns with Pokémon options
document.addEventListener('DOMContentLoaded', populatePokemonDropdowns);

// Event listener for starting the battle
startBattleButton.addEventListener('click', startBattle);
