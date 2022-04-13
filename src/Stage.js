import BD from "./BD.js";
import Destructible from "./Destructible.js";
import BoulderGolem from "./Enemies/BoulderGolem.js";
import ShotSlime from "./Enemies/ShotSlime.js";
import Slime from "./Enemies/Slime.js";
import Spider from "./Enemies/Spider.js";
import PickUpItem from "./PickUpItem.js";
const gridSize = 16;
const EnemyMap = {
    "m1-1": [
        [[5, 3], Slime],
        [[7, 3], ShotSlime],
        [[7, 2], ShotSlime],
        [[7, 4], ShotSlime],
    ],
    "m1-2": [
        [[9, 10], Slime],
        [[5, 2], BoulderGolem]
    ],
    "m1-3": [
        [[7, 4], ShotSlime],
        [[12, 6], Slime],
        [[5, 8], ShotSlime],
    ],
    "m2-2": [
        [[10, 11], Slime],
        [[8, 2], Slime]
    ],
    "m2-3": [
        [[8, 5], Slime],
        [[9, 4], Slime],
    ],
    "m3-1": [
        [[3, 7], Slime],
        [[3, 12], Slime],
    ],
    "m3-1": [
        [[3, 7], Slime],
        [[3, 13], Slime],
    ],
    "m3-2": [
        [[5, 11], Spider],
        [[9, 11], Spider],
        [[4, 13], Spider],
    ],
    "m3-3": [
        [[5, 5], ShotSlime],
        [[12, 5], ShotSlime],
        [[8, 2], Slime],
        [[13, 11], Slime],
    ]

};
const ItemsMap = {
    "m2-3": [
        [[3, 1], "sword"]
    ],
    "m1-2": [
        [[6, 12], "bomb"]
    ],
};
const Stage = {
    init
};


function init(map) {
    Stage[map.name] = {};

    // LOAD DESTRUCTIBLES
    for (let keyposition in map.destructibles) {
        const [x, y] = keyposition.split("-").map((p) => parseInt(p));
        const info = map.destructibles[keyposition];
        Stage[map.name][keyposition] = new Destructible(x * gridSize, y * gridSize, info, map.json);
        const hittestpositions = [keyposition];
        map.json.hittest[keyposition] = 1;
        // IF WIDTH is >1
        {
            let w = info.width + 0;
            while (w > 1) {
                let k = (x + w - 1) + "-" + y;
                map.json.hittest[k] = 1;
                hittestpositions.push(k);
                w--;
            }
        }
        Stage[map.name][keyposition].onDestroy(() => {
            hittestpositions.forEach((_key) => [
                delete map.json.hittest[_key]
            ])
        });
    }
    // LOAD ITEMS 
    if (ItemsMap.hasOwnProperty(map.name)) {
        for (let i in ItemsMap[map.name]) {
            let item = ItemsMap[map.name][i];
            let keyposition = item[0].join("-");
            let itemposition = {
                x: item[0][0] * gridSize + gridSize / 2,
                y: item[0][1] * gridSize + gridSize / 2
            };
            let iteminfo = BD.ITEMS[item[1]];
            Stage[map.name][keyposition] = new PickUpItem(itemposition, iteminfo);
            map.interaction[keyposition] = {
                action: "pickup",
                item: iteminfo,
                onPick: function () {
                    Stage[map.name][keyposition].remove();
                    delete map.interaction[keyposition];
                    delete Stage[map.name][keyposition];
                }
            };
        }
    }
    // LOAD ENEMIES
    if (EnemyMap.hasOwnProperty(map.name)) {
        for (let i in EnemyMap[map.name]) {
            let mob = EnemyMap[map.name][i];
            let keyposition = mob[0].join("-");
            let mobposition = {
                x: mob[0][0] * gridSize + gridSize / 2,
                y: mob[0][1] * gridSize + gridSize / 2
            };
            Stage[map.name][keyposition] = new mob[1](mobposition);
        }
    }


}
window.$Stage = Stage;
export default Stage;

