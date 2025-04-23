const typeEffectiveness = {
    "fire": {
        "grass": 2,
        "water": 0.5,
        "fire": 1,
        "electric": 1
    },
    "water": {
        "fire": 2,
        "grass": 0.5,
        "water": 1,
        "electric": 1
    },
    // Add other types as needed
};

const calculateDamage = (attacker, defender, move) => {
    let basePower = 50; // Assuming a basic power for demonstration; this can be adjusted per move.
    let damage = basePower;
    
    // Type effectiveness
    const attackerTypes = attacker.types;
    const defenderTypes = defender.types;
    let typeMultiplier = 1;

    attackerTypes.forEach(type => {
        defenderTypes.forEach(defenderType => {
            if (typeEffectiveness[type] && typeEffectiveness[type][defenderType]) {
                typeMultiplier *= typeEffectiveness[type][defenderType];
            }
        });
    });

    // Final damage calculation
    damage *= typeMultiplier;
    return Math.round(damage);
};

const simulateTurn = (attacker, defender, move) => {
    const damage = calculateDamage(attacker, defender, move);
    defender.hp -= damage;
    return { damage, defenderHpLeft: defender.hp };
};

const battle = async (pokemon1, pokemon2) => {
    const pokemon1Data = await getPokemonData(pokemon1);
    const pokemon2Data = await getPokemonData(pokemon2);

    let battleLog = [];
    let winner = null;

    while (pokemon1Data.hp > 0 && pokemon2Data.hp > 0) {
        // Simulate turns (alternating)
        let turnResult = simulateTurn(pokemon1Data, pokemon2Data, pokemon1Data.moves[0]);
        battleLog.push(`Pokemon 1 dealt ${turnResult.damage} damage. Pokemon 2 has ${turnResult.defenderHpLeft} HP left.`);
        if (pokemon2Data.hp <= 0) {
            winner = pokemon1Data;
            break;
        }

        turnResult = simulateTurn(pokemon2Data, pokemon1Data, pokemon2Data.moves[0]);
        battleLog.push(`Pokemon 2 dealt ${turnResult.damage} damage. Pokemon 1 has ${turnResult.defenderHpLeft} HP left.`);
        if (pokemon1Data.hp <= 0) {
            winner = pokemon2Data;
            break;
        }
    }

    return { winner, battleLog };
};
