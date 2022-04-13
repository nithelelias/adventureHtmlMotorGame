import jsGame from "./jsGame.js";
import mapFunctions from "./mapFunctions.js";




function MoveControl(_entity, stepsize = 1) {

    let currentHandler;
    let onStopCallback;
    let target_x = 0, target_y = 0;
    let currentPromise;
    let maxIterations = -1;
    const HOR_STR_NAME = {
        "1": "right",
        "-1": "left",
        "0": ""
    };
    const VER_STR_NAME = {
        "1": "down",
        "-1": "up",
        "0": ""
    };

    /**
     * the last moving direction
     */
    this.movingDirection = [0, 0];

    /**
     * String name of the moving direction
     */
    this.directionName = "none";
    /**
     * the step size of the movement maybe is 12x12 (is cuadratic)
     */
    this.ismoving = false;
    this.stepsize = stepsize;
    this.stop = function () {
        if (this.ismoving) {
            currentHandler.remove();
            if (onStopCallback) {
                onStopCallback();
            }
        }
        this.ismoving = false;

    };
    this.onStop = function (_callback) {
        onStopCallback = _callback;
    }

    this.moveTo = function (tox, toy) {

        target_x = parseInt(tox);
        target_y = parseInt(toy);
        let dist = calcDistance(
            { x: target_x, y: target_y }, _entity
        );
        maxIterations = Math.round(dist / this.stepsize);
        if (!this.ismoving) {
            currentPromise = new Promise((_resolve) => {
                currentHandler = jsGame.onEnterFrame(() => {
                    loop.call(this);
                    if (!this.ismoving) {
                        _resolve();
                    }
                });
            });

        }

        this.ismoving = true;
        return currentPromise;


    }

    let loop = function () {
        if (maxIterations > 0) {
            let i = 0;
            while (i < this.stepsize) {
                let nx = _entity.x, ny = _entity.y;
                let marginx = 0, marginy = 0;
                if (nx > target_x) {
                    nx -= 1;
                    this.movingDirection[0] = -1;
                } else if (nx < target_x) {
                    nx += 1;
                    this.movingDirection[0] = 1;
                } else {
                    this.movingDirection[0] = 0;
                }


                if (ny > target_y) {
                    ny -= 1;
                    marginy = 0
                    this.movingDirection[1] = -1;
                } else if (ny < target_y) {
                    ny += 1;
                    marginy = parseInt(_entity.height / 2);

                    this.movingDirection[1] = 1;
                } else {
                    this.movingDirection[1] = 0;
                }
                // VALIDATE WHAT DIRECTION IS NOT POSIBLE IF HORIZONTAL OR VERTICAL.
                // HORIZONTAL
                if (!mapFunctions.maphittest(nx,
                    _entity.y)) {
                    // CAN MOVE HOR
                    _entity.x = nx;
                }
                if (!mapFunctions.maphittest(_entity.x,
                    ny + marginy)) {
                    // CAN MOVE VER
                    _entity.y = ny;
                }

                this.directionName = HOR_STR_NAME[this.movingDirection[0]] + VER_STR_NAME[this.movingDirection[1]];
                i++;
            }
            maxIterations--;
        } else {
            currentHandler.remove();
            this.ismoving = false;

        }
    }
}

export default class Character extends jsGame.Entity {
    static DIRECTION = {
        right: "right",
        left: "left",
        up: "up",
        down: "down"
    };
    static FACETODIRVALUES = {
        right: [1, 0],
        left: [-1, 0],
        up: [0, -1],
        down: [0, 1]
    }


    /**
     * 
     * @param {SpriteInfo} spriteinfo 
     */
    constructor(spriteinfo = {
        url: "",
        x: 0,
        y: 0,
        maxheight: 0,
        maxwidth: 0,
        width: 0,
        height: 0,
        frames: [],
    }) {
        super();
        ///
        this.width = spriteinfo.width;
        this.height = spriteinfo.height;
        this.life = 2;// ESTANDAR
        this.maxlife = 2;
        this.facing = Character.DIRECTION.down;
        ///////////// SPRITE INFO
        this.sprite = new jsGame.SpriteMap(spriteinfo.url,
            spriteinfo.x,
            spriteinfo.y,
            spriteinfo.maxwidth,
            spriteinfo.maxheight,
            spriteinfo.width,
            spriteinfo.height
        );

        this.sprite.x = -parseInt(this.sprite.width * .45);//32/4
        this.sprite.y = -this.sprite.height * .5;//32/2
        this.addChild(this.sprite);
        this.addClass("stand-animation");
        //////////////////////
        let center = document.createElement("div");
        assingProperties(center.style, {
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "5px",
            height: "5px",
            //background: "green",
            zIndex: 10
        })
        this.dom.appendChild(center);
        //////////////////////      PROPs      //////////////////
        /**
         *  This propr will tell the times of each move cicle will run
         */
        this.moveControl = new MoveControl(this, 1);
        ////////////
        this.invincible = false;

    }

    getCenter() {
        return {
            entityName: this.constructor.name,
            width: this.width, height: this.height,
            x: this.x + this.sprite.x,
            y: this.y + this.sprite.y
        }
    }
    isAlive() {
        return this.life > 0;
    }
    getFacingDirection(toP) {
        let dx = toP.x - this.x;
        let dy = toP.y - this.y;

        return [(dx == 0 ? null : dx > 0 ? Character.DIRECTION.right : Character.DIRECTION.left),
        (dy == 0 ? null : dy > 0 ? Character.DIRECTION.down : Character.DIRECTION.up)
        ];

    }
    calcDirection(toP) {
        let dx = toP.x - this.x;
        let dy = toP.y - this.y;
        let adx = Math.abs(dx);
        let ady = Math.abs(dy);
        if (adx > ady) {
            // HORIZONTAL
            return dx > 0 ? Character.DIRECTION.right : Character.DIRECTION.left;
        } else {
            // VERTICAL
            return dy > 0 ? Character.DIRECTION.down : Character.DIRECTION.up;
        }
    }
    onAnimationEnd() {
        // TO BE OVERRIDED.BY X
    }
    getCurrentCellMap() {
        return this.getCell();
    }
    getCell() {
        return mapFunctions.getCellAt(this);
    }
    hit(damage, from) {
        if (!this.invincible) {

            this.invincible = true;
            this.moveControl.stop();
            this.onHit(damage, from);
            // BOUNCE AGAINST!.
            this.pushTo(from.facing, 1)
            //
            this.life -= damage;
            if (this.life <= 0) {
                // DESTROY
                this.destroy();
            } else {
                this.hitAnimation().then(() => {
                    this.invincible = false;
                })

            }

        }
    }
    onHit(damage, from) {
        // TO OVERRIDE
    }
    pushTo(dir, cells) {
        let cell = mapFunctions.getCellAt(this);
        if (dir == Character.DIRECTION.right) {
            cell[0] += 1;
        }
        if (dir == Character.DIRECTION.left) {
            cell[0] -= 1;
        }
        if (dir == Character.DIRECTION.down) {
            cell[1] += 1;
        }
        if (dir == Character.DIRECTION.up) {
            cell[1] -= 1;
        }
        if (mapFunctions.isCellWalkable(cell[0], cell[1])) {
            let p = mapFunctions.cellToPosition(cell[0], cell[1]);
            this.x = p.x;
            this.y = p.y;
        }
    }
    hitAnimation() {
        return new Promise((_resolve) => {
            let tick = 0, loops = 4;

            let currentfilter = this.sprite.dom.style.filter;
            this.sprite.dom.style.filter = "brightness(200)";
            let sh = [`translate3d(-3px, 0, 0)`, 'translate3d(0px, 0, 0)'];
            let intervalHandler = jsGame.onEnterFrame(() => {
                tick += 1;
                if (tick > 3) {
                    tick = 0;
                    loops -= 1;
                    this.sprite.dom.style.transform = sh[0];
                    sh.push(sh.shift());
                }
                if (loops <= 0) {
                    // END
                    intervalHandler.remove();
                    this.sprite.dom.style.filter = currentfilter;
                    this.sprite.dom.style.transform = "";
                    _resolve();

                    this.onHitAnimationEnd();
                }
            })

        });
    }
    onHitAnimationEnd() {
        // TO OVERRIDE
    }
    cutAll() {
        let totalpieces = 4;// random(4, 8);
        let url = this.sprite.dom.style.backgroundImage;
        this.sprite.dom.style.display = "none";
        let i = 0;
        let w = parseInt(this.sprite.width / 2);
        let h = parseInt(this.sprite.height / 2);

        /// 2 
        const sidepositions = [{
            x: 1, y: -1, p: [0, 0]
        }, {
            x: 1, y: 1, p: [1, 0]
        }, {
            x: -1, y: 1, p: [0, 1]
        }, {
            x: -1, y: -1, p: [1, 1]
        }];
        let promises = [];
        while (i < totalpieces) {
            let div = document.createElement("div");
            let side = sidepositions[i];//sidepositions[i - 1]

            let x = side.p[0] * w;//+ side.x * w;
            let y = side.p[1] * h;//+ side.y * h;
            let vx = (x > this.sprite.x ? 1 : -1) / random(1, 10);
            let vy = (y > this.sprite.y ? 1 : -1) / random(1, 10);
            assingProperties(div.style, {
                position: "absolute",
                left: (this.sprite.x + x) + "px",
                top: (this.sprite.y + y) + "px",
                width: w + "px",
                height: h + "px",
                backgroundImage: url,
                backgroundPosition: `${side.p[0] * w}px ${side.p[1] * h}px`
            });

            this.dom.appendChild(div);
            promises.push(new Promise((_resolve) => {
                let ticks = 30;
                let rule = 100 / 30;
                let dx = 0, dy = 0;
                let v = random(1, 100) / 100;
                let r = 0;
                let rotationSpeed = random(1, 5) / 10;
                div.style.transition = "all .1s";
                let intervalOnQueue = jsGame.onEnterFrame(() => {
                    ticks--;
                    div.style.opacity = (ticks * rule / 100);
                    div.style.transform = `translate(${dx}px,${dy}px) rotate(${r}deg)`;
                    r += rotationSpeed;
                    dx += vx * v; dy += vy * v;
                    if (ticks <= 0) {
                        intervalOnQueue.remove();
                        _resolve();
                    }
                });
            }))
            i++;
        }

        ////////////////////// move to...
        return Promise.all(promises).then(() => {

            return 1;
        });
    }


    onRun() {
        this.dom.style.zIndex = this.y;
    }

    addClass(_classname) {
        this.dom.className = "Entity Character " + _classname;
    }
    removeClass(_classstr) {
        // CUT THE DIFERENT CLASES 
        this.dom.className = this.dom.className.split(" ").filter((a) => {
            return a.indexOf(_classstr) == -1;
        }).join(" ");
    }
    ////////////////////// ___________ DOM ANIMATION .------------------------///
    swing() {
        return new Promise((_resolve) => {

            let tick = 0, loops = 5;
            let deg = 15;

            let step = () => {
                tick += 1;
                if (tick > 6) {
                    tick = 0;
                    loops -= 1;

                    deg = (Math.abs(deg) - 5) * (loops % 2 == 0 ? 1 : -1);
                    this.dom.style.transform = "rotate3d(0, 0, 1, " + deg + "deg)";
                }
                if (loops <= 0) {
                    interval.remove();
                    this.dom.style.transform = "";
                    _resolve();
                }
            };

            let interval = jsGame.onEnterFrame(step);
        })
    }
    shake() {
        return new Promise((_resolve) => {

            let tick = 0, loops = 4;
            let sh = [`translate3d(-3px, 0, 0)`, 'translate3d(0px, 0, 0)']
            let step = () => {
                tick += 1;
                if (tick > 6) {
                    tick = 0;
                    loops -= 1;
                    this.dom.style.transform = sh[0];
                    sh.push(sh.shift());
                }
                if (loops <= 0) {
                    // END 
                    interval.remove();
                    this.dom.style.transform = "";
                    _resolve();
                }
            };
            let interval = jsGame.onEnterFrame(step);


        })
    }
    roll(dirX = 1) {
        return new Promise((_resolve) => {

            this.sprite.dom.style.transition = "transform 0.3s";
            this.sprite.dom.style.transform = `rotate(${360 * dirX}deg)`;
            this.sprite.dom.style.opacity = .7;
            setTimeout(() => {
                this.sprite.dom.style.opacity = 1;
                this.sprite.dom.style.transition = "";
                this.sprite.dom.style.transform = "";
                _resolve();

            }, 300);
        });
    }

    jump() {
        return new Promise((_resolve) => {
            // REMOVE STAND_ANIMATION... 
            this.sprite.dom.style.transition = "transform 0.3s";
            this.sprite.dom.style.transform = `translate3d(0, -${this.height * .7}px, 0)`;
            setTimeout(() => {
                this.sprite.dom.style.transition = "transform 0.2s";
                this.sprite.dom.style.transform = `translate3d(0, 0px, 0)`;
                setTimeout(() => {
                    this.sprite.dom.style.transition = "";
                    this.sprite.dom.style.transform = "";
                    _resolve();
                }, 300)
            }, 500);
        })
    }

    ////////////====================================================
    destroyAnimation() {
        return this.cutAll();
    }
    destroy() {
        if (this.onDestroyListener) {
            this.onDestroyListener();
        }
        return this.destroyAnimation();

    }
    onDestroy(_callbackondestroy) {
        this.onDestroyListener = _callbackondestroy;
    }
}