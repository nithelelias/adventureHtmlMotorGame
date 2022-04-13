import jsGame from "./jsGame.js";
import mapFunctions from "./mapFunctions.js";
const BOMB_SPRITE = {
    url: "resources/bomb.png",
    x: 0,
    y: 0,
    maxwidth: 80,
    maxheight: 16,
    width: 16,
    height: 16
}
export default class Bomb extends jsGame.Entity {
    constructor(params) {
        super(params);
        this.sprite = new jsGame.SpriteMap(BOMB_SPRITE.url,
            BOMB_SPRITE.x,
            BOMB_SPRITE.y,
            BOMB_SPRITE.maxwidth,
            BOMB_SPRITE.maxheight,
            BOMB_SPRITE.width,
            BOMB_SPRITE.height
        );
        this.sprite.x = -parseInt(this.sprite.width * .45);//32/4
        this.sprite.y = -this.sprite.height * .5;//32/2
        this.sprite.frame = 0;
        this.addChild(this.sprite)
        this.tick = 0;
        this.frame = 0;
        this.ticksLeft = 6;
    }

    getCenter() {
        return {
            width: this.width, height: this.height,
            x: this.x + this.sprite.x,
            y: this.y + this.sprite.y
        }
    }
    explode() {
        let damage = 3;
        let touched = mapFunctions.createAreaDamage(this, mapFunctions.getGridSize() * 3, 100); 
        for (let index in touched) {
            if (touched[index].$ID != this.$ID && touched[index].hit != null) {
                touched[index].hit(damage, this);
            }
        }
        this.remove();
    }
    onEnterFrame() {
        this.tick++;
        if (this.ticksLeft > 0) {
            if (this.tick > 12) {

                this.sprite.animationControl.setFrames([this.frame]);
                this.ticksLeft--;
                this.frame += 1;
                this.tick = 0;
            }

            if (this.ticksLeft == 0) {
                // BOOMB
                this.sprite.animationControl.setFrames([4]);
                this.explode();
            }
        }

    }
}