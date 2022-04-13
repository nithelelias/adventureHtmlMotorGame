
import jsGame from "./jsGame.js"

export default class PickUpItem extends jsGame.Entity {
    constructor(initialParams, info) {
        super(initialParams);
        this.info = info; 
        this.width = this.info.sprite.width;
        this.height = this.info.sprite.height;
        this.dom.style.zIndex = this.y;
        this.sprite = new jsGame.SpriteMap(
            this.info.sprite.url,
            this.info.sprite.x,
            this.info.sprite.y,
            this.info.sprite.width,
            this.info.sprite.height,
            this.info.sprite.width,
            this.info.sprite.height);
        //  this.sprite.x = -parseInt(this.sprite.width * .5);        this.sprite.y = -this.sprite.height * .5;
        this.addChild(this.sprite);
        //  this.sprite.dom.style.border = "thin solid red";
        // this.dom.style.border = "thin solid green";
        this.dom.style.width = this.width + "px";
        this.dom.style.height = this.height + "px";
        this.dom.classList.add("PickUpItem")

    }

    getCenter() {
        return {
            width: this.width, height: this.height,
            x: this.x + this.sprite.x,
            y: this.y + this.sprite.y
        }
    }

}