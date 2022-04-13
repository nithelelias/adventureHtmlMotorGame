import jsGame from "./jsGame.js";
import mapFunctions from "./mapFunctions.js";

export default class Projectile extends jsGame.Entity {
    static create(from, to, dom, size, speed = 1) {

        let angle = getAngle(to, from);
        let projectile = new Projectile({
            innerDom: dom,
            angle,
            speed,
            target: to,
            velocity: 1,
            size,
            vel: {
                x: Math.cos(angle),
                y: Math.sin(angle)
            },
            x: 0 + from.x,
            y: 0 + from.y
        });
        projectile.dom.appendChild(dom);
        projectile.dom.style.transform = `rotate(${(angle * 180 / Math.PI)}deg)`;
        return projectile;
    }
    constructor(p) {
        super(p);
        this.frozen = false;
        this.destroyed = false;
        this.timeoutTodestroy = null;
        
        this.dom.style.display = "none";
        this.callBackonTouch = function () { };
    }

    getCenter() {
        return {
            entityName: this.constructor.name,

            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
    validateIfEnd() {

        let mapsize = mapFunctions.getMapSize();
        if (this.x < 0 || this.x > mapsize.width - mapsize.gridSize) {
            this.destroy();
            return;
        }
        if (this.y < 0 || this.y > mapsize.height - mapsize.gridSize) {
            this.destroy();
            return;
        }
        let d = calcDistance(this.target, this);
        let m = parseInt(mapFunctions.getGridSize() / 2);
        if (d < m) {
            this.destroy();
        }
    }
    validateHitTest() {
        let touch = (mapFunctions.hitttestAnythingAt(this)).filter((_ent) => {
            return _ent.$ID !== this.$ID;
        })
        if (touch.length > 0) {
            this.callBackonTouch(touch);
        }
    }
    onTick() {
        // TO OVERRIDE
    }
    onEnterFrame() {
        if (!this.destroyed && !this.frozen) {
            let i = 0;
            let v = Math.min(this.velocity, 1);
            while (i < this.speed) {
                this.x += this.vel.x * v;
                this.y += this.vel.y * v;
                this.onTick();
                // VALIDATE HIT TEST.
                this.validateHitTest();
                i++;
            }
            if (isNaN(this.x) || isNaN(this.y)) {
                this.dom.style.display = "none";
            } else {
                this.dom.style.display = "";
            }
            this.dom.style.zIndex = parseInt(this.y);
            this.validateIfEnd();
        }
    }
    onTouch(_callbackOn) {
        this.callBackonTouch = (_callbackOn);
    }
    freeze() {
        this.frozen = true;
    }
    unFreeze() {
        this.frozen = false;
    }
    cancelDestroy() {
        clearTimeout(this.timeoutTodestroy);
        this.destroyed = false;
    }
    reTarget(_target) {
        this.target = _target;
        this.angle = getAngle(_target, this);
        this.vel = {
            x: Math.cos(this.angle),
            y: Math.sin(this.angle)
        };

        clearTimeout(this.timeoutTodestroy);
        this.destroyed = false;
    }
    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            this.timeoutTodestroy = setTimeout(() => {
                this.remove();
            }, 300);
            this.onDestroy();
        }
    }
    onDestroy() {
        // TO OVERRIDE
    }
}