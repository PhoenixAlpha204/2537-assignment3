var response;
var pokemon;
var numPages;
const PAGE_SIZE = 10;
var types;
var checkboxValues = {};

const setup = async () => {
    response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    types = await axios.get('https://pokeapi.co/api/v2/type?offset=0');
    types = types.data.results;
    types.forEach((type) => {
        let name = type.name;
        $('#filters').append(`<input type="checkbox" class="checkbox" name="${name}" id="${name}"><label for="${name}">${name}</label>`);
        checkboxValues[name] = false;
    });
    $('body').on('click', '.checkbox', function (e) {
       const name = $(this).attr('name');
       checkboxValues[name] = this.checked;
       getPokemon();
    });
    getPokemon();
}

$(document).ready(setup);

async function showPage(n) {
    if (n < 1) {
        showPage(1);
    } else if (n > numPages) {
        showPage(numPages);
    } else {
        $('#pokemon').empty();
        $('#pagination').empty();
        var first = Math.max(0, (n - 1) * PAGE_SIZE);
        var last = Math.min(pokemon.length, (n - 1) * PAGE_SIZE + 10);
        $('#header').text(`Showing ${last - first} of ${pokemon.length} Pokemon`);
        for (let i = first; i < last; i++) {
            let innerResponse = await axios.get(`${pokemon[i].url}`);
            let thisPokemon = innerResponse.data;
            $('#pokemon').append(`
                <div class="card" pokeName=${thisPokemon.name}>
                    <h3>${thisPokemon.name}</h3>
                    <img src="${thisPokemon.sprites.front_default}" alt="${thisPokemon.name}"/>
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#pokeModal">More</button>
                </div>`);
        }
        $('body').on('click', '.card', async function (e) {
            const pokemonName = $(this).attr('pokeName');
            const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            const types = res.data.types.map((type) => type.type.name);
            $('.modal-title').html(pokemonName);
            $('.modal-body').html(`
                <div style="width:200px">
                    <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
                    <div>
                        <h3>Abilities</h3>
                        <ul>
                            ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <h3>Stats</h3>
                        <ul>
                            ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <h3>Types</h3>
                <ul>
                    ${types.map((type) => `<li>${type}</li>`).join('')}
                </ul>`)
        });
        showButtons(n);
    }
}

function showButtons(n) {
    if (n > 1) {
        $('#pagination').append(`<button type="button" class="btn btn-primary" onclick="showPage(${n-1})">Previous</button>`);
    }
    var first = Math.max(1, n - 2);
    var last = Math.min(numPages, n + 2);
    for (i = first; i <= last; i++) {
        $('#pagination').append(`<button type="button" class="btn btn-primary ${(i == n ? "active" : "")}" onclick="showPage(${i})">${i}</button>`);
    }
    if (n < numPages) {
        $('#pagination').append(`<button type="button" class="btn btn-primary" onclick="showPage(${n+1})">Next</button>`);
    }
}

async function getPokemon() {
    pokemon = response.data.results;
    var checked = [];
    Object.entries(checkboxValues).forEach(entry => {
        const [key, value] = entry;
        if (value) {
            checked.push(key);
        }
    });
    for (i = 0; i < checked.length; i++) {
        toFilter = await axios.get(`https://pokeapi.co/api/v2/type/${checked[i]}`);
        toFilter = toFilter.data.pokemon.map((obj) => obj.pokemon);
        pokemon = pokemon.filter(obj => toFilter.some(item => item.name === obj.name));
    }
    numPages = Math.max(1, Math.ceil(pokemon.length / PAGE_SIZE));
    showPage(1);
}
