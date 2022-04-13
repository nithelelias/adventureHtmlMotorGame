import Effects from "./Effects.js";
import Character from "./Character.js";
import jsGame from "./jsGame.js";
import mapFunctions from "./mapFunctions.js";
import Bomb from "./Bomb.js";
import Projectile from "./Projectile.js";
const STATES = {
    idle: 0,
    moving: 1,
    running: 2,
    attacking: 3,
    wait: 4,
    dashing: 5,
    blocking: 6,
    pick: 7,
    die: 99
};
const SWORD_SPRITE = {
    url: "resources/char.png",
    x: 0,
    y: 64,
    size: 16,
    maxwidth: 32,
    maxheight: 16
};
const SHIELD_SPRITE = {
    url: "resources/char.png",
    x: 0,
    y: 80,
    size: 16,
    maxwidth: 32,
    maxheight: 16
}
const PLAYER_SPRITE = {
    url: "resources/char.png",
    x: 0,
    y: 0,
    maxwidth: 112,
    maxheight: 96,
    width: 16,
    height: 16
};
const ANIMATIONS = {
    /// down
    "down-stand": [0],
    "down-walk": [1, 0, 2, 0],
    "down-run": [1, 2],
    "down-attack": [3, 3, 3, 4],
    "down-pick": [5],
    "down-block": [6],
    "down-movblock": [6, 1, 6, 2],

    /// up+
    "up-stand": [7],
    "up-walk": [8, 7, 9, 7],
    "up-run": [8, 9],
    "up-attack": [10, 10, 10, 11],
    "up-pick": [12, 12, 12, 12],
    "up-block": [13],
    "up-movblock": [13, 8, 13, 9],
    // RIGHT
    "right-stand": [14],
    "right-walk": [15, 14, 16, 14],
    "right-run": [15, 16],
    "right-attack": [17, 17, 17, 18],
    "right-pick": [19],
    "right-block": [20],
    "right-movblock": [20, 15, 20, 16],
    /// LEFT
    "left-stand": [21],
    "left-walk": [22, 21, 23, 21],
    "left-run": [22, 23],
    "left-attack": [24, 24, 24, 25],
    "left-pick": [26],
    "left-block": [27],
    "left-movblock": [27, 22, 27, 23]
};
const ANIMATIONSBYSTATE = {
    0: "-stand",
    1: "-walk",
    2: "-run",
    3: "-attack",
    4: "-stand",
    6: "-block",
    7: "-pick"
};

function createProjectile(from, to, dom, size, speed = 1) {
    return mapFunctions.getCurrentScene().addChild(Projectile.create(from, to, dom, size, speed));
}
function LIGHTTEST() {
    var light = document.createElement("div");
    light.green = function () {
        this.style.backgroundColor = "green";
    };
    light.red = function () {
        this.style.backgroundColor = "red";
    }
    assingProperties(light.style, {
        position: "fixed",
        top: "20px",
        left: "20px",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        zIndex: 10
    });
    document.body.appendChild(light);
    return light;
}


function stateMachine(onStateChange) {
    this.state = STATES.idle;

    this.setState = function (_newstate) {
        this.state = _newstate;
        onStateChange(_newstate);
    };
}

function SmoothMoveControl() {


    let held_direction = [0, 0];
    this.moving_direction = ["none", "none"];
    let lastActiveDir = [0, 0];
    let revolutionspeed = 0;
    let active = false;
    let accelerating = false;
    let validateActive = () => {
        active = this.moving_direction[0] != "none" || this.moving_direction[1] != "none";

    }
    let stateToMov = () => {
        if (this.state != STATES.blocking) {

            this.setState(revolutionspeed < 3 ? STATES.moving : STATES.running);
            this.putCSSAnimation("move-animation");
        }
    }
    let showParticle = (nd) => {
        if (lastActiveDir.join("") != held_direction.join("")) {
            // CREATE PARTICLE UNTIL NORMALIZATE DIRECTION
            Effects.particleDust(mapFunctions.getCurrentScene(),
                this.x + (this.stepwalkSize * held_direction[0]),
                this.y + this.height * .2, Character.FACETODIRVALUES[this.facing]);
        }
    }
    this.moveX = function (dx) {

        this.moving_direction[0] = dx == 0 ? "none" : dx > 0 ? "right" : "left";
        if (this.state == STATES.attacking) {
            //  doFastMove.call(this, dx, 0);
            return;
        }

        held_direction[0] = dx;
        validateActive();
    }
    this.moveY = function (dy) {
        this.moving_direction[1] = dy == 0 ? "none" : dy > 0 ? "down" : "up";
        if (this.state == STATES.attacking) {
            // doFastMove.call(this, 0, dy);
            return;
        }
        held_direction[1] = dy;
        validateActive();
    };
    this.speedUp = function () {

        accelerating = true;

    }
    this.slowDown = function () {
        accelerating = false;
    }
    this.moveControl.onStop(() => {
        held_direction = [0, 0];
    })
    this.moveControl.doFastMove = (dx, dy) => {
        doFastMove.call(this, dx, dy);
    };
    function doFastMove(dx, dy) {
        let x = parseInt(this.x + (this.stepwalkSize * dx));
        let y = parseInt(this.y + (this.stepwalkSize * dy));
        this.moveControl.stepsize = 3
        return this.moveControl.moveTo(x, y)
    }
    function domove(dx, dy) {
        if (revolutionspeed > 2) {
            this.moveControl.stepsize = 1.5;
            this.stepwalkSize = 8;
        } else {
            this.stepwalkSize = 4;
            this.moveControl.stepsize = 1;
        }
        let x = parseInt(this.x + (this.stepwalkSize * dx));
        let y = parseInt(this.y + (this.stepwalkSize * dy));
        this.moveControl.moveTo(x, y).then(() => {
            held_direction = [0, 0];
        })
    }
    this.smothmoveloop = function () {
        if (this.state == STATES.dashing) {
            return;
        }
        if (!active) {

            if (!this.moveControl.ismoving && (this.state === STATES.running || this.state === STATES.moving)) {
                if (revolutionspeed === 0) {
                    if (this.state != STATES.blocking) {
                        this.setState(STATES.idle);
                    }
                } else {
                    stateToMov();
                }
            }
        }

        if (accelerating && active) {
            if (revolutionspeed < 3) {
                revolutionspeed += 0.09;
            }
        } else {
            if (revolutionspeed > 1) {
                revolutionspeed *= (held_direction[0] == 0 && held_direction[1] == 0 && !this.moveControl.ismoving) ? 0.5 : 0.98;
            } else if (revolutionspeed > 0) {
                revolutionspeed = 0;
            }
        }
        if (held_direction[0] != 0 || held_direction[1] != 0) {

            showParticle();

            lastActiveDir = [].concat(held_direction);
            stateToMov();
            domove.call(this, held_direction[0], held_direction[1]);
        }

    }

}

function AttacksControl() {
    this.canCircleattack = false;
    let gridSize;
    let combo = 0;
    let timeoutCombotimeout;
    this.cooldowns.bomb = 0;
    let getRange = () => {
        let projecti_size = 16;
        let _distance = .8;
        let range = (parseInt(gridSize / 2) * _distance) + (projecti_size);
        return range;
    }
    let attackEnd = () => {
        this.setState(STATES.wait);
        this.sprite.animationControl.maxticks = 6;
    }
    this.putBomb = () => {
        if (this.cooldowns.bomb == 0) {
            let b = new Bomb({
                x: this.x,
                y: this.y
            });
            mapFunctions.getCurrentScene().addChild(b);
            this.cooldowns.bomb=30;
        }
    };
    this.attack = () => {
        if (this.state === STATES.attacking || this.state === STATES.blocking) {
            return;
        }
        combo++;
        this.moveControl.stop();
        this.setState(STATES.attacking);
        gridSize = mapFunctions.getGridSize();

        swordInFront(combo == 1 || combo % 4 == 0 ? 0 : (combo % 2 ? 1 : -1));

        clearTimeout(timeoutCombotimeout);
        timeoutCombotimeout = setTimeout(() => {
            combo = 0;
        }, 500);
    }
    let putSword = (spawn, until) => {
        let p = createProjectile(spawn, until, this.sword.dom.cloneNode(false),
            this.sword.size,
            this.sword.speed);

        // FOR NOW ONLY 
        setTimeout(() => {
            attackEnd();
        }, Math.max(60, 300 - (combo * 10)));


        p.onTouch((_touched) => {
            _touched = _touched.filter((_ent) => {
                return _ent.hit != null && _ent.$ID !== this.$ID;
            });
            if (_touched.length > 0) {
                for (let i in _touched) {
                    _touched[i].hit(this.getAttackDamage(), this);
                }
                //  p.destroy();
            }
        });
        return p;
    }
    let getDir = () => {

        return Character.FACETODIRVALUES[this.facing];
    };
    ///
    let swordInFront = (_vary) => {
        // CREATE PROJECTILE      
        this.sword.draw();
        let range = getRange();
        let dir = getDir();
        let _varySide = _vary ? (parseInt((range * .5)) * _vary) : 0;
        let p = putSword({
            x: this.x,
            y: this.y
        }, {
            x: this.x + (dir[0] * range) + (_vary ? (dir[1] * _varySide) : 0),
            y: this.y + (dir[1] * range) + (_vary ? (dir[0] * _varySide) : 0)
        });
        return p;
    };


    let circleAttack = () => {
        this.sword.draw();
        let range = getRange();
        let dir = getDir();
        let circlepositions = [
            // UP
            [0, -1, 270, "up"],
            // UPLEFT
            [-1, -1, 260, "up"],
            // LEFT
            [-1, 0, 180, "left"],
            // DOWNLEFT
            [-1, 1, 165, "left"],
            //DOWN
            [0, 1, 90, "down"],
            //DOWNRIGHT
            [1, 1, 85, "down"],
            // RIGHT
            [1, 0, 0, "right"],
            // upRIGHT
            [1, -1, -25, "right"]
        ];
        let cutfrom = ({ "0-1": 0, "-10": 2, "01": 4, "10": 6 })[dir.join("")];
        circlepositions = (circlepositions.splice(cutfrom)).concat(circlepositions);
        circlepositions.push(circlepositions[0]);
        ///
        let p = putSword({
            x: this.x,
            y: this.y
        }, {
            x: this.x + (dir[0] * range),
            y: this.y + (dir[1] * range)
        });
        p.onDestroy = () => {
            if (circlepositions.length == 0) {
                attackEnd();
                return;
            }
            let nt = circlepositions.shift();
            p.speed = this.sword.speed * 3;
            p.reTarget({
                x: this.x + (nt[0] * range / 2),
                y: this.y + (nt[1] * range / 2)
            });
            this.facing = Character.DIRECTION[nt[3]];
            this.sprite.animationControl.setFrames(ANIMATIONS[this.facing + "-attack"]);
            p.dom.style.transform = `rotate(${nt[2]}deg)`;
        };

    }

}
function BlockingControl() {
    let ismoveblocking = false;
    this.block = () => {
        if (this.state != STATES.blocking) {
            this.setState(STATES.blocking);
        }

        if (ismoveblocking) {
            this.setAnimation(this.facing + "-movblock", true);
        } else {
            this.setAnimation(this.facing + ANIMATIONSBYSTATE[STATES.blocking]);
        }

    };
    this.moveBlocking = () => {
        // IS MOVING 
        if (!ismoveblocking) {
            ismoveblocking = true;

        }
    };
    this.noMoveBlocking = () => {
        if (ismoveblocking) {
            ismoveblocking = false;


        }
    }
    this.unblock = () => {
        ismoveblocking = false;
        this.setState(STATES.idle);
    };
    this.onBlocked = () => {
        Effects.dustBoom(mapFunctions.getCurrentScene(),
            this.x,
            this.y, random(3, 10), [1, 3]);

    };
}
function DashControl() {

    // ON ENTERFRAME.
    let dashing = false;
    this.cooldowns.dash = 0;
    let calcJump = (dir) => {
        if (dashing) {
            return;
        }
        /// PARTICLE 
        Effects.dustBoom(mapFunctions.getCurrentScene(),
            this.x,
            this.y + this.height * .2, random(3, 10));
        //////
        this.invincible = true;
        this.moveControl.stop();
        delete this.keyPressListener["space"];
        dashing = true;
        this.setState(STATES.dashing);

        let maxdist = mapFunctions.getGridSize() * 2;
        let dist = 1;

        let pointer = {
            x: this.x + (dir[0] * dist),
            y: this.y + (dir[1] * dist),
        };
        // ITERATE UNTIL HITTST
        while (dist < maxdist) {

            if (!mapFunctions.maphittest(pointer.x,
                pointer.y)) {
                dist += 1;

                pointer = {
                    x: this.x + (dir[0] * dist),
                    y: this.y + (dir[1] * dist),
                };
            } else {
                pointer = {
                    x: this.x + (dir[0] * (dist - 1)),
                    y: this.y + (dir[1] * (dist - 1)),
                };
                break;
            }

        }
        this.silenceKeyListen();

        jumpTo(pointer.x, pointer.y).then(() => {
            //
            Effects.dustBoom(mapFunctions.getCurrentScene(),
                this.x,
                this.y + this.height * .2, 3);
            //
            this.unSilenceKeyListen();
            dashing = false;

            this.setState(STATES.idle);
            setTimeout(() => {
                this.invincible = false;
            }, 100);
        });

    };

    let jumpTo = (x, y) => {

        return new Promise((_resolve) => {
            let dx = (x - this.x);
            let dy = (y - this.y);
            let dom = this.dom;
            let tempTrans = "" + dom.style.transform;
            let actions = [() => {
                dom.style.transform = "";
                dom.style.transition = "transform .3s";
            }, () => {
                if (dy == 0) {
                    dom.style.transform = `translate3d(${dx / 2}px, ${dy / 2}px,0)  scale(1.9) rotate(${dx > 0 ? "" : "-"}610deg) `;
                } else {
                    dom.style.transform = `translate3d(${dx / 2}px, ${dy / 2}px,0)  scale(1.9) rotateX(${dy > 0 ? "-" : ""}200deg) `;
                }
            }, () => {
                dom.style.transition = "transform .2s";
                if (dy == 0) {
                    dom.style.transform = `translate3d(${dx}px, ${dy}px,0)    scale(1)  rotate(${dx > 0 ? "" : "-"}660deg) `;
                } else {
                    dom.style.transform = `translate3d(${dx}px, ${dy}px,0)    scale(1)   rotateX(${dy > 0 ? "" : "-"}460deg) `;
                }
            }, () => {
                dom.style.transition = "";
                dom.style.transform = tempTrans;
            }];
            let timesForActions = [10, 10, 100, 200]
            let end = () => {
                this.x = x;
                this.y = y;
                _resolve();
            };
            function nextAction() {
                if (actions.length > 0) {
                    setTimeout(() => {
                        (actions.shift())();
                        nextAction();
                    }, timesForActions.shift())
                } else {
                    end();
                }
            }

            nextAction();

        });
    };

    this.doJump = () => {
        if (this.cooldowns.dash > 0) {
            return;
        }
        if (!dashing) {
            let dir = [0, 0];
            if (this.keyPressListener.hasOwnProperty("arrowleft")) {
                dir[0] = -1;
            } else if (this.keyPressListener.hasOwnProperty("arrowright")) {
                dir[0] = 1;
            }
            if (this.keyPressListener.hasOwnProperty("arrowup")) {
                dir[1] = -1;
            } else if (this.keyPressListener.hasOwnProperty("arrowdown")) {
                dir[1] = 1;
            }
            if (dir.join("") != "00") {
                this.cooldowns.dash = 30;
                calcJump(dir);
            }
        }
    };


}


function MyKeyListener() {
    this.keyPressListener = {};
    let silenced = false;
    jsGame.ButtonListener.listen({
        release_any: (keycode) => {

            delete this.keyPressListener[keycode];
            //this.moveControl.stop();
            if (keycode == "arrowright" || keycode == "arrowleft") {
                this.moveX(0);
                if (this.moveControl.ismoving && this.moving_direction[1] != "none") {
                    this.faceAt(Character.DIRECTION[this.moving_direction[1]]);
                }
            } else if (keycode == "arrowdown" || keycode == "arrowup") {
                this.moveY(0);
                if (this.moveControl.ismoving && this.moving_direction[0] != "none") {
                    this.faceAt(Character.DIRECTION[this.moving_direction[0]]);
                }
            }
            // IS NO MOVING DIRECTIONAL
            if (Object.keys(this.keyPressListener).filter((a) => { return a.indexOf("arrow") > -1 }).length == 0) {

                if (this.state == STATES.blocking) {
                    this.noMoveBlocking();
                }
            }
        },
        press_any: (keycode) => {
            this.keyPressListener[keycode] = 1;
            if (keycode.indexOf("arrow") > -1) {
                if (this.state == STATES.blocking) {
                    this.moveBlocking();
                }
            }
        },
        press_arrowright: () => {
            this.moveX(1);
            this.faceAt(Character.DIRECTION.right);
        },
        press_arrowleft: () => {
            this.moveX(-1);
            this.faceAt(Character.DIRECTION.left);
        },
        press_arrowup: () => {
            this.moveY(-1);
            this.faceAt(Character.DIRECTION.up);
        },
        press_arrowdown: () => {
            this.moveY(1);
            this.faceAt(Character.DIRECTION.down);
        },
        press_space: () => {
            this.doJump();
        },
        release_c: () => {
            if (this.have_bombs) {
                this.putBomb();
            }
        },
        release_z: () => {
            if (this.have_sword) {
                this.attack()
            }
        },
        press_x: () => {
            if (this.have_shield) {
                this.block();
            }
        },
        release_x: () => {
            this.unblock();
        }
    });
    this.unSilenceKeyListen = () => {
        if (silenced) {
            silenced = false;
            jsGame.ButtonListener.shift();
        }
    };
    this.silenceKeyListen = () => {
        if (silenced) {
            return;
        }
        silenced = true;
        jsGame.ButtonListener.listen({
            release_any: (keycode) => {
                delete this.keyPressListener[keycode];
            },
            press_any: (keycode) => {
                this.keyPressListener[keycode] = 1;
            }
        });
    }
}


function CooldDownLoop() {
    this.cooldowns = {};
    this.cooldownloop = function () {

        for (let i in this.cooldowns) {
            if (this.cooldowns[i] > 0) {
                this.cooldowns[i] -= 1;
            }
        }

    };
}

function CSSClassControl() {
    // stand-animation
    this.putCSSAnimation = function (str) {
        this.addClass("Player " + str);
    }
    this.clearCSSAnimation = function () {
        this.putCSSAnimation("");
    }
}

export default class Player extends Character {

    constructor() {
        super(PLAYER_SPRITE);
        /////////////////////////
        window.$PJ = this
        this.minhitheight = 2;
        this.minhitwidth = 6;
        this.stepwalkSize = 4;
        this.life = 3;
        this.maxlife = 3;
        //
        this.have_sword = true;
        this.have_shield = true;
        this.have_bombs = true;
        //////////////////////////////
        this.facing = Character.DIRECTION.down;
        //////////////////////////////
        this.sprite.dom.classList.add("Avatar");
        this.sprite.dom.style.zIndex = 2;
        this.sprite.animationControl.maxticks = 6;
        this.sprite.animationControl.onAnimationEnd(
            () => {

            }
        );
        this.sprite.animationControl.lastAnimationName = null;

        ///////////////////////////////

        {
            this.sword = new jsGame.SpriteMap(SWORD_SPRITE.url, SWORD_SPRITE.x, SWORD_SPRITE.y,
                SWORD_SPRITE.maxwidth, SWORD_SPRITE.maxheight, SWORD_SPRITE.size, SWORD_SPRITE.size)
            // DRAW FIRST
            this.sword.size = SWORD_SPRITE.size;
            this.sword.speed = 3;
            this.sword.center = (SWORD_SPRITE.size * -.5);
            this.sword.x = this.sword.center;
            this.sword.y = this.sword.center;

        }
        {
            this.shield = new jsGame.SpriteMap(SHIELD_SPRITE.url, SHIELD_SPRITE.x, SHIELD_SPRITE.y,
                SHIELD_SPRITE.maxwidth, SHIELD_SPRITE.maxheight, SHIELD_SPRITE.size, SHIELD_SPRITE.size)
            // DRAW FIRST
            this.shield.size = SHIELD_SPRITE.size;
            this.shield.state = null;
            this.shield.STATES = {
                fdown: () => {
                    this.shield.x = SHIELD_SPRITE.size * -.4;
                    this.shield.y = SHIELD_SPRITE.size * -.4;
                    this.shield.dom.style.zIndex = 1;
                    this.shield.dom.style.transform = "";
                    this.shield.frame = 1;
                },
                bfdown: () => {
                    this.shield.x = SHIELD_SPRITE.size * -.4;
                    this.shield.y = SHIELD_SPRITE.size * -.4;
                    this.shield.dom.style.zIndex = 2;
                    this.shield.dom.style.transform = "";
                    this.shield.frame = 0;
                },
                fup: () => {
                    this.shield.x = SHIELD_SPRITE.size * -.4;
                    this.shield.y = SHIELD_SPRITE.size * -.4;
                    this.shield.dom.style.zIndex = 2;
                    this.shield.dom.style.transform = "";
                    this.shield.frame = 0;
                },
                bfup: () => {
                    this.shield.x = SHIELD_SPRITE.size * -.4;
                    this.shield.y = SHIELD_SPRITE.size * -.4;
                    this.shield.dom.style.zIndex = 1;
                    this.shield.dom.style.transform = "";
                    this.shield.frame = 1;
                },
                fright: () => {
                    this.shield.x = SHIELD_SPRITE.size * -.7;
                    this.shield.y = SHIELD_SPRITE.size * -.3;
                    this.shield.dom.style.zIndex = 1;
                    this.shield.dom.style.transform = "scaleX(.5)";
                    this.shield.frame = 0;
                },
                bfright: () => {
                    this.shield.x = SHIELD_SPRITE.size * -.3;
                    this.shield.y = SHIELD_SPRITE.size * -.3;
                    this.shield.dom.style.zIndex = 2;
                    this.shield.dom.style.transform = "scaleX(.7)";
                    this.shield.frame = 0;
                },
                fleft: () => {
                    this.shield.x = SHIELD_SPRITE.size * -.3;
                    this.shield.y = SHIELD_SPRITE.size * -.3;
                    this.shield.dom.style.zIndex = 1;
                    this.shield.dom.style.transform = "scaleX(.5)";
                    this.shield.frame = 0;
                },
                bfleft: () => {
                    this.shield.x = SHIELD_SPRITE.size * -.7;
                    this.shield.y = SHIELD_SPRITE.size * -.3;
                    this.shield.dom.style.zIndex = 2;
                    this.shield.dom.style.transform = "scaleX(.7)";
                    this.shield.frame = 0;
                },
            }
            this.shield.onEnterFrame = () => {
                if (this.state == STATES.blocking) {
                    this.shield.state = null;
                    this.shield.STATES["bf" + this.facing]();
                } else if (this.shield.state != this.facing) {
                    this.shield.state = this.facing;
                    this.shield.STATES["f" + this.facing]();
                }
            };
        }
        /// STATE MACHINE
        stateMachine.call(this, (_newstate) => {
            // ON STATE CHANGE
            if (_newstate == STATES.idle) {
                this.putCSSAnimation("stand-animation");
            } else {
                this.putCSSAnimation("");
            }
            if (_newstate != STATES.die) {

                if (ANIMATIONSBYSTATE.hasOwnProperty(_newstate)) {
                    this.setAnimation(this.facing + ANIMATIONSBYSTATE[_newstate]);
                } else {
                    this.setAnimation(this.facing + ANIMATIONSBYSTATE[STATES.idle]);
                }
            }

        });
        // TO STORE STUFF
        this.$dirty = {
            x: -1,
            y: -1,
            cell: [0, 0],
            cellKey: "0-0"
        };
        //
        CooldDownLoop.call(this);
        // 
        SmoothMoveControl.apply(this);
        //
        AttacksControl.call(this);
        //
        BlockingControl.call(this);
        // 
        DashControl.call(this);
        ///
        MyKeyListener.call(this);
        // 
        CSSClassControl.call(this);
        //////////////
        mapFunctions.getPlayer = () => {
            return this;
        };
        //////////////////////////////////////////////////
        this.putCSSAnimation("stand-animation");
    }
    setIdle() {
        this.setState(STATES.idle)
    }
    faceAt(_dirface) {
        if (this.state != STATES.blocking) {
            this.facing = _dirface;
        }
    }
    setAnimation(frame_animation_name, force = false) {

        if (this.sprite.animationControl.lastAnimationName != frame_animation_name) {
            try {
                this.sprite.animationControl.setFrames(ANIMATIONS[frame_animation_name]);
                this.sprite.animationControl.lastAnimationName = frame_animation_name;
            } catch (e) {
                console.warn(e, frame_animation_name)
            }

        }

    }

    hit(damage, from) {
        // OVERRIDED.
        if (!this.invincible) {
            //
            jsGame.ButtonListener.disabled();

            (new Promise((_resolve) => {
                if (this.state == STATES.blocking) {
                    // VALIDATE IF IM BLOCKING SAME DIR.
                    let facingdirections = this.getFacingDirection(from).join("");
                    if (facingdirections.indexOf(this.facing) > -1) {
                        // BLOCKED!
                        jsGame.Game.slow(60);
                        this.onBlocked();
                        this.shake();

                        this.pushTo(from.facing, 2);
                        _resolve();
                        return Promise.resolve(0);
                    }
                }

                this.invincible = true;
                this.moveControl.stop();
                this.onHit(damage, from);
                this.setAnimation(this.facing + "-stand");
                // BOUNCE AGAINST!.
                this.pushTo(from.facing, 1)
                // 
                if (this.life >= 1 && (this.life - damage <= 0)) {
                    // LET HIM ON HALF LIFE
                    this.life = 0.5;

                } else {
                    this.life -= damage;
                }

                if (this.life <= 0) {
                    this.life = 0;
                    // DESTROY
                    this.destroy();
                    // NO RESOLVE NEVER?
                } else {
                    this.hitAnimation().then(() => {
                        setTimeout(() => {
                            this.invincible = false;
                        }, 1000)
                        _resolve();
                    });
                }

            })).then(() => {
                console.log("NOP")
                jsGame.ButtonListener.enabled();
            })
        }

    }

    give_sword() {

        this.have_sword = true;
        this.pickAnimation();
    }
    give_shield() {
        this.have_shield = true;
        this.addChild(this.shield);
        this.pickAnimation();
    }
    give_bombs() {
        this.have_bombs = true;
        this.pickAnimation();
    }
    pickAnimation() {
        this.moveControl.stop();
        this.setState("pick");
        this.setAnimation("down-pick", true);
        jsGame.ButtonListener.disabled();
        setTimeout(() => {
            this.setState(STATES.idle);
            jsGame.ButtonListener.enabled();
        }, 1000)
    }
    getAttackDamage() {
        return 1;
    }
    onEnterFrame() {

        if (this.state != STATES.die) {
            this.smothmoveloop();
            this.cooldownloop();
            this.shield.onEnterFrame();
            // VALIDATE POSITION CHANGE.
            {
                let cell = [], cellKey = "";
                //
                if (this.$dirty.x != this.x || this.$dirty.x != this.x) {
                    cell = mapFunctions.getCellPosition(this.x, this.y);
                    cellKey = cell.join("-");
                }
                //
                if (cellKey != this.$dirty.cellKey) {
                    this.$dirty.cell = cell;
                    this.$dirty.cellKey = cellKey;
                    // IF NOT HITTEST 
                    mapFunctions.getCurrentScene().interactAtPosition(cell);
                }
            }
        }

    }
    destroyAnimation() {
        return new Promise((_resolve) => {
            this.state = STATES.die;
            this.putCSSAnimation("died-animation");
            this.moveControl.stop();
            jsGame.ButtonListener.disabled();
            // ROTATE HIM
            let tick = 0;
            let o = 1;
            let i = 0;
            let rotDirection = [Character.DIRECTION.down, Character.DIRECTION.left, Character.DIRECTION.up, Character.DIRECTION.right]
            let intervalLoop = jsGame.onEnterFrame(() => {
                if (o > 0.1) {
                    tick++;
                    o -= 0.01;
                    this.dom.style.opacity = Math.max(0, o);
                    if (tick > 6) {
                        this.facing = rotDirection[i];
                        this.sprite.animationControl.setFrames(ANIMATIONS[this.facing + "-stand"]);
                        tick = 0;
                        i++;
                        if (i > 3) {
                            i = 0;
                        }
                    }
                } else {
                    this.dom.style.opacity = 1;
                    this.respawn();
                    intervalLoop.remove();
                    _resolve();
                }
            })


        });
    }
    respawn() {
        jsGame.ButtonListener.enabled();
        mapFunctions.getCurrentScene().reload();
        this.life = this.maxlife;
        this.state = STATES.idle;
        this.invincible = false;
        this.have_sword = false;
        this.have_shield = false;
        this.have_bombs = false;
        this.removeChild(this.shield);
    }
}
