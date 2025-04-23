const getPokemonData = async (pokemonName) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    const data = await response.json();
    return data;
};

const getPokemonTypes = async (pokemonName) => {
    const pokemonData = await getPokemonData(pokemonName);
    return pokemonData.types.map(type => type.type.name);
};

const getPokemonMoves = async (pokemonName) => {
    const pokemonData = await getPokemonData(pokemonName);
    return pokemonData.moves.map(move => move.move.name);
};

const getPokemonStats = async (pokemonName) => {
    const pokemonData = await getPokemonData(pokemonName);
    return pokemonData.stats.map(stat => ({ stat: stat.stat.name, base_stat: stat.base_stat }));
};
