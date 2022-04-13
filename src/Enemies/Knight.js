
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

    const projectileshot = {
        dom: document.createElement("div"),
        size: 6,
        speed: 2,
        range: 10 * BD.GRIDSIZE
    };
    projectileshot.dom.classList.add("shot")

    let playerOnAxis = () => {
        // PLAYER SAME AXIS AT FACING.
        let player_cell = getPlayer().getCell();
        let me_cell = this.getCell();

        return (player_cell[0] == me_cell[0]) || (player_cell[1] == me_cell[1]);

    };

    let getAttackDamage = () => {
        return this.info.attack || 1;
    }
    /**
     *  MOVE 3 STEPS AND SHOT
     *  IF PLAYER ON SIGHT SHOT
     *  
     */

    let stateMachine = {
        state: "idle",
        ready: true,
        idle: () => {
            this.doAnimation("idle");
            if (playerOnAxis()) {
                // VALIDATE IF CAN ENGAGE
                stateMachine.state = "engage";
            } else {
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
            let maxIterations = 5;
            let max = 2;
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
                this.followPathTo(targetCell, () => {
                    // onStep
                    if (playerOnAxis()) {
                        return false;
                    } else {
                        return true;
                    }

                }).then(() => {
                    stateMachine.ready = true;
                    // JSUT SHOT TO THE AIR
                    stateMachine.state = "attack";
                });
            }

        },

        engage: () => {
            // ROTATE
            let player = getPlayer();
            this.facing = this.calcDirection(player);

            stateMachine.state = "attack";
        },
        attack: () => {
            // ON SAME COORDS DO ATTACK.
            stateMachine.ready = false;



            this.doAnimation("attack", () => {
                // SHOT
                let dir = Character.FACETODIRVALUES[this.facing];
                 
                let p = createProjectile({
                    x: this.x,
                    y: this.y
                }, {
                    x: this.x + (dir[0] * projectileshot.range),
                    y: this.y + (dir[1] * projectileshot.range)
                }, projectileshot.dom.cloneNode(false),
                    projectileshot.size,
                    projectileshot.speed);


                p.onTouch((_touched) => {
                    _touched = _touched.filter((_ent) => {
                        return _ent.hit != null && _ent.constructor.name == "Player";
                    });
                    if (_touched.length > 0) {
                        for (let i in _touched) {
                            _touched[i].hit(getAttackDamage(), this);
                        }
                        //  p.destroy();
                    }
                });
                stateMachine.ready = true;
                stateMachine.state = "idle";
            });


        }
    };
    this.onHit = () => {
        stateMachine.state = "engage";
        stateMachine.ready = true;
    };
    this.StateMachineBehavior(stateMachine);

}
export default class ShotSlime extends Enemy {
    constructor(initParams) {

        super("knight", initParams);
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