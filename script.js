async function getPokemonData(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    if (!response.ok) {
      alert(`Pokémon "${name}" not found!`);
      return null;
    }
    const data = await response.json();
    return {
      name: data.name,
      sprite: data.sprites.front_default,
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        speed: data.stats[5].base_stat
      },
      types: data.types.map(t => t.type.name),
      abilities: data.abilities.map(a => a.ability.name)
    };
  }
  
  function displayPokemon(pokemon, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="card p-3 text-center">
        <h4 class="text-capitalize">${pokemon.name}</h4>
        <img src="${pokemon.sprite}" alt="${pokemon.name}" class="poke-sprite">
        <p><strong>Types:</strong> ${pokemon.types.join(', ')}</p>
        <p><strong>Abilities:</strong> ${pokemon.abilities.join(', ')}</p>
        <p><strong>Stats:</strong><br>
          HP: ${pokemon.stats.hp}, 
          ATK: ${pokemon.stats.attack}, 
          DEF: ${pokemon.stats.defense}, 
          SPD: ${pokemon.stats.speed}
        </p>
      </div>
    `;
  }
  
  function simulateBattle(p1, p2) {
    const log = [];
  
    // Turn order by speed
    const [first, second] = p1.stats.speed >= p2.stats.speed ? [p1, p2] : [p2, p1];
    log.push(`${first.name} is faster and attacks first!`);
  
    // Simple stat-based battle simulation (2 rounds max)
    function damage(attacker, defender) {
      return Math.max(1, attacker.stats.attack - defender.stats.defense);
    }
  
    let p1HP = p1.stats.hp;
    let p2HP = p2.stats.hp;
  
    for (let turn = 0; turn < 10; turn++) {
      const atk = turn % 2 === 0 ? first : second;
      const def = turn % 2 === 0 ? second : first;
      const dmg = damage(atk, def);
  
      if (def.name === p1.name) {
        p1HP -= dmg;
        log.push(`${atk.name} attacks ${def.name} for ${dmg} damage! ${p1.name} has ${p1HP} HP left.`);
        if (p1HP <= 0) break;
      } else {
        p2HP -= dmg;
        log.push(`${atk.name} attacks ${def.name} for ${dmg} damage! ${p2.name} has ${p2HP} HP left.`);
        if (p2HP <= 0) break;
      }
    }
  
    let winner = p1HP > p2HP ? p1.name : p2.name;
    log.push(`🏆 Winner: ${winner.toUpperCase()}!`);
  
    return log;
  }
  
  async function startBattle() {
    const name1 = document.getElementById('pokemon1').value.trim();
    const name2 = document.getElementById('pokemon2').value.trim();
  
    if (!name1 || !name2) return alert("Please enter two Pokémon names.");
  
    const [poke1, poke2] = await Promise.all([getPokemonData(name1), getPokemonData(name2)]);
  
    if (!poke1 || !poke2) return;
  
    displayPokemon(poke1, 'poke1-display');
    displayPokemon(poke2, 'poke2-display');
  
    const log = simulateBattle(poke1, poke2);
  
    document.getElementById('battle-result').innerHTML = `
      <h3 class="text-center mt-4">Battle Log</h3>
      <pre class="bg-white p-3 border rounded">${log.join('\n')}</pre>
    `;
  }
  