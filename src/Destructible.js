
import jsGame from "./jsGame.js"

export default class Destructible extends jsGame.Entity {
    constructor(x, y, info, jsonmap) {
        super();

        this.info = info;
        this.x = x;
        this.y = y - ((this.info.height - 1) * jsonmap.gridsize);
        this.life = this.info.life || 1;
        this.width = this.info.width * jsonmap.gridsize;
        this.height = this.info.height * jsonmap.gridsize;
        this.dom.style.zIndex = y;
        this.sprite = new jsGame.SpriteMap(
            jsonmap.tileImage,
            this.info.sprite.x * jsonmap.gridsize,
            this.info.sprite.y * jsonmap.gridsize,
            this.width,
            this.height,
            this.width,
            this.height);
        //  this.sprite.x = -parseInt(this.sprite.width * .5);        this.sprite.y = -this.sprite.height * .5;
        this.addChild(this.sprite);
        //  this.sprite.dom.style.border = "thin solid red";
        // this.dom.style.border = "thin solid green";
        this.dom.style.width = this.width + "px";
        this.dom.style.height = this.height + "px";
        this.dom.classList.add("Destructible")

    }

    getCenter() {
        return {
            width: this.width, height: this.height,
            x: this.x + this.sprite.x,
            y: this.y + this.sprite.y
        }
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
    hit(damage, from) {
        if ((this.info.onlybomb && from.constructor.name != "Bomb")
            ||
            (this.info.nobomb && from.constructor.name == "Bomb")
        ) {
            return;
        }

        if (!this.invincible) {
            this.invincible = true;
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
                    _resolve()
                }
            })

        });
    }
    cutAll() {
        let totalpieces = random(4, 8);
        let url = this.sprite.dom.style.backgroundImage;
        this.sprite.dom.style.display = "none";
        let i = 1;
        let w = parseInt(this.sprite.width / 2);
        let h = parseInt(this.sprite.height / 2);
        /// 2
        console.log("totalpieces", totalpieces)
        const sidepositions = [{
            x: 0, y: 0, vx: -1, vy: -1
        }, {
            x: 1, y: 0, vx: 1, vy: -1
        }, {
            x: 0, y: 1, vx: -1, vy: 1
        }, {
            x: 1, y: 1, vx: 1, vy: 1
        }];
        let promises = [];
        while (i <= totalpieces) {
            let div = document.createElement("div");
            let side = sidepositions[random(0, 3)];//sidepositions[i - 1]

            let vx = side.vx * (random(1, 100)) / 100;
            let vy = side.vy * (random(1, 100)) / 100;
            let x = side.x * random(parseInt(w / 4), w);
            let y = side.y * random(parseInt(h / 4), h);
            assingProperties(div.style, {
                position: "absolute",
                left: (x + this.sprite.x) + "px",
                top: (y + this.sprite.y) + "px",
                width: w + "px",
                height: h + "px",
                backgroundImage: url,
                backgroundPosition: `${x}px ${y}px`
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
                    dx += vx * v;
                    dy += vy * v;
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
    destroy() {
        this.cutAll();
        if (this.onDestroyListener) {
            this.onDestroyListener();
        }
    }
    onDestroy(_callbackondestroy) {
        this.onDestroyListener = _callbackondestroy;
    }

}