import jsGame from "./jsGame.js";

///
window.TIMEOUT_HITTESTPOINT = 22;
window.VISIBLE_HITTESTPOINT = true;


var currentScene = null, map = { gridsize: 16 };

function setCurrentScene(_scene) {
    currentScene = _scene;
    window.$currentScene = _scene;
}
function setMap(_map) {
    map = _map;
}
function getCurrentScene() {
    return currentScene;
}
function getGridSize() {
    return map.gridsize;
}
function getCellPosition(px, py) {
    return [parseInt(px / map.gridsize), parseInt(py / map.gridsize)];

}
function cellToPosition(cx, cy) {
    return {
        x: (cx * map.gridsize) + map.gridsize / 2,
        y: (cy * map.gridsize) + map.gridsize / 2
    }
}
function mapCellWalkable(px, py) {

    let [x, y] = getCellPosition(px, py);
    return isCellWalkable(x, y);
}
function isCellWalkable(x, y) {
    if (map.hittest != null && map.hittest.hasOwnProperty(x + "-" + y)) {
        return false;
    }

    if (x < 0 || y < 0) {
        return false;
    }
    if (x > map.columns - 1 || y > map.rows - 1) {
        return false;
    }
    return true;
}

////////////////////////////////////////////////////////////////////////////////////
function maphittest(nx, ny) {
    // CALCULATE EACH SIDE 
    let blocked = false;
    let test = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let i in test) {
        if (!mapCellWalkable(nx + test[i][0], ny + test[i][1])) {
            blocked = true;
            break;
        }
    }
    return blocked;
};
////////////////////////////////////////////////////////////////////////////////////////
function visualDom(p, size, cname, _parent) {
    let div = document.createElement("div");
    div.className = cname;
    _parent.appendChild(div);
    assingProperties(div.style, {
        position: "absolute",
        top: p.y + "px",
        left: p.x + "px",
        width: size + "px",
        height: size + "px",
        borderRadius: "50%",
        // backgroundColor: "red",
        border: "thin solid yellow",
        zindex: 999
    });
    return {
        _parent,
        dom: div,
        width: size,
        height: size,
        x: p.x,
        y: p.y,
        getCenter: function () {
            return {
                x: p.x + size / 2,
                y: p.y + size / 2,
                width: size,
                height: size
            }
        },
        remove: function () {
            div.remove();
        }
    }
}
function addpoint(p, rad, cname, dom) {

    let div = document.createElement("div");

    div.className = cname;
    dom.appendChild(div);
    assingProperties(div.style, {
        position: "absolute",
        top: p.y + "px",
        left: p.x + "px",
        width: rad + "px",
        height: rad + "px",
        border: "thin solid",
        zindex: 999
    });
    return div;
}
window.addpoint = addpoint;

////////////////////////////////////////////////////////////////////////////////////
function createAreaDamage(p, size, timeLife = 1) {
    let entity = visualDom({
        x: p.x - size / 2,
        y: p.y - size / 2
    }, size, "area-damage", currentScene.dom);

    setTimeout(() => {
        entity.remove();
    }, timeLife);
    return hitttestAnythingAt(entity)

}
//////////////////////////////////////////////////////////////////////////////////////
function HitArea(at, direction, vertical, horizontal) {
    let maxSize = getGridSize();
    let p = {
        x: at.x - maxSize / 2,
        y: at.y - maxSize / 2
    };

    let points = [];
    ////  
    [maxSize].forEach((n) => {
        let center = {
            y: (p.y + (direction[1] * n)),
            x: (p.x + (direction[0] * n))
        };

        points.push(center);

        if (vertical != null && vertical > 0) {
            let n = 0;
            while (n < vertical) {
                n++;
                let m = maxSize * n;
                points.push({
                    y: center.y - m,
                    x: center.x
                });
                points.push({
                    y: center.y + m,
                    x: center.x
                });
            }
        }


        if (horizontal != null && horizontal > 0) {
            let n = 0;
            while (n < horizontal) {
                n++;
                let m = maxSize * n;
                points.push({
                    y: center.y,
                    x: center.x - m
                });
                points.push({
                    y: center.y,
                    x: center.x + m
                });

            }
        }
    });

    let touched = {};

    points.forEach((p) => {
        let touch = (hitttestAnythingAt({
            x: p.x,
            y: p.y,
            width: maxSize,
            height: maxSize
        }));

        touch.forEach((_ent) => {
            if (!touched[_ent.$ID]) {
                touched[_ent.$ID] = _ent;
            }
        });
        if (VISIBLE_HITTESTPOINT) {
            addpoint(p, maxSize, "test-point", currentScene.dom)
        }
    });
    if (VISIBLE_HITTESTPOINT) {
        setTimeout(() => {
            document.querySelectorAll(".test-point").forEach((_d) => {
                _d.remove();
            })
        }, TIMEOUT_HITTESTPOINT);
    }
    return [points, touched];

}

///////////////////////////////////////////////////////////////////////////////////////
function hitttestAnythingAt(body) {

    let touch = [];
    let Bodycenter = body.getCenter();
    currentScene.childrenList.forEach((_child) => {
        if (!_child.getCenter) {
            // -- console.warn(_child,"cant bodyhit")
        } else if (jsGame.bodyHittest(Bodycenter, _child.getCenter())) {
            touch.push(_child)
        }
    });



    return touch;


};

//////////////////////////////////////////////////////////////////////////////////////
function getCellAt(p) {
    let [x, y] = getCellPosition(p.x, p.y);
    return [x, y];
};

function getAnythingAtCells(points) {
    let touch = [];
    let celltouched = {};
    for (let i in points) {
        let [x, y] = getCellPosition(points[i].x, points[i].y);
        celltouched[x + "-" + y] = 1;
    }

    currentScene.childrenList.forEach((_child) => {
        let [x, y] = getCellPosition(_child.x, _child.y);
        if (celltouched.hasOwnProperty(x + "-" + y)) {
            touch.push(_child)
        }
    });

    return touch
};
/////////////////////////////////////////////////////
function getMapSize() {
    return currentScene.currentMap.bounds;
}
//////////////////////////////////////////////////////////////////////////////////////
window.getCurrentScene = getCurrentScene;
export default {
    setCurrentScene, setMap, getCurrentScene,
    //////////////// 
    maphittest,
    getAnythingAtCells,
    getCellAt, 
    HitArea,
    hitttestAnythingAt,
    getMapSize,
    isCellWalkable,
    cellToPosition,
    getCellPosition, 
    getCurrentScene,
    getGridSize,
    createAreaDamage

}