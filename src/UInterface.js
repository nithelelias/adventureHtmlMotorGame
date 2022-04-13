import jsGame from "./jsGame.js";
import mapFunctions from "./mapFunctions.js";
const getPlayer = () => mapFunctions.getCurrentScene().getPlayer();
const cloneJSON = (json) => JSON.parse(JSON.stringify(json));
const newDiv = () => document.createElement("div");
const cropimage = (url, x, y, w, h) => jsGame.loadImage(url).then((r) => {
    return jsGame.cropimage(url, x, y, w, h);
});
class UiComponent extends jsGame.Entity {
    constructor(states = {}) {
        super();
        this.prevState = {};
        this.state = states;
        this.dom.className = "ui-com";
        this.childs = {};

    }

    setState(newstate) {
        assingProperties(this.state, newstate);
    }
    onRun() {
        this.onEnterFrame();
        //  
        var dirty = false;
        for (let i in this.prevState) {
            // IF PROPERTY NOT FOUND OR VALUE OF PROPERTY IS NOT THE SAME
            if (!this.state.hasOwnProperty(i) || this.prevState[i] != this.state[i]) {
                dirty = true;
                break;
            }

        }
        if (!dirty) {
            for (let i in this.state) {
                // IF THE PREV STATE IS NOT FOUND.
                if (!this.prevState.hasOwnProperty(i)) {
                    dirty = true;
                    break;
                }
            }
        }

    }

    onEnterFrame() {
        // TO OVERRIDE
    }

    draw() {
        // TO OVERRIDE
    }


}

class PlayerLifeBar extends UiComponent {
    constructor() {
        super();
        this.state = {
            life: 0
        };

        this.lifeText = newDiv();
        this.imageheart = newDiv()

        this.imageheart.className = "animated pulse infinite";
        assingProperties(this.dom.style, {
            minWidth: "calc( 16px + .5rem + 3rem)",
            height: "24px",
            transform: "scale(1.5)",
            imageRendering: "pixelated"
        });;

        assingProperties(this.lifeText.style, {
            minWidth: "3rem",
            height: "1.5rem",
            float: "left"
        });
        cropimage("resources/hearts.png", 0, 0, 80, 16).then((imgdata) => {
            assingProperties(this.imageheart.style, {
                backgroundImage: `url("${imgdata}")`,
                width: 16 + "px",
                height: 16 + "px",
                float: "left",
                marginRight: ".5rem",
                backgroundPosition: "0px 0px "
            });
        })
        // ADDING THE DOM
        this.dom.appendChild(this.imageheart);
        this.dom.appendChild(this.lifeText);
    }
    onEnterFrame() {
        // THIS WILL CALL ALWAYS
        this.state.life = getPlayer().life;
    }
    draw() {
        // ONLY MAKE A CHANGE WHEN IT CHANGED!
        if (this.prevState.life > this.state.life) {
            // WAS A HIT! 
            this.dom.style.backgroundColor = "red";
            this.dom.style.color = "white";
            setTimeout(() => {
                this.dom.style.backgroundColor = "white";
                this.dom.style.color = "black";
            }, 500);
        }
        let percentage = parseInt(this.state.life / getPlayer().maxlife * 100);
        this.imageheart.style.backgroundPosition = -((4 - parseInt(percentage / 25)) * 16) + "px 0px";

        this.lifeText.innerHTML = `${this.state.life}/${getPlayer().maxlife} (${percentage}%)`;
    }
}
class TopBar extends UiComponent {
    constructor() {
        super();
        assingProperties(this.dom.style, {
            width: "100%",
            height: "32px",
            position: "fixed",
            zIndex: "90",
        });

        this.dom.classList.add("valign");
        this.pjHpBar = new PlayerLifeBar();
        this.addChild(this.pjHpBar);
    }
}

export default class UiInterface extends jsGame.Entity {
    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.dom.classList.add("UI");
        this.topBar = new TopBar();
        this.addChild(this.topBar)
    }
}