import BD from "./BD.js";
import jsGame from "./jsGame.js";
import Scene from "./Scene.js"; 
import UiInterface from "./UInterface.js";


let game = new jsGame.Game();
let scene = new Scene();
let UI=new UiInterface();
jsGame.CommonsService.current = game;
game.addChild(scene);
game.addChild(UI);
game.init(); 
// PRELOAD ALL
BD.onReady.then(() => {

    // PRELOAD STAGES
    return scene.preloadAll(()=>{
        console.log("LOADING...")
    });

}).then(() => {
  
    scene.init();
})

window.$game = game;