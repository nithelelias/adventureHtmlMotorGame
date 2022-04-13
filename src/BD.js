const BD = {
    GRIDSIZE: 16,
    ANIMATEDFRAMES: {

    },
    ALERTICON: {
        url: "resources/icons-alert.png",
        x: 0,
        y: 0,
        maxheight: 16,
        maxwidth: 144,
        width: 16,
        height: 16,
        frames: [0, 1, 2, 3, 4, 5],
        iconframes: {
            alarm: 0,
            question: 1,
            no: 2,
            cancel: 2,
            nop: 2,
            move: 3,
            sleep: 4,
            talk: 5
        }
    },

    ENEMYS: {

        "slime": {
            life: 5,
            name: "slime",
            agro_cell_distance: 4,
            range_cell_attack: 0,
            animations: {
                idle: [0, 1, 0],
                moving: [1, 0, 2],
                attack: [1, 1, 2, 2, 2, 3],
                die: [4, 4, 4, 5, 5, 5, 6, 6, 7],
                dead: [7]
            },
            sprite: {
                url: "resources/slime.png",
                x: 0, y: 0,
                maxheight: 64,
                maxwidth: 64,
                width: 16,
                height: 16
            }
        },
        "spider": {
            life: 5,
            maxlife: 5,
            name: "spider",
            agro_cell_distance: 9,
            range_cell_attack: 0,
            animations: {
                idle: [0, 0],
                moving: [1, 0, 2, 0],
                attack: [1, 1, 2, 2, 2, 3],
                die: [4, 4, 4, 5, 5, 5, 6, 6, 7],
                dead: [7]
            },
            sprite: {
                url: "resources/spider.png",
                x: 0, y: 0,
                maxheight: 64,
                maxwidth: 64,
                width: 16,
                height: 16
            }
        },
        "shotslime": {
            life: 5,
            name: "shotslime",
            agro_cell_distance: 4,
            range_cell_attack: 1,
            animations: {
                idle: [0, 1, 0],
                moving: [1, 0, 2],
                attack: [1, 1, 2, 2, 2, 3],
                die: [4, 4, 4, 5, 5, 5, 6, 6, 7],
                dead: [7]
            },
            sprite: {
                url: "resources/shotslime.png",
                x: 0, y: 0,
                maxheight: 64,
                maxwidth: 64,
                width: 16,
                height: 16
            }
        },
        "golem": {
            life: 5,
            name: "golem",
            agro_cell_distance: 4,
            range_cell_attack: 1,
            animations: {
                idle: [0, 1, 0],
                moving: [1, 0, 2],
                attack: [1, 1, 2, 2, 2, 3],
                die: [4, 4, 4, 5, 5, 5, 6, 6, 7],
                dead: [7]
            },
            sprite: {
                url: "resources/golem.png",
                x: 0, y: 0,
                maxheight: 96,
                maxwidth: 72,
                width: 24,
                height: 24
            }
        }, "boulder": {
            life: 5,
            name: "boulder",
            agro_cell_distance: 4,
            range_cell_attack: 1,
           
            sprite: {
                url: "resources/boulder.png",
                x: 0, y: 0,
                maxheight: 32,
                maxwidth: 32,
                width: 32,
                height: 32
            }
        }, "knight": {
            life: 5,
            name: "knight",
            agro_cell_distance: 4,
            range_cell_attack: 1,
            animations: {
                idle: [0, 1, 0],
                moving: [1, 0, 2],
                attack: [1, 1, 2, 2, 2, 3],
                die: [4, 4, 4, 5, 5, 5, 6, 6, 7],
                dead: [7]
            },
            sprite: {
                url: "resources/knight.png",
                x: 0, y: 0,
                maxheight: 72,
                maxwidth: 72,
                width: 24,
                height: 24
            }
        }

    },
    DESTRUCTIBLEKEY: {
        "6-1": { name: "bush1", width: 1, height: 1, life: 1, sprite: { x: 6, y: 1 } },
        "7-1": { name: "bush2", width: 1, height: 1, life: 1, sprite: { x: 7, y: 1 } },
        "8-1": { name: "rock1", width: 1, height: 1, life: 1, sprite: { x: 8, y: 1 }, onlybomb: true },
        "9-1": { name: "rock2", width: 1, height: 1, life: 1, sprite: { x: 9, y: 1 }, onlybomb: true },
        "8-3": { name: "bigrock", width: 2, height: 2, life: 1, sprite: { x: 8, y: 2 }, onlybomb: true },
        "5-3": { name: "tree", width: 1, height: 2, life: 3, sprite: { x: 5, y: 2 }, nobomb: true },
    },
    ITEMS: {
        "sword": {
            name: "sword",
            pickup: "give_sword",
            sprite: {
                url: "resources/char.png",
                x: 0,
                y: 64,
                width: 16,
                height: 16
            }
        },
        "bomb": {
            name: "sword",
            pickup: "give_bombs",
            sprite: {
                url: "resources/bomb.png",
                x: 0,
                y: 0,
                width: 16,
                height: 16
            }
        }
    },
    MAPS: {

    },
    onReady: null

}
/// CREATE MAP
{

    const promisesReady = [];
    let getJson = function (url) {
        return fetch(url).then((r) => {
            return r.json();
        });
    };

    async function initMap(x, y) {
        const key = "m" + x + "-" + y;
        BD.MAPS[key] = {
            name: key,
            ready: false,
            interaction: {},
            url: "json/" + (key) + ".json"

        };
        BD.MAPS[key].onReady = getJson(BD.MAPS[key].url).then((json) => {
            /////////////////////////////-------------
            json.tileImage = "resources/" + json.tileImage;
            // READ DESTRUCTIBLES...
            let destructibles = {};
            for (let key in json.layers[1]) {
                let framekey = json.layers[1][key].join("-");
                if (BD.DESTRUCTIBLEKEY.hasOwnProperty(framekey)) {

                    destructibles[key] = BD.DESTRUCTIBLEKEY[framekey];

                    // ERASE positions related to map 
                    delete json.layers[1][key];

                }
            }
            /////////////////////////////////////////
            BD.MAPS[key].json = json;
            BD.MAPS[key].destructibles = destructibles;
            BD.MAPS[key].event = { name: "zone" + key.toUpperCase() };
            // LINK MAPS
            let size = json.rows;
            let mirrorcoords = (n) => {
                //MIN 1, MAX=3
                if (n < 1) {
                    return 3;
                } else if (n > 3) {
                    return 1
                }
                return n;
            };
            let getMapfromcoods = (coords) => {
                return "m" + mirrorcoords(coords[0]) + "-" + mirrorcoords(coords[1]);

            }
            let bindToMap = (pkey, position, coords) => {
                //let pkey = col + "-" + atrow;
                if (!json.hittest.hasOwnProperty(pkey)) {
                    BD.MAPS[key].interaction[pkey] = {
                        action: "loadmap",
                        map: getMapfromcoods(coords),
                        // THE POSITION WHERE THE PLAYER WILL BE ON THE NEXT MAP.
                        position
                    };
                }

            };

            // UP OR DOWN
            while (size > 0) {
                // UP
                bindToMap(size + "-0", [size, 15], [x, y - 1]);
                // DOWN
                bindToMap(size + "-15", [size, 0], [x, y + 1]);
                // LEFT
                bindToMap("0-" + size, [15, size], [x - 1, y]);
                // RIGHT
                bindToMap("15-" + size, [0, size], [x + 1, y]);
                size--;
            }

            return 1;
        });

        promisesReady.push(BD.MAPS[key].onReady)
    }
    const rows = [1, 2, 3];
    const cols = [1, 2, 3];

    rows.forEach((row) => {
        cols.forEach((col) => {
            initMap(col, row)
        });
    });
    BD.onReady = Promise.all(promisesReady);
}
window.$BD = BD;
export default BD;