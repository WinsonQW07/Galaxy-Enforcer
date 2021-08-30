// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 1000,
    height: 700,
    view: document.querySelector("pixi"),
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
app.loader.
    add([
        "images/spaceship.png",
        "images/minion.jpg",

    ]);
//app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// game variables
let startScene;
let instructionScene;
let gameScene,ship,lifeLabel;
let gameOverScene;
let missionCompleteScene;

//audio
let backgroundMusic;
let mainMusic;
let fireSound;
let buttonSound;
let collectSound;
let damagedSound;
let enemyDeathSound;
let gameOverSound;
let bossHitSound;
let bossDeathSound;
let victoryTheme;

let circles = [];
let bullets = [];
let enemyBullets = [];
let minions = [];
let explosions = [];
let stars = [];
let healths = [];
let shields = [];
let fuels = [];
let bosses = [];

let life = 100;
let levelNum = 1;
let paused = true;

let healthbar = new LifeBar(0x00FF00);
let shieldbar = new LifeBar(0x0000FF);
let fuelbar = new LifeBar(0xFFA500);
let bossBar = new LifeBar(0xFF0000);

let boss = new Boss();
let progressBar = new PIXI.Text();

let reloadTime = 0;
let progress = 0;
let bossSummon = 1;
let playOnce = 0;
let endingTime = 0;

function setup() {
	stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    //creates the instruction scene
    instructionScene = new PIXI.Container();
    instructionScene.visible = false;
    stage.addChild(instructionScene);
	
    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    //creates the win screen
    missionCompleteScene = new PIXI.Container();
    missionCompleteScene.visible = false;
    stage.addChild(missionCompleteScene);
	
    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
	
	//5 - Create ship
    ship = new Ship();
    gameScene.addChild(ship);
	
    // #6 - Load Sounds
    backgroundMusic = new Howl({
        src: ["sounds/imperial.mp3"]
    });

    fireSound = new Howl({
        src: ["sounds/gun.mp3"]
    });

    mainMusic = new Howl({
        src: ["sounds/main.mp3"]
    });

    buttonSound = new Howl({
        src: ["sounds/buttonClick.mp3"]
    });

    collectSound = new Howl({
        src: ["sounds/collect.ogg"]
    });

    damagedSound = new Howl({
        src: ["sounds/damaged.ogg"]
    });

    enemyDeathSound = new Howl({
        src: ["sounds/enemyDeath.wav"]
    });

    gameOverSound = new Howl({
        src: ["sounds/gameOver.wav"]
    });

    bossHitSound = new Howl({
        src: ["sounds/bossHit.wav"]
    });

    bossDeathSound = new Howl({
        src: ["sounds/bossDeath.wav"]
    });

    victoryTheme = new Howl({
        src: ["sounds/victory.mp3"]
    });

    // #7 - Load sprite sheet
    // explosionTextures = loadSpriteSheet();
		
    // #8 - Start update loop
    app.ticker.add(gameLoop);
	
    mainMusic.play();
}

function createLabelsAndButtons()
{
    let buttonStyle = new PIXI.TextStyle(
        {
            fill: 0xFF0000,
            fontSize: 48,
            fontFamily: "\"Arial Black\", Gadget, sans-serif",
        }
    );


    //1 - set up startScene
    //1A - make the top start label
    let mainTitle = new PIXI.Text("Galaxy Enforcer");
    mainTitle.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 95,
        fontFamily: "Impact, Charcoal, sans-serif",
        fontStyle: "bold",
        stroke: 0xFFFFFF,
        strokeThickness: 8,
    });
    mainTitle.x = 200;
    mainTitle.y = 80;
    startScene.addChild(mainTitle);
    

    // 1B - make the middle start label
    let subText = new PIXI.Text("Come save the Universe");
    subText.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 52,
        fontFamily: "\"Comic Sans MS\", cursive, sans-serif",
        fontStyle: "italic",
        stroke: 0xFFFFFF,
        strokeThickness: 5,
        wordWrap: true,
        wordWrapWidth: 200,
        align: "center",
    });
    subText.x = sceneWidth/2 - 80;
    subText.y = 230;
    startScene.addChild(subText);

    //1c - make the start game button
    let startButton = new PIXI.Text("Begin");
    startButton.style = buttonStyle;
    startButton.x = 450;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    // startButton.on("pointerup", startGame);  //startGame is a function reference
    startButton.on("pointerup", instructions); 
    startButton.on("pointerup", playButtonSound);
    startButton.on("pointerover",e=>e.target.alpha = 0.7); //concise arrow function with no brackets
    startButton.on("pointerout",e=>e.currentTarget.alpha = 1.0); //ditto
    startScene.addChild(startButton);



    //Creates the instructions title
    let instructionsTitle = new PIXI.Text("Instructions");
    instructionsTitle.style = subText.style;
    instructionsTitle.x = 400;
    instructionsTitle.y = 40;
    instructionScene.addChild(instructionsTitle);
    //Creates the instructions to the game
    let instructText = new PIXI.Text('Press WASD or Arrow keys to move \nClick or hold Space to shoot \nCollect red orbs to gain health \nCollect blue orbs to gain shield \nCollect orange orbs to gain fuel, do not let it run out! \nAvoid the purple enemies or destroy them \nGood luck Captain!');
    instructText.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 28,
        fontFamily: "\"Arial Black\", Gadget, sans-serif",
        stroke: 0xFFFFFF,
        strokeThickness: 4,
        align: "left",
        lineHeight: 60,
    });
    instructText.x = 100;
    instructText.y = 150;
    instructionScene.addChild(instructText);

    //Creates a button that lets the user start the game
    let playButton = new PIXI.Text("Play");
    playButton.style = buttonStyle;
    playButton.x = 450;
    playButton.y = sceneHeight - 100;
    playButton.interactive = true;
    playButton.buttonMode = true;
    // startButton.on("pointerup", startGame);  //startGame is a function reference
    playButton.on("pointerup", startGame); 
    playButton.on("pointerup", playButtonSound); 
    playButton.on("pointerover",e=>e.target.alpha = 0.7); //concise arrow function with no brackets
    playButton.on("pointerout",e=>e.currentTarget.alpha = 1.0); //ditto
    instructionScene.addChild(playButton);

    //2 - set up gameScene
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "\"Arial Black\", Gadget, sans-serif",
        stroke: 0xFF0000,
        strokeThickness: 2,
    });

    //2A - make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 15;
    lifeLabel.y = 20;
    lifeLabel.text = "Health";
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    //shield label
    let shieldLabel = new PIXI.Text();
    shieldLabel.style = textStyle;
    shieldLabel.x = 15;
    shieldLabel.y = 40;
    shieldLabel.text = "Shields";
    gameScene.addChild(shieldLabel);

    //fuel label
    let fuelLabel = new PIXI.Text();
    fuelLabel.style = textStyle;
    fuelLabel.x = 15;
    fuelLabel.y = 60;
    fuelLabel.text = "Fuel";
    gameScene.addChild(fuelLabel);

    //progress bar
    progressBar.style = textStyle;
    progressBar.x = sceneWidth/2;
    progressBar.y = 30;
    progressBar.text = "Progress " + progress + "%";
    gameScene.addChild(progressBar);

    //3 - set up gameOverScne
    //3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 104,
        fontFamily: "Impact, Charcoal, sans-serif",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 300;
    gameOverText.y = sceneHeight/2 - 260;
    gameOverScene.addChild(gameOverText);

    let gameOverSubText = new PIXI.Text("Captain! What happened? CAPTAIN! CAAAAAAPTAIN!");
    gameOverSubText.style = subText.style;
    gameOverSubText.x = 310;
    gameOverSubText.y = 240;
    gameOverScene.addChild(gameOverSubText);

    //win screen text
    let winText = new PIXI.Text("Mission Complete");
    winText.style = textStyle;
    winText.x = 150;
    winText.y = 250;
    missionCompleteScene.addChild(winText);
 
}
//Sets up the visibility in the instructions menu
function instructions()
{
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    instructionScene.visible = true;
    missionCompleteScene.visible = false;
}

function startGame()
{
    mainMusic.stop();
    startScene.visible = false;
    gameOverScene.visible = false;
    missionCompleteScene.visible = false;
    gameScene.visible = true;
    instructionScene.visible = false;
    paused = false;

    life = 100;
    healthbar.width = 200;
    shieldbar.width = 100;
    fuelbar.width = 200;
    bossBar.width = 500;
    progress = 0;

    backgroundMusic.play();

    //resets the lists
    circles.length = 0;
    bullets.length = 0;
    enemyBullets.length = 0;
    minions.length = 0;
    healths.length = 0;
    shields.length = 0;
    fuels.length = 0;
     
    if(gameScene.visible = true)
    {
    //calls the function after a certain time has passed
  //Creates enemies
    setInterval(function()
    {
   // console.log("Seconds");
    createEnemies();
    },5000);

    //Creates health powerups
    setInterval(function()
        {
           //console.log("health");
           createHealth();
        }, 10000);

    //Creates a shield powerup 
    setInterval(function()
    {
       // console.log("shield");
        createShield();
    }, 15000);

    //creates fuels
    setInterval(function()
    {
        //console.log("fuel");
        createFuel();
    }, 20000);
    
    //makes the enemies attack
    setInterval(function()
    {
       // console.log("enemy bullet");
        createEnemyBullet();
    }, 1500);
    
    //makes the boss attack
    setInterval(function()
    {
        //console.log("boss bullet");
        createBossBullets();

    },1000);
    }

    decreaseLifeBy(0);
    ship.x = 700;
    ship.y = 350;
    loadLevel();
    //Sets up the life bars
    createLifeBar(120,50);
    createShieldBar(107,70);
    createFuelBar(120,95);
}

//decreases the healthbar or shields
function decreaseLifeBy(value)
{
    //If the shields are not active, the health bar will decrease
    if(shieldbar.active = false || shieldbar.width <= 0)
    {
        // life -= value;
        // life = parseInt(life);
        healthbar.width -= value;
    }
    //If shields are on, the shields will take damage first
    if(shieldbar.active = true || shieldbar.width > 0)
    {
        shieldbar.width -= value;
    }
}
//Increases the health bar
function increaseLifeBy(value)
{
    life += value;
    life = parseInt(life);
   // lifeLabel.text = `Life      ${life}%`;
    healthbar.width += value;
}

//Increases the shield bar
function increaseShieldLife(value)
{
    shieldbar.width += value;
    if(shieldbar.active = false)
    {
        shieldbar.active = true;
    }
}

let keys = {};
let keysDiv;

//keyboard event handlers
window.addEventListener("keydown", keysDown);
window.addEventListener("keyup", keysUp);

function keysDown(e)
{
//console.log(e.keyCode);
keys[e.keyCode] = true;
}

function keysUp(e)
{
   // console.log(e.keyCode);
    keys[e.keyCode] = false;
}

function gameLoop(){
	 if (paused) return; // keep this commented out for now
	
    // #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if(dt > 1/12)
    {
        dt = 1/12;
    }
    //increases the progress bar over time
    progress += .04;
    progress = Math.round(progress * 100) / 100;
    progressBar.text = "Progress " + progress +"%";
    if(progress >= 100)
    {
        progress = 100;
    }

    //W or Up arrow
    if(keys["87"] || keys["38"])
    {
        ship.y -= 10;
    }
    //A or left arrow
    if(keys["65"] || keys["37"])
    {
        ship.x -= 10;
    }
    //S or down arrow
    if(keys["83"] || keys["40"])
    {
        ship.y += 10;
    }
    //D or right arrow
    if(keys["68"] || keys["39"])
    {
        ship.x += 10;
    }


    reloadTime += 0.01;

    //space bar, can only shoot after a certain amount of time has passed
    if(keys["32"] && reloadTime >= 0.3)
    {
        fireBullet();
        reloadTime = 0;
        fireSound.play();
    }

    //creates the boss once the progress bar is full
    if(progress >= 100)
    {
        createBossBar(sceneWidth/4, 675);
        // let bossLabel = new PIXI.Text("Zektor");
      
        // bossLabel.style = new PIXI.TextStyle({
        //     fill: 0xFF0000,
        //     fontSize: 25,
        //     fontFamily: "Impact, Charcoal, sans-serif",
        //     fontStyle: "bold",
        //     stroke: 0xFFFFFF,
        //     strokeThickness: 6
        // });

        // bossLabel.x = 75;
        // bossLabel.y = 635;

        // gameScene.addChild(bossLabel);
    }


	
	// #2 - Move Ship
    let amt = 6 * dt; // at 60 FPS would move about 10% of distance per update

    // keep the ship on the screen with clamp()
    let w2 = ship.width/2;
    let h2 = ship.height/2;
    if(ship.x > sceneWidth - 10)
    {
        ship.x = sceneWidth - 10;
    }
    if(ship.x < 0)
    {
        ship.x = 0;
    }
    if(ship.y > sceneHeight - 10)
    {
        ship.y = sceneHeight - 10;
    }
    if(ship.y < 0)
    {
        ship.y = 0;
    }

	// #4 - Move Bullets
    for(let b of bullets)
    {
        b.move(dt);
        if(b.x < -100)
        {
            gameScene.removeChild(b);
            b.isAlive = false;
        }
    }

    //Moves health powerups
    for(let h of healths)
    {
        h.movePowerUp(dt);
        if(h.x > 1000)
        {
            gameScene.removeChild(h);
            h.isAlive = false;
        }

        if(h.isAlive && rectsIntersect(h, ship))
        {
            gameScene.removeChild(h);
            h.isAlive = false;
            increaseLifeBy(10);
            collectSound.play();
        }
    }
    //Moves shield powerups
    for(let shield of shields)
    {
        shield.movePowerUp(dt);
        if(shield.x > 1000)
        {
            gameScene.removeChild(shield);
            shield.isAlive = false;
        }

        if(shield.isAlive && rectsIntersect(shield, ship))
        {
            gameScene.removeChild(shield);
            shield.isAlive = false;
            increaseShieldLife(10);
            collectSound.play();
        }
    }

    //moves the fuel
    for(let fuel of fuels)
    {
        fuel.movePowerUp(dt);
        if(fuel.x > 1000)
        {
            gameScene.removeChild(fuel);
            fuel.isAlive = false;
        }

        if(fuel.isAlive && rectsIntersect(fuel, ship))
        {
            gameScene.removeChild(fuel);
            fuel.isAlive = false;
            increaseFuel(75);
            collectSound.play();
        }
    }

    //moves the enemy's bullets
    for(let eb of enemyBullets)
    {
        eb.enemyMove(dt);
        if(eb.x > 1000)
        {
            gameScene.removeChild(eb);
            eb.isAlive = false;
        }

        if(eb.isAlive && rectsIntersect(eb, ship))
        {
            gameScene.removeChild(eb);
            eb.isAlive = false;
            decreaseLifeBy(10);
            damagedSound.play();
        }
    }
   
    
    //moves the enemies
    for(let enemy of minions)
    {
        enemy.move(dt);
        if(enemy.x > 1000)
        {
            gameScene.removeChild(enemy);
            enemy.isAlive = false;
        }

        if(enemy.isAlive && rectsIntersect(enemy,ship))
        {
            gameScene.removeChild(enemy);
            enemy.isAlive = false;
            decreaseLifeBy(20);
            damagedSound.play();
        }
        for(let bullet of bullets)
        {
            if(enemy.isAlive && rectsIntersect(enemy, bullet))
            {
                gameScene.removeChild(enemy);
                enemy.isAlive = false;
                gameScene.removeChild(bullet);
                bullet.isAlive = false;
                enemyDeathSound.play();
            }
        }
    }

    //Moves the stars in the background
    for(let star of stars)
    {
        star.move(dt);
        if(star.x > 1000)
        {
            star.x = randomNumber(-100,0);
        }
    }

    //moves the boss to a certain point horizontally
    for(let boss of bosses)
    {
        if(boss.x <= 100)
        {
            boss.moveBoss(dt)
        }

        //after reaching that point, makes the boss move up and down
        if(boss.x >= 100)
        {
            boss.verticalMove(dt);
            if(boss.y <=120)
            {
                boss.changeDirection();
                boss.verticalMove(dt);
            }
            if(boss.y >= 325)
            {
                boss.changeDirection();
                boss.verticalMove(dt);
            }
        }

        for(let bullet of bullets)
        {
            if(boss.isAlive && rectsIntersect(boss, bullet))
            {
                gameScene.removeChild(bullet);
                bullet.isAlive = false;
                bossDamaged();
                bossHitSound.play();
            }
        }
        //makes the boss disappear once its health is gone
        if(bossBar.width <= 0)
        {
            boss.isAlive = false;
            gameScene.removeChild(boss);
            if(playOnce <= 0)
            {
                bossDeathSound.play();
                playOnce += 1;
            }
            //makes the user go to the win screen a few seconds after the boss's death
            endingTime += .1;
            //console.log(endingTime);
            if(endingTime >= 20)
            {
                missionComplete();
                return;
            }
     
        }
    
        if(boss.isAlive && rectsIntersect(boss,ship))
        {
            decreaseLifeBy(20);
        }
        
    }

	// #5 - Check for Collisions
    for(let c of circles)
    {
        for(let b of bullets)
        //5A- circles and bullets
        {
            if(rectsIntersect(c,b))
            {
                fireballSound.play();
                createExplosion(c.x,c.y,64,64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
            }

            if(b.y < -10)
            {
                b.isAlive = false;
            }
        }

        //5B - circles and ship
        if(c.isAlive && rectsIntersect(c,ship))
        {
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
    }
	
	// #6 - Now do some clean up
    //get rid of dead bullets
    bullets = bullets.filter(b=>b.isAlive);

    //get rid of dead circles
    circles = circles.filter(c=>c.isAlive);

    //get rid of explosions
    explosions = explosions.filter(e=>e.playing);

    //If the shield bar runs out, it become inactive
    if(shieldbar.width <= 0)
    {
        shieldbar.active = false;
        shieldbar.width = 0;
    }

    //If the health bar runs out, the game ends
    if(healthbar.width <= 10)
    {
        end();
        return;
    }
	
    decreaseFuel();
    //if the fuelbar runs out, the game ends
    if(fuelbar.width <= 0)
    {
        end();
        return;
    }

    //summons the boss
    if(progress >= 100 && bossSummon == 1)
    {
        bossSummon += 1;
        createBoss();
    }
}

//Returns a random number between 2 values
function randomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)+ min);
}
//creates the health powerups
function createHealth()
{
    if(!paused)
    {
        let h = new Circle(15, 0xFF0000);
        h.x = randomNumber(-1000,0);
        h.y = randomNumber(100,600);
        healths.push(h);
        gameScene.addChild(h);
    }
}
//creates the shield powerups
function createShield()
{
    if(!paused)
    {
        let shield = new Circle(15, 0x0000FF);
        shield.x =randomNumber(-1000,0);
        shield.y = randomNumber(100,600);
        shields.push(shield);
        gameScene.addChild(shield);
    }
}
//creates the fuels
function createFuel()
{
    if(!paused)
    {
        let fuel = new Circle(15, 0xFFA500);
        fuel.x =randomNumber(-1000,0);
        fuel.y = randomNumber(100,600);
        fuels.push(fuel);
        gameScene.addChild(fuel);
    }
}

//creates the enemies
function createEnemies()
{
    if(!paused)
    {
        //spawns enemies until the progress bar reaches 100%
        if(progress < 100)
        {
            for(let i = 0; i < 5; i ++)
            {
                let enemy = new Rect();
                enemy.x = randomNumber(-2000,0);
                enemy.y = randomNumber(100,600);
                minions.push(enemy);
                gameScene.addChild(enemy);
            }
        }
    }
}
//creates the life bar
function createLifeBar(x,y)
{
    healthbar.x = x;
    healthbar.y = y;
    gameScene.addChild(healthbar);
}
//creates the shield bar
function createShieldBar(x,y)
{
    shieldbar.x = x;
    shieldbar.y = y;
    gameScene.addChild(shieldbar);
}
//creates the fuel bar
function createFuelBar(x,y)
{
    fuelbar.x = x;
    fuelbar.y = y;
    gameScene.addChild(fuelbar);
}
//creates the boss's life bar
function createBossBar(x,y)
{
    bossBar.x = x;
    bossBar.y = y;
    gameScene.addChild(bossBar);
}

function createCircles(numCircles)
{
    for(let i = 0; i < numCircles; i++)
    {
        let c = new Circle(10, 0xFFFF00);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}
//creates the stars
function createStars(numStars)
{
    for(let i = 0; i < numStars; i++)
    {
        let starSize = randomNumber(1,2);
        let st = new Star(starSize, 0xFFFFFF)
        st.x = randomNumber(0,1000);
        st.y = randomNumber(0,700);
        stars.push(st);
        gameScene.addChild(st);

    }
}
//decreases the fuel bar over time
function decreaseFuel()
{
    fuelbar.width -= 2.5 * 1/60;
}
//increases the fuel bar
function increaseFuel()
{
    fuelbar.width += 50;
}
//boss takes damage
function bossDamaged()
{
    bossBar.width -= 10;
    if(bossBar.width <= 0)
    {
        bossBar.width = 0;
    }
}

//creates the stars once the game is loaded
function loadLevel()
{
    paused = false;
    createStars(50);
}
//game over scene
function end()
{
    paused = true;
    backgroundMusic.stop();
    //clear out level
    circles.forEach(c=>gameScene.removeChild(c)); //concise arrow function with no brackets and no return
    circles = [];

    bullets.forEach(b=>gameScene.removeChild(b));
    bullets = [];
    
    explosions.forEach(e=>gameScene.removeChild(e));
    explosions = [];

    enemyBullets.forEach(eb=>gameScene.removeChild(eb));
    enemyBullets = [];

    minions.forEach(m=>gameScene.removeChild(m));
    minions = [];

    healths.forEach(h=>gameScene.removeChild(h));
    healths = [];

    shields.forEach(s=>gameScene.removeChild(s));
    shields = [];

    fuels.forEach(f=>gameScene.removeChild(f));
    fuels = [];

    gameOverScene.visible = true;
    gameScene.visible = false;
    gameOverSound.play();
}
//win screen
function missionComplete()
{
    paused = true;
    backgroundMusic.stop();
    //clear out level
    circles.forEach(c=>gameScene.removeChild(c)); //concise arrow function with no brackets and no return
    circles = [];
    bullets.forEach(b=>gameScene.removeChild(b));
    bullets = [];
    explosions.forEach(e=>gameScene.removeChild(e));
    explosions = [];
    enemyBullets.forEach(eb=>gameScene.removeChild(eb));
    enemyBullets = [];
    minions.forEach(m=>gameScene.removeChild(m));
    minions = [];
    healths.forEach(h=>gameScene.removeChild(h));
    healths = [];
    shields.forEach(s=>gameScene.removeChild(s));
    shields = [];
    fuels.forEach(f=>gameScene.removeChild(f));
    fuels = [];
    missionCompleteScene.visible = true;
    gameScene.visible = false;
    victoryTheme.play();
}
//fires the player's bullets
function fireBullet(e)
{
    if(paused)
        {
            return;
        }

    let b = new Bullet(0x00FF00,ship.x, ship.y);
    bullets.push(b);
    gameScene.addChild(b);
}

// function loadSpriteSheet()
// {
//     //the 16 animation frames in each row are 64x64 pixels
//     //we are using the second row
//     // https://pixijs.download/release/docs/PIXI.BaseTexture.html
//     let spriteSheet = PIXI.BaseTexture.from("images/explosions.png");
//     let width = 64;
//     let height = 64;
//     let numFrames = 16;
//     let textures = [];
//     for(let i=0; i<numFrames; i++)
//     {
//         // https://pixijs.download/release/docs/PIXI.Texture.html
//         let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 64, width, height));
//         textures.push(frame);
//     }
//     return textures;
// }

// function createExplosion(x,y,frameWidth,frameHeight)
// {
//     //animation frames are 64x64 pixels
//     let w2 = frameWidth / 2;
//     let h2 = frameHeight / 2;
//     let expl = new PIXI.AnimatedSprite(explosionTextures);
//     expl.x = x - w2;
//     expl.y = y - h2;
//     expl.animationSpeed = 1/7;
//     expl.loop = false;
//     expl.onComplete = e=> gameScene.removeChild(expl);
//     explosions.push(expl);
//     gameScene.addChild(expl);
//     expl.play();
// }
//fires three bullets at once
function tripleShoot(e)
{
    if(paused)
    {
        return;
    }

let b = new Bullet(0xFFFFFF,ship.x, ship.y);
let bLeft = new Bullet(0xFFFFFF, ship.x - 5, ship.y);
let bRight = new Bullet(0xFFFFFF, ship.x + 5, ship.y);
bullets.push(b);
bullets.push(bLeft);
bullets.push(bRight);
gameScene.addChild(b);
gameScene.addChild(bLeft);
gameScene.addChild(bRight);
}
//creates the enemy's bullets
function createEnemyBullet()
{
    if(!paused)
    {
        for(let enemy of minions)
        {
            if(enemy.isAlive)
            {
                let eb = new Bullet(0xFF00FF, enemy.x, enemy.y);
                enemyBullets.push(eb);
                gameScene.addChild(eb);
            }
        }
    }
}
//creates the boss
function createBoss()
{
    boss.x = -500;
    boss.y = sceneHeight / 2 - 100;
    boss.isAlive = true;

    bosses.push(boss);
    gameScene.addChild(boss);
}
//creates the boss's bullets
function createBossBullets()
{
    if(!paused)
    {
        for(let boss of bosses)
        {
            let location = boss.y + 35;
            //makes the boss shoot 4 bullets at once at different locations
            for(let i = 0; i < 4; i++)
            {
                if(boss.isAlive)
                {
                    if(boss.x >= 100)
                    {
                        let bb = new Bullet(0x770075, boss.x, location);
                        enemyBullets.push(bb);
                        gameScene.addChild(bb);
                        location += 75;
                    }
                }
            }
        }
    }
}
//plays a sound when the button is clicked
function playButtonSound()
{
    buttonSound.play();
}