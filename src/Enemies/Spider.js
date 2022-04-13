
import BD from "../BD.js";
import Character from "../Character.js";
import Projectile from "../Projectile.js";
import mapFunctions from "../mapFunctions.js";

import Enemy from "./Enemy.js";

const getPlayer = () => mapFunctions.getCurrentScene().getPlayer();

function createProjectile(from, to, dom, size, speed = 1) {
    // CREATE A PROJECTILE FROM POSITION UNTIL TO POSITION. 
    return mapFunctions.getCurrentScene().addChild(Projectile.create(from, to, dom, size, speed));
}

function Behavior() {
    let onagro = false;
    let getAgroDistance = () => {
        return (this.info.agro_cell_distance) * mapFunctions.getGridSize();
    };
    let getAttackRange = () => {
        return (this.info.range_cell_attack) * mapFunctions.getGridSize();;
    };
    let getAttackDamage = () => {
        return this.info.attack || 1;
    }


    let stateMachine = {
        state: "idle",
        ready: true,
        idle: () => {
            this.doAnimation("idle");
            if (this.validateDistanceToPlayer(getAgroDistance())) {
                // VALIDATE IF CAN ENGAGE
                stateMachine.state = "engage";
            } else {
                onagro = false;
                stateMachine.state = "freemove";
            }
        },
        freemove: () => {
            // LOCK STATE MACHIN ON THIS STATE.
            stateMachine.ready = false;
            // MOVE FREELY.
            let currentCell = mapFunctions.getCellAt(this);
            let targetCell = [0, 0];
            // GET A NEAR GRID TO MOVE MAX 5 DISTANCE.
            let maxIterations = 10;
            let max = 3;
            while (maxIterations > 0) {
                maxIterations--;
                let rndX = random(-max, max);
                let rndY = random(-max, max);
                targetCell = [rndX + currentCell[0], rndY + currentCell[1]];
                if (mapFunctions.isCellWalkable(targetCell[0], targetCell[1])) {
                    break;
                } else {
                    targetCell = null;
                }
            }

            if (maxIterations <= 0) {
                stateMachine.ready = true;
                stateMachine.state = "idle";
                return;
            } else {

                stateMachine.ready = false;
                this.followPathTo(targetCell).then(() => {
                    stateMachine.ready = true;
                    stateMachine.state = "idle";
                });
            }

        },
        persuit: () => {
            // PERSUIT TARGET AT SAME X COORDS
            stateMachine.ready = false;
            let currentCell = this.getCurrentCellMap();
            let targetCell = mapFunctions.getCellAt(getPlayer());
            let path = this.pathFind({ x: currentCell[0], y: currentCell[1] }, { x: targetCell[0], y: targetCell[1] }, (cellX, cellY) => {
                return mapFunctions.isCellWalkable(cellX, cellY);
            });
            if (path != null && path.length > 0) {
                this.doAnimation("moving");
                let celltogo = path.shift();
                let p = mapFunctions.cellToPosition(celltogo[0], celltogo[1]);
                this.facing = this.calcDirection(p);
                //this.sprite.animationControl.maxticks = 3;
                this.moveControl.stepsize = 2;
                this.moveTo(p.x, p.y).then(() => {
                    stateMachine.ready = true;
                    if (this.validateDistanceToPlayer(getAttackRange())) {
                        this.sprite.animationControl.maxticks = 6;
 
                        stateMachine.state = "attack";
                    }

                });
            } else {
                stateMachine.ready = true;
                stateMachine.state = "engage";
            }
        },
        engage: () => {
            if (!onagro) {
                onagro = true;
                stateMachine.state = "agroreveal";
                return;
            }
            // IF IS ON RANGE DO ATTACK IF NOT GO TO PERSUIT.
            if (this.validateDistanceToPlayer(getAttackRange())) {
                stateMachine.state = "attack";
            } else {
                stateMachine.state = "persuit";
            }
        },
        agroreveal: () => {
            this.doAnimation("idle");
            stateMachine.ready = false;
            this.showAlertIcon("alarm", 1000).then(() => {

                stateMachine.state = "engage";
                stateMachine.ready = true;

            });
        },
        attack: () => {
            // ON SAME COORDS DO ATTACK.
            stateMachine.ready = false;

            let damage = getAttackDamage();
            let direction = [0, 0], vertical = 1, horizontal = 1;
            let player = getPlayer();
            this.facing = this.calcDirection(player);
            let animationEnd = false;
            let timeoutid = setTimeout(() => {
                if (!animationEnd && stateMachine.state == "attack") {
                    // IT WAS INTERRUPTED
                    stateMachine.state = "idle";
                    stateMachine.ready = true;
                }
            }, 1500);
            this.doAnimation("attack", () => {
                // IF INTERRUPTED THIS WILL NOT BE TRIGGER !!!!
                animationEnd = true;
                let touched = mapFunctions.createAreaDamage(this, mapFunctions.getGridSize() * 2, 100);
                for (let index in touched) {
                    if (touched[index].$ID != this.$ID && touched[index].hit != null) {
                        touched[index].hit(damage, this);
                    }
                }

                stateMachine.state = "idle";
                stateMachine.ready = true;
                clearTimeout(timeoutid);
            });


        }
    };
    this.onHit = () => {
        stateMachine.state = "engage";
        stateMachine.ready = true;
    }
    this.StateMachineBehavior(stateMachine);

}
export default class Spider extends Enemy {
    constructor(initParams) {

        super("spider", initParams);

        Behavior.call(this);
    }
    onEnterFrame() {

        if (this.facing == "right") {
            this.sprite.rotation = -90;
        } else if (this.facing == "left") {
            this.sprite.rotation = 90;
        } else if (this.facing == "up") {
            this.sprite.rotation = 180;
        } else if (this.facing == "down") {
            this.sprite.rotation = 0;
        }
    }
}