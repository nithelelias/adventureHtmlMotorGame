
import BD from "./BD.js";
import jsGame from "./jsGame.js";
export default function GridMapControl() {
    this.ready = false;
    this.tint = null;
    this.toggleFrameDirective = BD.ANIMATEDFRAMES;
    let animatedTicks = 0;
    this.setTint = function (tint) {
        this.tint = tint;
        this.$dirty = true;
    }
    this.load = function (url) {
        this.ready = false;
        return fetch(url).then((r) => {
            return r.json();
        }).then((_json) => {
            return this.set(_json);
        });
    }
    this.onEnterFrame = function () {
        if (this.ready) {
            animatedTicks++;
            if (animatedTicks > 60) {
                animatedTicks = 0;
                this.$dirty = true;
            }
        }
    }
    this.set = function (jsonmap, forceLayers = null) {

        this.columns = jsonmap.cols;
        this.rows = jsonmap.rows;
        this.layers = forceLayers == null ? jsonmap.layers : (forceLayers.map((n) => {
            return jsonmap.layers[n];
        }));
        this.hittest = jsonmap.hittest;
        this.gridsize = jsonmap.gridsize;
        this.center = {
            x: parseInt(this.columns / 2) * this.gridsize,
            y: parseInt(this.rows / 2) * this.gridsize,
            width: this.gridsize,
            height: this.gridsize
        };

        // COMPARAMOS SI CAMBIO.
        let w = this.columns * this.gridsize;
        let h = this.rows * this.gridsize;
        if (this.width != w) {
            this.width = w;
            this.canvas.width = w;
            this.canvas.setAttribute("width", this.width);
        }
        if (this.height != h) {
            this.height = h;
            this.canvas.height = h;
            this.canvas.setAttribute("height", this.height);
        }

        assingProperties(this.dom.style, {
            width: (this.width) + "px",
            height: (this.height) + "px"
        });

        ///


        this.image_url = jsonmap.tileImage;
        return jsGame.loadImage(this.image_url).then((_img) => {
            this.tilesetImage = _img;
            this.ready = true;
            this.$dirty = true;
        });
    }
}

