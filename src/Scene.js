
import BD from "./BD.js";
import Stage from "./Stage.js";

import Events from "./Events.js";
import GridMapControl from "./GridMapControl.js";
import jsGame from "./jsGame.js";
import Player from "./Player.js";
import mapFunctions from "./mapFunctions.js";
//
const map = new jsGame.GridMap("resources/maptile.png");
const overmap = new jsGame.GridMap("resources/maptile.png");
const pj = new Player();
const getPlayer = function () {
    return pj;
}
////
var fixedCameratoEntiy = pj;
/////////////   MAP   /////////////////////////////////////////////////////////
GridMapControl.apply(map);
GridMapControl.apply(overmap);

////////////////////////////////////////////////////////////////////////////////////
const Interactions = {
    pickup: function (_interaction) {
        console.log("pickup")
        getPlayer()[_interaction.item.pickup]();
        _interaction.onPick();
    },
    loadmap: function (_interaction) {
        mapFunctions.getCurrentScene().loadMap(_interaction.map, _interaction.position);
    },
    loadEvent: function (_interaction) {
        if (_interaction.event) {
            Events[_interaction.event]();
        }
    }
};

////////////////////////////////////////////////////////////////////////////////////
export default class Scene extends jsGame.Entity {
    constructor() {
        super();
        //  this.dom.style.border = "solid green";
        this.dom.style.overflow = "hidden";
        this.dom.classList.add("scene");
        this.scale = 2;
        this.canInteract = true;
        this.currentMap = null;
        this.tint = null;
        this.darktint = [
            {
                replace: [142, 47, 21],
                color: [84, 65, 65]
            },
            {
                replace: [218, 122, 52],
                color: [126, 113, 104]
            }
        ];

        mapFunctions.setCurrentScene(this);
        mapFunctions.setMap(map);
        //window.addEventListener('resize', () => { this.calcCenter() });
    }
    getPlayer() {
        return pj;
    }
    calcCenter() {
        this.width = innerWidth
        this.height = innerHeight;
        //
        this.x = ((this.width / 2) - (fixedCameratoEntiy.x + fixedCameratoEntiy.width / 2)) * this.scale;
        this.y = ((this.height / 2) - (fixedCameratoEntiy.y + fixedCameratoEntiy.height / 2)) * this.scale;
        this.dom.style.width = this.width + "px"; this.dom.style.height = this.height + "px";
        this.dom.style.transform = "scale(" + this.scale + ")";

    }
    onEnterFrame() {
        this.calcCenter();
    }
    preloadAll(tickFnCallback = () => { }) {
        return new Promise((_end) => {
            let keys = Object.keys(BD.MAPS);
            let next = () => {
                if (keys.length > 0) {
                    let keymap = keys.shift();
                    Stage.init(BD.MAPS[keymap]);
                    BD.MAPS[keymap].onReady.then(() => { 
                        tickFnCallback();
                        setTimeout(next, 10);
                    });
                } else {
                    _end();
                }
            };
            next();
        })


    }

    unloadscene() {
        this.clear();
    }
    newTint(_tint) {
        this.tint = _tint;
        map.setTint(this.tint);
        // ITEARATE ALL DESTRUCTIBLES
        for (let i in this.childrenList) {
            if (this.childrenList[i].constructor.name == "Destructible") {
                this.childrenList[i].sprite.setTint(_tint);
            }
        }
    }
    reload() {
        this.unloadscene();

        setTimeout(() => {
            for (let keymap in BD.MAPS) {
                Stage.init(BD.MAPS[keymap]);
            }

            this.init();
        }, 10);
    }
    loadStage() {
        let mapname = this.currentMap.name;
        for (let i in Stage[mapname]) {
            this.addChild(Stage[mapname][i]);
        }
    }


    interactAtPosition(cell) {
        if (this.canInteract) {
            let cellKey = cell.join("-");
            if (this.currentMap.interaction.hasOwnProperty(cellKey)) {
                let _interaction = this.currentMap.interaction[cellKey];
                _interaction.cellKey = cellKey;
                Interactions[_interaction.action](_interaction);
                return true;
            }
        }
        return false;
    }
    loadMap(mapname, playerAtPosition) {
        return new Promise((_resolve) => {
            if (BD.MAPS.hasOwnProperty(mapname)) {
                this.canInteract = false;
                this.currentMap = BD.MAPS[mapname];
                this.currentMap.bounds = {
                    width: this.currentMap.json.cols * this.currentMap.json.gridsize,
                    height: this.currentMap.json.rows * this.currentMap.json.gridsize,
                    gridSize: this.currentMap.json.gridsize
                };
                this.unloadscene();
                BD.MAPS[mapname].onReady.then(() => {
                    overmap.set(BD.MAPS[mapname].json, [2])
                    return map.set(BD.MAPS[mapname].json, [0, 1]);
                }).then(() => {

                    pj.x = playerAtPosition[0] * map.gridsize + map.gridsize / 2;
                    pj.y = playerAtPosition[1] * map.gridsize + map.gridsize / 2;

                    this.addChild(overmap);
                    this.addChild(pj);
                    this.addChild(map);
                    this.loadStage();
                    fixedCameratoEntiy = map.center;
                    if (this.currentMap.event) {
                        try {
                            if (Events.hasOwnProperty(this.currentMap.event.name)) {
                                Events[this.currentMap.event.name](this, this.currentMap.event);
                            } else {
                                console.log("NOT ", this.currentMap.event.name)
                            }
                        } catch (e) {
                            console.warn(e);
                        }
                    }

                    setTimeout(() => {
                        this.canInteract = true;
                    }, 500); 
                    _resolve();
                });
            } else {
                _resolve();
            }
        })
    }
    init() {
        map.tint = this.tint;
        overmap.dom.style.zIndex = 999;
        this.loadMap("m2-2", [7, 10]);
    }

}


