
import jsGame from "../jsGame.js";
import mapFunctions from "../mapFunctions.js";
import Enemy from "./Enemy.js";


export default class Boulder extends Enemy {
    constructor(initParams) {
        super("boulder", initParams);
        // GO DOWN.
        this.untilY = 0;
        this.untilX = 0;
        this.vely = 0;
        this.velx = 0
        // PUT A SHADOW WHERE IM GOING TO FALL
        this.startPosition = {
            x: this.x + 0,
            y: this.y + 0
        };
        this.invincible = true;

        this.shadow = null;
        this.throwed = false;
    }
    throw(untiX, untilY) {
        this.throwed = true;
        this.untilY = untilY;
        this.untiX = untiX;
        this.velx = random(2, 3), this.vely = random(2, 3);
        this.maxdistance = calcDistance(this.startPosition, {
            x: untiX,
            y: untilY
        });
        this.addShadow();
    }
    addShadow() {
        if (!this.shadow) {
            if (this._parent) {
                this.shadow = new jsGame.Entity();
                this.shadow.dom.className = "boulder-shadow";
                this.shadow.size = this.sprite.width / 2;
                this.shadow.x = (this.x - this.shadow.size / 2);
                this.shadow.y = (this.untilY - this.shadow.size / 2);
                assingProperties(this.shadow.dom.style, {
                    position: "absolute",
                    width: this.shadow.size + "px",
                    height: this.shadow.size + "px",
                    zIndex: this.untilY
                });
                this._parent.addChild(this.shadow);
            }
        } else {
            let d = calcDistance(this.startPosition, this);
            let size = this.shadow.size * (2 - (d / this.maxdistance));
            assingProperties(this.shadow.dom.style, {
                width: size + "px",
                height: (size) + "px"
            });
        }
    }
    explode() {
        let damage = 3;
        let touched = mapFunctions.createAreaDamage(this, this.width, 100);
        for (let index in touched) {
            if (touched[index].$ID != this.$ID && touched[index].hit != null) {
                touched[index].hit(damage, this);
            }
        }
        this.shadow.remove();
        this.cutAll().then(() => {
            this.remove();
        });
    }
    onEnterFrame() {
        if (this.throwed) {
            // -- 

            if (this.y < this.untilY) {
                this.y += this.vely;
                // this.sprite.rotation++;
                if (this.y >= this.untilY) {
                    this.throwed = false;

                    // HERE DO AREA DAMAGE AROUND.
                    this.explode();
                }
            }
        }
    }
    onAfterDraw() {
        // PUT ME ALWAYS ON TOP
        this.dom.style.zIndex = 999;

    }

}