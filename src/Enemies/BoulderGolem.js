import jsGame from "../jsGame.js";
import mapFunctions from "../mapFunctions.js";
import Boulder from "./Boulder.js";
import Enemy from "./Enemy.js";
const getPlayer = () => mapFunctions.getCurrentScene().getPlayer();


function Behavior() {

    let wait = 0;
    let selectedAxis = null;
    let selectedCellX = null;
    let stateMachine = {
        state: "idle",
        ready: true,

        idle: () => {

            this.doAnimation("idle");

            if (selectedAxis == null) {
                stateMachine.state = "selectX";
            } else {

                let currentCell = this.getCurrentCellMap();
                if (selectedCellX == currentCell[0]) {
                    stateMachine.state = "attack";
                } else {
                    stateMachine.state = "persuit";
                }
            }

        },
        selectX: () => {
            let cell = this.getCurrentCellMap();
            let nx = cell[0] + random(-3, 3);

            if (mapFunctions.isCellWalkable(nx, cell[1])) {
                let p = mapFunctions.cellToPosition(nx, cell[1])
                selectedCellX = nx;
                selectedAxis = p.x;
                stateMachine.state = "persuit";
            }
        },
        wait: () => {
            if (wait > 0) {
                wait -= 1;
            } else {
                stateMachine.state = "idle";
            }
        },
        persuit: () => {
            stateMachine.ready = false;
            // PERSUIT TARGET AT SAME X COORDS
            this.moveTo(selectedAxis, this.y).then(() => {
                stateMachine.ready = true;
                stateMachine.state = "attack";
            })
        },
        attack: () => {
            stateMachine.ready = false;
            // THROW ATTACK FOR NOW LEST DO JUMP
            this.doAnimation("idle");

            let b = new Boulder({
                x: this.x, y: this.y
            });
            this._parent.addChild(b);
            setTimeout(() => {
                b.jump();
                this.jump();
                setTimeout(() => {
                    b.throw(getPlayer().x, getPlayer().y + 8);
                    selectedAxis = null;
                    stateMachine.state = "wait";
                    stateMachine.ready = true;
                }, 300);
            }, 100);
        }
    };
    this.StateMachineBehavior(stateMachine);

}
export default class BoulderGolem extends Enemy {
    constructor(initParams) {
        super("golem", initParams);
        Behavior.call(this);
        window.$golem = this;
    }

}