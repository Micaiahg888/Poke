let pokemonList = []; // This will hold the list of Pokémon from the API

// Fetch list of Pokémon (You can use an API like pokeapi.co)
async function fetchPokemonData() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150'); // Example for 150 Pokémon
    const data = await response.json();
    pokemonList = data.results;
    initializeAutocomplete();
}

// Autocomplete for Pokémon search input
function initializeAutocomplete() {
    const input1 = document.getElementById('pokemon1');
    const input2 = document.getElementById('pokemon2');

    new autoComplete({
        selector: input1,
        minChars: 2,
        source: (term, suggest) => {
            term = term.toLowerCase();
            const suggestions = pokemonList.filter(pokemon =>
                pokemon.name.toLowerCase().includes(term)
            );
            suggest(suggestions.map(pokemon => pokemon.name));
        },
        onSelect: (event, term, item) => {
            loadPokemonData(term, 'pokemon1');
        }
    });

    new autoComplete({
        selector: input2,
        minChars: 2,
        source: (term, suggest) => {
            term = term.toLowerCase();
            const suggestions = pokemonList.filter(pokemon =>
                pokemon.name.toLowerCase().includes(term)
            );
            suggest(suggestions.map(pokemon => pokemon.name));
        },
        onSelect: (event, term, item) => {
            loadPokemonData(term, 'pokemon2');
        }
    });
}

// Load data for the selected Pokémon
async function loadPokemonData(name, pokemonId) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await response.json();
    window[pokemonId] = data; // Store the data in a global variable
}

// Battle logic
function startBattle() {
    const pokemon1 = window.pokemon1;
    const pokemon2 = window.pokemon2;

    if (!pokemon1 || !pokemon2) {
        alert("Please select both Pokémon!");
        return;
    }

    let battleLog = "";
    let damageDealt = 0;
    let movesUsed = 0;

    // Simulate battle: simple example using attack stats
    while (pokemon1.hp > 0 && pokemon2.hp > 0) {
        // Choose a random move for each Pokémon (simplified for now)
        const move1 = pokemon1.moves[Math.floor(Math.random() * pokemon1.moves.length)];
        const move2 = pokemon2.moves[Math.floor(Math.random() * pokemon2.moves.length)];

        // Calculate damage for each move (simplified damage calculation)
        const damage1 = move1.power - pokemon2.defense;
        const damage2 = move2.power - pokemon1.defense;

        pokemon2.hp -= damage1;
        pokemon1.hp -= damage2;

        // Update battle log
        battleLog += `${pokemon1.name} used ${move1.name}, dealt ${damage1} damage.\n`;
        battleLog += `${pokemon2.name} used ${move2.name}, dealt ${damage2} damage.\n`;

        // Update damage statistics
        damageDealt += damage1 + damage2;
        movesUsed += 2;
    }

    // Determine the winner
    const winner = pokemon1.hp > 0 ? pokemon1.name : pokemon2.name;
    battleLog += `The winner is ${winner}!`;

    // Update the UI
    document.getElementById('battleLog').innerText = battleLog;
    document.getElementById('battleResult').innerText = `${winner} wins!`;
    document.getElementById('damageDealt').innerText = `Damage Dealt: ${damageDealt}`;
    document.getElementById('movesUsed').innerText = `Moves Used: ${movesUsed}`;
}

// Initialize the Pokémon data on load
fetchPokemonData();
