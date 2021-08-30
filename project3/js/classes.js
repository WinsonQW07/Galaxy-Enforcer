class Ship extends PIXI.Sprite
{
    constructor(x = 0, y = 0)
    {
        super(app.loader.resources["images/spaceship.png"].texture);
        this.anchor.set(.5, .5); //position, scaling, rotating etc are now from center of sprite
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

class Circle extends PIXI.Graphics
{
    constructor(radius, color = 0xFF0000, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
        this.healthSpeed = 5;
        this.fly = {x:0,y:-1};
    }

    move(dt = 1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    movePowerUp(dt = 1/60)
    {
        this.x += this.healthSpeed;
    }


}

class Star extends PIXI.Graphics
{
    constructor(radius, color = 0xFF0000, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.fwd = {x:0,y:-1};
        this.speed = 15;
    }

    move(dt = 1/60)
    {
        this.x -= this.fwd.y * this.speed;
    }

}

class Rect extends PIXI.Graphics
{
    constructor(color = 0xFF00FF, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawRect(-20,-30,40,60);
        
        this.endFill();
        this.x = x;
        this.y = y;

        //variables
        this.fwd = {x:0,y:-1};
        this.speed = 600;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1/60)
    {
        this.x -= this.fwd.y * this.speed * dt;
    }
}

class Boss extends PIXI.Graphics
{
    constructor(color = 0x770075, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawRect(-20,-30,300,400);
        
        this.endFill();
        this.x = x;
        this.y = y;

        //variables
        this.fwd = {x:0,y:-1};
        this.speed = 100;
        this.isAlive = true;
        Object.seal(this);
    }

    moveBoss(dt = 1/60)
    {
        this.x -= this.fwd.y * this.speed * dt;
    }

    verticalMove(dt = 1/60)
    {
        this.y += this.fwd.y * this.speed * dt;
    }

    changeDirection()
    {
        this.fwd.y *= -1;
    }

}

class LifeBar extends PIXI.Graphics
{
    constructor(color = 0xFF0000, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawRect(-20,-30,200,20);
        this.width = 200;
        this.height = 20;
        
        this.endFill();
        this.x = x;
        this.y = y;
        this.active = true;

        //variables
        this.fwd = {x:0,y:-1};
        Object.seal(this);
    }

}

class Minion extends PIXI.Graphics{
    constructor(x = 0, y = 0)
    {
        super(app.loader.resources["images/minion.jpg"].texture);
        this.anchor.set(.5, .5); 
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt = 1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
    
    }

}

class Bullet extends PIXI.Graphics{
    constructor(color=0xFFFFFF, x=0, y=0)
    {
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,20,6);
        this.endFill();
        this.x = x;
        this.y = y;
        //variables
        this.fwd = {x:0,y:-1};
        this.speed = 800;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1/60)
    {
        this.x += this.fwd.y * this.speed * dt;
    }

    enemyMove(dt = 1/60)
    {
        this.x -= this.fwd.y * this.speed * dt;
    }
}