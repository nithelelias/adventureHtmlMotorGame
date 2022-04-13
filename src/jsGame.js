/**
 *  JERARQUIA
 * 
 *      MAIN
 *          - STAGE  
 *          
 */
const MAIN = document.createElement("div");

{

    MAIN.id = "main";
    assingProperties(MAIN.style, {
        position: "fixed",
        top: "0px",
        left: "0px",
        zIndex: "1",
        width: "100%",
        height: "100%",
        border: "dashed yellow "
    });

}
const TO_RADIANS = Math.PI / 180;
///////////////////
const CACHE_IMG = {};
const STORE_IMAGE_CROP = {};
/************
 * 
 */
const ID_ITERATOR = (function* IdGenerator() {
    var idcount = 0;
    while (true) {
        idcount += 1;
        yield 0 + idcount;
    }
})();

function getNewId() {
    return ID_ITERATOR.next().value;
}
window.TO_RADIANS = TO_RADIANS;
///////////////////////////////////////////

window.markCenter = function () {
    let centerdiv = document.createElement("div");
    centerdiv.innerHTML = `<div style="position: fixed;top: 50%;left: 0px;z-index: 99;width: 100%;border: solid green;"></div>
                            <div style="height: 100%; position: fixed; z-index: 100; border: solid green; top: 0px; left: 50%;"></div>`;
    document.body.appendChild(centerdiv);
}
/**
* Conserve aspect ratio of the original region. Useful when shrinking/enlarging
* images to fit into a certain area.
*
* @param {Number} srcWidth width of source image
* @param {Number} srcHeight height of source image
* @param {Number} maxWidth maximum available width
* @param {Number} maxHeight maximum available height
* @return {Object} { width, height }
*/
window.calculateAspectRatioFit = function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio, ratio };
}

window.calcDistance = function calcDistance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
window.getAngle = function calcDistance(p1, p2) {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x);
}
window.cloneJSON = function (json) {
    return JSON.parse(JSON.stringify(json));
}
window.getPixelSize = function () {
    return parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
    );
}
window.calcFPS = function () {
    const t0 = performance.now();
    let fps = 1;
    const fpsLoop = () => {
        fps++;
        if ((performance.now() - t0) < 1000) {
            requestAnimationFrame(fpsLoop);
        } else {
            console.log(fps);
        }
    }

    requestAnimationFrame(fpsLoop);
}

window.random = function random(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
////////////////////////////////////////////////////////
function cropimage(imageurl, _x, _y, _w, _h, _tint = null) {
    let img = getImage(imageurl);
    return img.ready.then(() => {
        // VALIDATE IF I HAD THE SAME CROPIMAGE  
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.setAttribute("width", _w);
        canvas.setAttribute("height", _h);
        // HERE
        ctx.drawImage(img, _x, _y,
            _w, _h, 0, 0, _w, _h);

        // HERE TO TINT...
        if (_tint != null) {
            _tint = [].concat(_tint);
            var myImg = ctx.getImageData(0, 0, _w, _h);

            for (var i = 0, n = myImg.data.length; i < n; i += 4) {
                // R, G, B
                let rgb = [myImg.data[i], myImg.data[i + 1], myImg.data[i + 2], myImg.data[i + 3]];

                for (let j in _tint) {
                    let colortoReplace = _tint[j].replace;
                    let newcolor = _tint[j].color;
                    if (rgb[0] == colortoReplace[0] && rgb[1] == colortoReplace[1] && rgb[2] == colortoReplace[2]) {
                        myImg.data[i] = newcolor[0];
                        myImg.data[i + 1] = newcolor[1];
                        myImg.data[i + 2] = newcolor[2];
                    }
                }
            }
            ctx.putImageData(myImg, 0, 0);
        }

        let data = canvas.toDataURL();
        return (data);

    });
}
/////////////////////////////////////////////////////////
function bodyHittest(_o1, _o2) {
    // POR TEMAS DE OPTIMIZACION VAMOS A USAR EL HITTEST CIRCULAR ES DECIR DONDE CALCULAMOS LA DISTANCIA ENTRE 
    // LOS 2 OBJETOS Y VEMOS SI LA DIFERENCIA ENTRE SUS DISTANCIA MAS LA SUMA DE SUS RADIOS DA UN BUEN RESULTADO
    let c1 = {
        x: _o1.x,
        y: _o1.y,
        radius: Math.min(_o1.width / 2, _o1.height / 2)
    };
    let c2 = {
        x: _o2.x,
        y: _o2.y,
        radius: Math.min(_o2.width / 2, _o2.height / 2)
    }
    let d = calcDistance(c1, c2);
    /*
        var dx = (c1.x + c1.radius) - (c2.x + c2.radius);
        var dy = (c1.y + c1.radius) - (c2.y + c2.radius);
        var distance = Math.sqrt(dx * dx + dy * dy);
    */
    //console.log("c1", c1.radius, "c2", c2.radius, d, "<=", c1.radius + c2.radius)
    return (d <= c1.radius + c2.radius);


}
/////////////////////////////////////////////////////////

window.assingProperties = assingProperties;
function assingProperties(obj, properties) {
    Object.keys(properties).forEach((_k) => {
        obj[_k] = properties[_k];
    })
}
///////////////////////////////////////////////////////////
function getImage(url) {
    if (CACHE_IMG.hasOwnProperty(url)) {
        return (CACHE_IMG[url])
    }
    return null;
}

function loadImage(url) {
    if (CACHE_IMG.hasOwnProperty(url)) {
        return CACHE_IMG[url].ready;
    } else {

        CACHE_IMG[url] = new Image();
        const ready = new Promise((_resolve) => {


            CACHE_IMG[url].onload = () => {
                _resolve(CACHE_IMG[url]);
            };

            CACHE_IMG[url].src = url;

        })

        CACHE_IMG[url].ready = ready;

        return ready;
    }
}
//////////////////////////////////////////////////////////////////////////
const LOOPCONTROL = {
    paused: false,
    slow: false,
};

function onEnterFrame(_callback) {
    if (_callback) {
        let handler = {
            id: null,
            active: true,
            remove: () => {
                handler.active = false;
                window.cancelAnimationFrame(handler.id)
            }
        };
        function loop() {
            //           
            if (!LOOPCONTROL.paused) {
                _callback();
            }
            //
            if (handler.active) {
                handler.id = window.requestAnimationFrame(loop);
            }
        }
        handler.id = window.requestAnimationFrame(loop);

        return handler;
    }
    return null;
}

///////////////////////////////////////////////////
class Entity {
    constructor(intialParams) {
        this.$ID = getNewId();
        this.childrenList = [];
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.dom = document.createElement("div");
        this.dom.className = "Entity";
        this.__paused = false;
        ///ASSING PROPERTIES
        if (intialParams) {
            assingProperties(this, intialParams);
        }

    }
    pauseloop() {
        this.__paused = true;
    }
    unpauseloop() {
        this.__paused = false;
    }
    onBeforeDraw() {

    }
    onAfterDraw() {

    }
    onRun() {

    }
    $run() {

        // IF STILL CONNECGTED
        if (this._parent && !this.__paused) {
            // LAUNCH BEFORE ANYTHIG
            try {
                this.onRun();
            } catch (e) {
                console.warn(e);
            }

            // LAUNCH BEFORE DRAW
            try {
                this.onBeforeDraw();
            } catch (e) {
                console.warn(e);
            }

            // DRAW HERE.
            try {
                this.draw();
            } catch (e) {
                console.warn(e);
            }
            // LAUNCH AFTER DRAW

            try {
                this.onAfterDraw();
            } catch (e) {
                console.warn(e);
            }

            //// DO onENTERFRAME LOOP - HERE LISTEN onEnterFrames.
            try {
                this.onEnterFrame();
            } catch (e) {
                console.warn(e);
            }
            //// NOW TELL YOUR CHILDS TO RUN
            for (let i in this.childrenList) {
                try {
                    if (!this._parent) {
                        break;
                    }
                    let _child = this.childrenList[i];
                    if (_child) {
                        if (_child.$run != null) {
                            _child.$run();
                        }
                    }
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }

    onEnterFrame() {
        // TO BE OVERRIDED
    }

    draw() {
        ///         
        assingProperties(this.dom.style, {
            left: (this.x) + "px",
            top: (this.y) + "px",
        });
    }

    addChild(_child) {

        _child._parent = this;
        this.childrenList.push(_child);
        this.dom.appendChild(_child.dom);
        return _child;
    }

    clear() {
        for (let i in this.childrenList) {
            this.childrenList[i]._parent = null;
            this.dom.removeChild(this.childrenList[i].dom);

        }
        this.childrenList = [];
    }
    removeChild(_child) {
        if (_child._parent == this) {
            for (let i in this.childrenList) {
                if (this.childrenList[i].$ID == _child.$ID) {
                    this.childrenList.splice(i, 1);
                    _child._parent = null;
                    this.dom.removeChild(_child.dom);
                    break;
                }
            }
        }
    }

    remove() {
        if (this._parent) {
            this._parent.removeChild(this);
            this.onRemove();
        }
    }

    onRemove() {
        // TO OVERRIDE
    }
}

class Game extends Entity {
    static current;
    constructor() {
        super();
        this._parent = {};
        this.dom.id = "game";
        this.slow = 0;
        Game.current = this;
        MAIN.appendChild(this.dom);
    }
    pause() {
        LOOPCONTROL.paused = true;
    }
    play() {
        LOOPCONTROL.paused = false;
    }
    static slow(ticksToNormal) {
        Game.current.slow = ticksToNormal;

    }
    calcViewPort() {

        /**
         * 
         *  CALCULAMOS EL ASPECT RATIO 4:3
         * 
         
        let viewport = calculateAspectRatioFit(16, 9, innerWidth, innerheight);
        let w = Math.round(viewport.width * .9);
        let h = Math.round(viewport.height * .9);
        this.dom.style.width = w + "px";
        this.dom.style.height = h + "px";
        this.dom.style.left = `calc(50% - ${w / 2}px)`;
        this.dom.style.top = `calc(50% - ${h / 2}px)`;
        */

    }
    init() {
        document.body.appendChild(MAIN);
        // INICIAMOS EL LOOP PRINCIPAL
        let ticks = 0;
        let maxTicksToRefresh = 0;
        onEnterFrame(() => {

            if (this.slow > 0) {
                this.slow--;
                maxTicksToRefresh = this.slow;
            } else if (maxTicksToRefresh > 0) {
                maxTicksToRefresh = 0;
            }
            if (ticks >= maxTicksToRefresh) {
                this.$run();
                ticks = 0;
            } else {
                ticks++;
            }

        });
    }
}



class Group extends Entity {
    constructor(intialParams) {
        super(intialParams);
    }
}
/**
 *  OBJETO PARA maquetar un mapa
 */
class GridMap {
    constructor(imageurl, gridsize, layers = []) {
        this.$ID = getNewId();
        this.layers = layers;
        this.gridsize = gridsize;
        this.tilesetImage = null;
        this.canvas = document.createElement("canvas");
        this.dom = document.createElement("div");
        this.dom.className = "gridmap";
        this.dom.append(this.canvas);
        this.toggleFrameDirective = null;
        this.size = null;
        this.tint = null;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.$dirty = true;
        assingProperties(this.dom.style, {
            position: "absolute",
            top: 0,
            left: 0
        });
        loadImage(imageurl).then((_img) => {
            this.tilesetImage = _img;
        });
    }

    onEnterFrame() {

    }
    $run() {
        assingProperties(this.dom.style, {
            left: (this.x) + "px",
            top: (this.y) + "px"
        });
        this.onEnterFrame();
        this.draw();
    }
    draw() {

        if (!this.tilesetImage) {
            return;
        }
        if (this.tilesetImage.width) {
            //  SIZE= COLS, ROWS.
            this.size = [parseInt(this.tilesetImage.width / this.gridsize), parseInt(this.tilesetImage.height / this.gridsize)]
        }
        if (!this.size) {
            return;
        }
        if (!this.layers) {
            return;
        }
        if (!this.$dirty) {
            return;
        }
        let ctx = this.canvas.getContext("2d");
        this.$dirty = false;
        ctx.clearRect(0, 0, this.width, this.height);
        this.layers.forEach((layer) => {
            Object.keys(layer).forEach((key) => {
                //Determine x/y position of this placement from key ("3-4" -> frame(i))
                if (this.toggleFrameDirective) {
                    if (this.toggleFrameDirective.hasOwnProperty(layer[key].join("-"))) {
                        layer[key] = this.toggleFrameDirective[layer[key].join("-")];

                    }
                }
                let p = key.split("-");
                let pX = (Number(p[0]) * this.gridsize);
                let pY = (Number(p[1]) * this.gridsize);
                let c = layer[key][0];
                let r = layer[key][1];


                ctx.drawImage(
                    this.tilesetImage,
                    c * this.gridsize,
                    r * this.gridsize,
                    this.gridsize,
                    this.gridsize,
                    pX,
                    pY,
                    this.gridsize,
                    this.gridsize
                );
                // HERE TO TINT...
                if (this.tint != null) {
                    var myImg = ctx.getImageData(
                        pX,
                        pY,
                        this.gridsize,
                        this.gridsize);

                    for (var i = 0, n = myImg.data.length; i < n; i += 4) {
                        // R, G, B
                        let rgb = [myImg.data[i], myImg.data[i + 1], myImg.data[i + 2], myImg.data[i + 3]];

                        for (let j in this.tint) {

                            let colortoReplace = this.tint[j].replace;
                            let newcolor = this.tint[j].color;
                            if (rgb[0] == colortoReplace[0] && rgb[1] == colortoReplace[1] && rgb[2] == colortoReplace[2]) {
                                myImg.data[i] = newcolor[0];
                                myImg.data[i + 1] = newcolor[1];
                                myImg.data[i + 2] = newcolor[2];
                            }

                        }
                    }
                    ctx.putImageData(myImg, pX,
                        pY);
                }

            });
        });
    }
}

/**
 *  LOS SPRITES SON MAPAS DE IMAGENS PARTIDAS POR FRAMES
 *  CADA FRAME REPRESENTA UN MOVIMIENTO Y ETC
 */
class SpriteMap {
    constructor(urlimage, fromx, fromy, maxwidth, maxheight, frame_width, frame_height, _tint = null) {
        //urlimage, fromx, fromy, width, height, framesize
        this.$ID = getNewId();
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.width = frame_width;
        this.height = frame_height;
        this.tint = _tint;
        ///
        let columns = parseInt(maxwidth / frame_width);
        let rows = parseInt(maxheight / frame_height);
        this.totalframes = columns * rows;

        this.dom = document.createElement("div");
        this.dom.className = "sprite";
        assingProperties(this.dom.style, {
            width: (this.width) + "px",
            height: (this.height) + "px",
            position: "absolute"
        });
        this.urlimage = urlimage;
        this.frames = [];
        this.frame = 0;

        this.ready = false;
        this.maxframes = this.totalframes - 1;
        this.metainfo = {
            columns, rows
        };
        ////////////////////////////////////////// 
        this.$dirtyvals = {
            scaleX: this.scale,
            scaleY: this.scale,
            rotation: this.rotation,
            x: this.x,
            y: this.y,
            frame: null,
            tint: this.tint
        };
        //////////////////////////////////////////
        loadImage(urlimage).then(async () => {
            let i = 0;
            while (i < this.totalframes) {
                let c = i % columns;
                let r = parseInt(i / columns);
                let _x = fromx + (c * frame_width);
                let _y = fromy + (r * frame_height);
                this.frames[i] = {

                    x: _x,
                    y: _y,
                    w: frame_width,
                    h: frame_height,
                    c, r, imgdata: (await cropimage(urlimage, _x, _y,
                        frame_width, frame_height, this.tint))
                };
                i++;
            }
            this.ready = true;

        });
        ///////////
        this.callFnBeforeDraw = null;
        //
        this.animationControl = new SpriteAnimationControl(this, [0]);


    }

    setScale(n, m) {
        this.scaleX = n;
        this.scaleY = m || n;
    }
    update() {
        for (let prop in this.$dirtyvals) {
            this.$dirtyvals[prop] = null;
        }
    }
    setTint(_newTint) {

        return new Promise(async (_resolve) => {
            this.$dirtyvals.tint = _newTint;
            for (let i in this.frames) {
                this.frames[i].imgdata = (await cropimage(this.urlimage, this.frames[i].x,
                    this.frames[i].y, this.frames[i].w, this.frames[i].h, _newTint))
            }
            _resolve();
        })
    }
    draw() {
        if (this.frame > this.maxframes) {
            this.frame = 0;
        }

        assingProperties(this.dom.style, {
            left: (this.x) + "px",
            top: (this.y) + "px"
        });


        try {
            let data = this.frames[this.frame];
            this.dom.style.backgroundImage = `url("${data.imgdata}")`;
        } catch (e) {
            console.log(e)
        }


        // DO ALWAYS CALL THIS.
        this.dom.style.transform = `scale(${this.scaleX},${this.scaleY}) rotate(${this.rotation}deg)`;
        this.$dirtyvals.scaleX = this.scaleX + 0;
        this.$dirtyvals.scaleY = this.scaleY + 0;
        this.$dirtyvals.rotation = this.rotation + 0;
        this.$dirtyvals.x = this.x + 0;
        this.$dirtyvals.y = this.y + 0;
        this.$dirtyvals.frame = this.frame + 0;


    }

    $run() {
        if (this.ready) {
            //
            if (this.animationControl) {
                this.animationControl.run();
            }
            //
            let $dirty = false;
            for (let prop in this.$dirtyvals) {
                if (this.$dirtyvals[prop] != this[prop]) {
                    $dirty = true;
                    break;
                }
            }
            if ($dirty) {

                this.draw();
            }
        }

    }



}


////////////////////////////////////////////////////////////////////////////////
function SpriteAnimationControl(_sprite, _frames = [], _onAnimationEnd, _onBeforeEnd) {
    let tick = 0;
    let index = 0;
    let frames = _frames;
    let totalIterations = _frames.length;
    let pretotalIterations = totalIterations - 1;
    let playing = true;
    var onAnimationEnd = _onAnimationEnd;
    var onBeforeEnd = onBeforeEnd;
    var onTickCallback;
    this.maxticks = 6;
    this.loop = true;
    this.onAnimationEnd = function (_onAnimationEnd) {
        onAnimationEnd = _onAnimationEnd;
    }
    this.beforeEnd = function (_onBeforeEnd) {
        onBeforeEnd = _onBeforeEnd;
    }
    this.onTick = function (_onTick) {
        onTickCallback = _onTick;
    }
    this.setFrames = function (_frames, _onAnimationEnd) {
        frames = _frames;
        index = 0;
        totalIterations = _frames.length;
        pretotalIterations = totalIterations - 1;
        if (_onAnimationEnd) {
            onAnimationEnd = _onAnimationEnd;
        }
    };
    this.getFrames = function () {
        return frames;
    }
    this.isPlaying = function () {
        return playing;
    }
    this.play = function () {
        playing = true;
        tick = 0;
        index = 0;
        _sprite.frame = frames[0];
    };
    this.pause = function () {
        playing = false;
    }
    this.stop = function () {
        playing = false;
    }
    this.run = function () {
        if (playing) {
            tick++;
            if (onTickCallback) {
                onTickCallback(tick);
            }
            if (tick >= this.maxticks) {
                tick = 0;

                _sprite.frame = frames[index];
                index++;
                if (index == pretotalIterations) {
                    if (onBeforeEnd) {
                        onBeforeEnd();
                    }
                }
                if (index >= totalIterations) {
                    index = 0;
                    // CALL THIS IF EXIST
                    if (onAnimationEnd) {
                        onAnimationEnd();
                    }
                    if (!this.loop) {
                        playing = false;
                    }
                }
            }
        }
    }

}

////////////////////////////////////////////////////////////////////////////////
const CommonsService = {
    getAnythingAtCells: function (_cellpositions) { },
    maphittest: function (nx, ny, width, height) { }
}
//////////////////////////
const ButtonListener = {
    currentMap: {},
    queue: [],
    active: true,
    disabled: function () {
        this.active = false;
    },
    enabled: function () {
        this.active = true;
    },
    listen: function (mapListen) {

        if (this.currentMap != null) {
            this.queue.unshift(this.currentMap);
        }
        this.currentMap = mapListen;

    },
    shift: function () {
        this.currentMap = this.queue.shift() || null;
    }

};
{
    let pressed = {};
    function dispatchEvent(eventname, p) {
        if (ButtonListener.active) {
            if (ButtonListener.currentMap.hasOwnProperty(eventname)) {
                ButtonListener.currentMap[eventname](p);
            }
        }
    }
    function onKeyUp(e) {
        let keycode = e.key == " " ? "space" : e.key.toLowerCase().trim();
        delete pressed[keycode];
        dispatchEvent("release_" + keycode);
        dispatchEvent("release_any", keycode);

    }
    function onKeyDown(e) {
        let keycode = e.key == " " ? "space" : e.key.toLowerCase().trim();
        pressed[keycode] = 1;
        dispatchEvent("press_" + keycode);
        dispatchEvent("press_any", keycode);
    }
    onEnterFrame(() => {
        if (ButtonListener.active) {
            for (let keycode in pressed) {
                dispatchEvent("press_" + keycode);
            }
        }
    })
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
}
////////////////////////////
export default { Entity, Game, GridMap, Group, SpriteMap, ButtonListener, CommonsService, bodyHittest, onEnterFrame, loadImage, cropimage };