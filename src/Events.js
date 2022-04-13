import Destructible from "./Destructible.js"; 
import jsGame from "./jsGame.js";
import mapFunctions from "./mapFunctions.js";


function createBlockRoad(x, y) {
    let keyposition = x + "-" + y;
    map.hittest[keyposition] = 1;
    let gridSize = mapFunctions.getGridSize()
    let dest = new Destructible(x * gridSize, (y - 1) * gridSize, "blockroad");
    dest.onDestroy(() => {
        delete map.hittest[keyposition];
    });
    dest.dom.style.overflow = "hidden";
    dest.sprite.y = 70;
    dest.ready = false;
    dest.onReady = new Promise((_resolve) => {
        dest.onEnterFrame = () => {
            if (!dest.ready) {
                if (dest.sprite.y > 0) {
                    dest.sprite.y--;
                } else {
                    dest.ready = true;
                    _resolve();
                }
            }
        };
    })
    return dest;

}

 
export default {   };