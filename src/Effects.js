import jsGame from "./jsGame.js";

function dustBoom(parent, x, y, times = 1, sizes = [3, 6]) {
    // CREATE N PARTICLES
    while (times > 0) {

        let p = new jsGame.Entity();
        let o = 1;
        let s = random(sizes[0], sizes[1]);
        p.vel = random(1, 3) / 2;
        p.x = x;
        p.y = y;
        let color = ["white", "gray", "#f1f1f1", "darkgrey"][random(0, 3)];
        p.dom.classList.add("circle-particle");
        p.dom.style.opacity = 0;
        p.dom.style.backgroundColor = color;
        p.angle = random(0, 360);
        let vx = Math.cos(p.angle);
        let vy = Math.sin(p.angle);
        p.onEnterFrame = () => {

            o -= 0.05;
            s *= 0.99;
            p.vel *= 0.9;
            p.x -= (vx * p.vel);
            p.y -= (vy * p.vel);
            assingProperties(p.dom.style, {
                opacity: o,
                width: s + "px",
                height: s + "px",
                zIndex: parseInt(p.y)
            });
            if (o < 0.2) {
                p.remove();
            }
        }
        parent.addChild(p);


        times--;
    }
}
function particleDust(parent, x, y, direction, times = 1) {
    // CREATE N PARTICLES
    while (times > 0) {
        let p = new jsGame.Entity();
        let o = 1;
        let s = random(3, 6);
        p.vel = random(1, 3) / 2;
        p.x = x;
        p.y = y;
        let color = ["white", "gray", "#f1f1f1", "darkgrey"][random(0, 3)];
        p.dom.classList.add("circle-particle");
        p.dom.style.opacity = 0;
        p.dom.style.backgroundColor = color;
        p.onEnterFrame = () => {

            o -= 0.05;
            s *= 0.99;
            p.vel *= 0.9;
            p.x -= (direction[0] * p.vel);
            p.y -= p.vel;
            assingProperties(p.dom.style, {
                opacity: o,
                width: s + "px",
                height: s + "px",
                zIndex: parseInt(p.y)
            });
            if (o < 0.2) {
                p.remove();
            }
        }
        parent.addChild(p);
        times--;
    }
}

export default { particleDust, dustBoom };