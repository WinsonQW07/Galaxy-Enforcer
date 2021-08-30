"use strict";

const app = new PIXI.Application(
    {
        width:600,
        height: 600,
    }
);
document.body.appendChild(app.view);

const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

app.loader.
    add([
        "images/spaceship.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();





let stage;


let startScene;
let gameScene,ship;
let gameOverScene;






function setup()
{
    stage = app.stage;

    startSccene = new PIXI.Container();
    stage.addChild(startScene);


    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);



    ship = new ship();
    gameScene.addChild
}