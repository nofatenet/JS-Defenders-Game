// Game Pattern:
// 1. Create Array that holds all Elements (Grid, Enemies, Defenders, Projectiles etc.)
// 2. Create a Class (Blueprint), to create many of those Elements, to fill the Array.
// 3. Add and Remove Elements from the Array as the Game runs.
// 4. Run a For Loop through the Array updating and Drawing each of the Elements through the AnimationFrame.

const canvas = document.getElementById('canvas1');

const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 600;

// Global Variables
const cellSize = 100;
const cellGap = 3;
let money = 750;
let enemiesInterval = 750;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 800; // In other words: Score at which Monsters will start to give up!
let chosenDefender = 0; // Better Select 1 for Default
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const moneys = [];


// BG

const bg1 = new Image();
bg1.src = "bg_1.png";
function drawBG(){
        ctx.drawImage(bg1, 0, 0, 900, 600);
}

// Mouse Controls
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false
}
canvas.addEventListener("mousedown", function() {
    mouse.clicked = true;
});
canvas.addEventListener("mouseup", function() {
    mouse.clicked = false;
});

let canvasPosition = canvas.getBoundingClientRect();
//console.log(canvasPosition);
canvas.addEventListener("mousemove", function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function(){
    mouse.x = undefined;
    mouse.y = undefined;
});


// Game Board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}

class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(this.x, this.y,this.width, this.height);
        }
    }
}
//This is to address every Cell on the Grid and fill the Array:
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();

// Now Cycle through the gameGrid Array and Draw it:
function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}

// Projectiles
class Projectiles {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.power = 20;
        this.speed = 6;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = "#ccc";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        //ctx.beginPath();
        //ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        //ctx.fill();
    }
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
            
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
    }
}

// Defenders

const defender1 = new Image();
defender1.src = "hero1.png";
const defender1card = new Image();
defender1card.src = "hero1_card.png";

const defender2 = new Image();
defender2.src = "hero2.png";
const defender2card = new Image();
defender2card.src = "hero2_card.png";

class Defender {
    constructor(x, y, baseHealth){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.baseHealth = 100;
        this.health = baseHealth;
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 256;
        this.spriteHeight = 256;
        this.minFrame = 0;
        this.maxFrame = 1;
        this.chosenDefender = chosenDefender;
    }
    update(){
        if (this.shooting){
            this.timer++;
            if (this.timer % 100 === 0) {
                projectiles.push(new Projectiles(this.x + 48, this.y + 40)); // Position of the Projectile
                this.frameX = 1;
            }
        } else {
            this.timer = 0;
            this.frameX = 0;
        }
    }
    draw(){
        //ctx.fillStyle = "#069";
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#048";
        ctx.font = "20px 'Press Start 2P'";
        ctx.fillText(Math.floor(this.health), this.x + 24, this.y + 24);
        
        if (this.chosenDefender === 1){
            ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 2){
            ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }
}

function handleDefenders(){
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        // Check if Enemy and Defender are on the same row(-1 means "not found"):
        if(enemyPositions.indexOf(defenders[i].y) !== -1){
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }

        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 1;
            }
            if (defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

// Select Unit Menu

const card1 = {
    x: 10,
    y: 10,
    width: 64,
    height: 80
}
const card2 = {
    x: 90,
    y: 10,
    width: 64,
    height: 80
}

function chooseDefender() {
    let card1stroke = "#000";
    let card2stroke = "#000";

    if (collision(mouse, card1) && mouse.clicked){
        chosenDefender = 1;
    } else if (collision(mouse, card2) && mouse.clicked){
        chosenDefender = 2;
    }

    if (chosenDefender === 1){
        card1stroke = "#ccc";
        card2stroke = "#000";
    } else if (chosenDefender === 2) {
        card1stroke = "#000";
        card2stroke = "#ccc";
    } else {
        card1stroke = "#000";
        card2stroke = "#000";
    }

    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
    ctx.drawImage(defender1card, 0, 0, 512, 512, 20, 8, 128, 128);
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.drawImage(defender2card, 0, 0, 512, 512, 100, 8, 128, 128);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
}

// Messages
const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color){
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update(){
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.01) this.opacity -= 0.01;
    }
    draw(){
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + "px 'Press Start 2P'";
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages(){
    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 90){        // duration of Message
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}

// Enemies

const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = "bat-anim1.png";
enemyTypes.push(enemy1);
// const enemy2 = new Image();
// enemy2.src = "enemy2.png";
// enemyTypes.push(enemy2);

class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;     // 2nd variable for movement speed (so enemy can go, stop, go...)
        //this.health = 100;
        this.health = Math.floor(Math.random() * 50 + 100);
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[0];
        // this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.frameX = 0;                // Horizontal Frame in Sprite-Sheet
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 2;      // Frames in the Sprite Sheet
        this.spriteWidth = 256;
        this.spriteHeight = 256;
    }
    update(){
        this.x -= this.movement;

        // Animate Sprite, Loop Frames:

        if (frame % 5 === 0) {     // Speed of Animation-Loop
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = this.minFrame;
            }
        }

    }
    draw(){
        //ctx.fillStyle = "#C64";
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#060";
        ctx.font = "20px 'Press Start 2P'";
        ctx.fillText(Math.floor(this.health), this.x + 24, this.y + 24);
        // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);     //s = source, d = destination
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
function handleEnemies(){
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedMoney = Math.floor(Math.random() * 30 + 10); //enemies[i].maxHealth/10;
            money += gainedMoney;
            score += gainedMoney;
            floatingMessages.push(new floatingMessage("+" + gainedMoney, enemies[i].x, enemies[i].y, 20, "gold"))
            floatingMessages.push(new floatingMessage("+" + gainedMoney, 400, 60, 20, "gold"))

            const findThisIndex = enemyPositions.indexOf(enemies[i].y)
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
            console.log(enemyPositions);
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 60; // Increase Here to pump up the Number of Spawns
        console.log(enemyPositions);
    }
}

// Money

const amounts = [10, 20, 30, 40, 50];

const money1 = new Image();
money1.src = "money1.png";

class Money {
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize;
        this.height = cellSize;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw(){
        //ctx.fillStyle = "#770";
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(money1, this.x, this.y, this.width, this.height);

        // Draw Amount Next to it?
        //ctx.fillStyle = "#ddd";
        //ctx.font = "20px 'Press Start 2P'";
        //ctx.fillText(this.amount, this.x + 16, this.y + 24);
    }
}
function handleMoney(){
    if (frame % 600 === 0 && score < winningScore){
        moneys.push(new Money());
    }
    for (let i = 0; i < moneys.length; i++) {
        moneys[i].draw();
        if (moneys[i] && mouse.x && mouse.y && collision(moneys[i], mouse)) {
            money += moneys[i].amount;
            floatingMessages.push(new floatingMessage(
                "+" + moneys[i].amount, moneys[i].x, moneys[i].y, 24, "#ccc"))
            floatingMessages.push(new floatingMessage(
                "+" + moneys[i].amount, 400, 60, 20, "gold"))
            moneys.splice(i, 1);
            i--;
        }
    }
}

// Utilities
function handleGameStatus(){
    ctx.fillStyle = '#ccc';
    ctx.font = "8px 'Press Start 2P'";
    ctx.fillText("N_100", 20, 88);
    ctx.font = "8px 'Press Start 2P'";
    ctx.fillText("H_150", 96, 88);

    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("Score: " + score, 240, 32);
    ctx.fillText("Money: " + money, 240, 64);
    if (gameOver){
        ctx.fillStyle = "#ddd";
        ctx.font = "80px 'Press Start 2P'";
        ctx.fillText("Game Over", 140, 320);
    }
    if (score >= winningScore && enemies.length === 0){
        ctx.fillStyle = "#ccc";
        ctx.font = "60px 'Press Start 2P'";
        ctx.fillText("WELL DONE", 240, 300);
        ctx.font = "30px 'Press Start 2P'";
        ctx.fillText("You win with " + score + " Points!", 200, 360);
    }
}

// Select Cell with Mouse:
canvas.addEventListener("click", function() {
    // This gives the value of the closest horizontal Grid Position. Using Modulo for zero tolerance in the selecting.
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return;
    // Check if Cell is already taken by a guy. If it is, exit function.
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }

    let defenderCost = 100;

    if (chosenDefender === 1){
        baseHealth = 100;
    } else if (chosenDefender === 2){
        baseHealth = 150;
        defenderCost = 150;
    }

    if (money >= defenderCost){
        defenders.push(new Defender(gridPositionX, gridPositionY, baseHealth));
        money -= defenderCost;
        //console.log("Money: ", money);
    } else {
        floatingMessages.push(new floatingMessage(
            "Need More Money! This Guy Costs: " + defenderCost, mouse.x, mouse.y, 16, "#099"))
    }
});

// Menu Bar
function menuBar() {
    opacity = 0.5
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = "#036";
    ctx.fillRect(0,0,controlsBar.width, controlsBar.height);    // (posX,posY,Xsize,Ysize)
    ctx.globalAlpha = 1;
}
500
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBG();
    menuBar();
    handleGameGrid();
    handleDefenders();
    handleProjectiles();
    handleMoney();
    handleEnemies();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();

    frame++;
    // console.log(frame); //frames of the game
    
    if (!gameOver) requestAnimationFrame(animate);          // Loop this function: run over and over, executing the functions code in it over and over.
}
animate();

// collision detection needs: x, y, width and height property.
// If any of these lines is true, there can not be collision. But if all true, the negator will turn it to true.
function collision(first, second) {
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    };
};

window.addEventListener("resize", function(){
    canvasPosition = canvas.getBoundingClientRect();
});