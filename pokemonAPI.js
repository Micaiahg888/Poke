// Example API calls for fetching detailed data about each Pokémon and their moves
async function fetchPokemonDetails(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await response.json();
    return data;
}
