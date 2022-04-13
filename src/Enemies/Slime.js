import BD from "../BD.js";
import jsGame from "../jsGame.js";
import mapFunctions from "../mapFunctions.js";
import Enemy from "./Enemy.js";


const getPlayer = () => mapFunctions.getCurrentScene().getPlayer();

function Behavior() {
    let onagro = false;
    let getAgroDistance = () => {
        return (this.info.agro_cell_distance ) * mapFunctions.getGridSize();
    };
    let getAttackRange = () => {
        return (this.info.range_cell_attack ) * mapFunctions.getGridSize();;
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
            this.followPathTo(mapFunctions.getCellAt(getPlayer())).then(() => {
                stateMachine.ready = true;
                stateMachine.state = "idle";
            });
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
            let player =  getPlayer();
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
export default class Slime extends Enemy {
    constructor(initParams) {
         
        super("slime", initParams);
        Behavior.call(this);
    }

}