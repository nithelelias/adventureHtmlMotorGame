import BD from "../BD.js";
import Character from "../Character.js";
import jsGame from "../jsGame.js";
import mapFunctions from "../mapFunctions.js";
import pathFind from "../pathFind.js";
const getPlayer = () => mapFunctions.getCurrentScene().getPlayer();
export default class Enemy extends Character {
    constructor(enemyKeyId, initParams) {
        super(BD.ENEMYS[enemyKeyId].sprite);
        this.info = BD.ENEMYS[enemyKeyId];
        this.life = this.info.life || 1;
        assingProperties(this, initParams);
        this.addClass("Enemy stand-animation");
    }
    showAlertIcon(iconname, timeout) {
        let alerticon = new jsGame.SpriteMap(BD.ALERTICON.url,
            BD.ALERTICON.x,
            BD.ALERTICON.y,
            BD.ALERTICON.maxwidth,
            BD.ALERTICON.maxheight,
            BD.ALERTICON.width,
            BD.ALERTICON.height
        );
        alerticon.animationControl = null;
        alerticon.frame = (BD.ALERTICON.iconframes[iconname]);
        alerticon.x = -parseInt(this.sprite.width * .5) + (random(-12, 12));//32/4
        alerticon.y = -this.sprite.height + (random(-12, 3));//32/2
        alerticon.dom.classList.add("animated")
        alerticon.dom.classList.add("bounceIn")
        this.addChild(alerticon);
        return new Promise((_resolve) => {
            setTimeout(() => {

                alerticon.dom.classList.remove("bounceIn")
                alerticon.dom.classList.add("bounceOut")
                setTimeout(() => {
                    this.removeChild(alerticon);

                }, 600)
                _resolve();
            }, timeout)
        })

    }
    validateDistanceToPlayer(maxdist) {
        // IF PLAYER IS ON AGRO AREA 
        let player = getPlayer();
        if (player.isAlive()) {
            let dist = calcDistance(player, this);
            return dist <= maxdist;
        } else {
            return false;
        }
    };
    StateMachineBehavior(statemachine) {

        let tick = 0;
        statemachine.ready = true;
        let stateMachineLoopFn = async () => {
            if (statemachine.ready) {
                //console.log("STATEM", statemachine.state);
                statemachine[statemachine.state]();
            }
        };

        this.onRun = () => {
            if (this.life > 0) {
                this.hitPlayerOnTouch();
                tick++;
                if (tick > 12) {
                    stateMachineLoopFn();
                    tick = 0;
                }
            }
        };

    }
    hitPlayerOnTouch() {
        if (this.validateDistanceToPlayer(this.sprite.width * .4)) {
            // PLAYER HITTED
            getPlayer().hit(this.info.attack || 1, this);
        }
    }
    doAnimation(name, _callback = () => { }) {
        if (this.info && this.info.animations && this.info.animations.hasOwnProperty(name)) {
            this.sprite.animationControl.setFrames(this.info.animations[name], _callback);
        } else {
            this.sprite.animationControl.setFrames([0, 0, 0], _callback);
        }
    }
    pathFind() {
        return pathFind(...arguments);
    }
    persuitEntity(entity, onStep) {
        return new Promise((end) => {
            let currentCell = this.getCurrentCellMap();
            let targetCell = mapFunctions.getCellAt(entity);
            let path = pathFind({ x: currentCell[0], y: currentCell[1] }, { x: targetCell[0], y: targetCell[1] }, mapFunctions.isCellWalkable);
            let step = () => {
                if (path.length > 0) {
                    let celltogo = path.shift();
                    let p = mapFunctions.cellToPosition(celltogo[0], celltogo[1]);
                    this.facing = this.calcDirection(p);
                    this.moveTo(p.x, p.y).then(() => {
                        if (onStep != null) {
                            if (onStep()) {
                                step();
                            } else {
                                end();
                            }
                        } else {
                            step();
                        }
                    });
                } else {
                    end();
                }
            };
            if (path) {
                step();
            } else {
                end();
            }
        })
    }
    followPathTo(targetCell, onStep) {
        return new Promise((end) => {
            let currentCell = this.getCurrentCellMap();
            let path = pathFind({ x: currentCell[0], y: currentCell[1] }, { x: targetCell[0], y: targetCell[1] }, (cellX, cellY) => {
                return mapFunctions.isCellWalkable(cellX, cellY);
            });
            let step = () => {
                if (path.length > 0) {
                    let celltogo = path.shift();
                    let p = mapFunctions.cellToPosition(celltogo[0], celltogo[1]);
                    this.facing = this.calcDirection(p);
                    this.moveTo(p.x, p.y).then(() => {
                        if (onStep != null) {
                            if (onStep()) {
                                step();
                            } else {
                                end();
                            }
                        } else {
                            step();
                        }
                    });
                } else {
                    end();
                }
            };
            if (path) {
                step();
            } else {
                end();
            }
        })
    }
    moveTo(x, y) {
        this.doAnimation("moving");
        return this.moveControl.moveTo(x, y).then(() => {
            if (!this.moveControl.ismoving) {
                this.doAnimation("idle");
            }
            return 1;
        });
    };
    destroyAnimation() {
        return new Promise(() => {
            this.removeClass("stand-animation")
            this.doAnimation("die", () => {
                this.sprite.animationControl.stop();
            });
        })
    }
}