import * as PIXI from "./pixi.mjs";

if (!localStorage.getItem('allow')) {
    throw new Error('access denied');
}

const SCREEN_WIDTH = 384;
const SCREEN_HEIGHT = 512;
const PIXEL_SIZE = 16;
const TOP_PADDING = PIXEL_SIZE * 3;
const COLOR = 0x000000;
const BG_COLOR = 0x869174;

const app = new PIXI.Application({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: BG_COLOR,
});

// TODO: REFACTOR!!!
let scoreText = new PIXI.Text('Счет: 0', new PIXI.TextStyle({file: COLOR}));
let hero = drawPixel(SCREEN_WIDTH / 2 - PIXEL_SIZE, SCREEN_HEIGHT - PIXEL_SIZE);
// по сути, скорость игры. чем меньше тем она выше.
const enemiesLineToSpeedUpGame = 10;

let bullets = [];
let enemies = [];
let delayCounter = 0;
let scoreCounter = 0;
let enemiesSpeed = 0;
let enemiesLineLeftToSpeedUpGame = enemiesLineToSpeedUpGame;
let fireIsPressed = false;

// Добавляем canvas в контейнер #game-container
const gameContainer = document.getElementById('game-container');
gameContainer.appendChild(app.view);
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

app.ticker.add(update, this);
app.stage.addChild(scoreText);

function update() {
    if (isFail()) {
        stopGame();
        return;
    }

    if (isEnemiesCanMove()) {
        moveEnemies();
        addEnemyLine();
    }

    speedUpGame();
    moveBullets();
    clear();
}

// TODO: REFACTOR!!!
function restartGame() {
    // Очистка сцены
    app.stage.removeChildren();

    scoreText = new PIXI.Text('Счет: 0', new PIXI.TextStyle({file: COLOR}));
    hero = drawPixel(SCREEN_WIDTH / 2 - PIXEL_SIZE, SCREEN_HEIGHT - PIXEL_SIZE);
    gameContainer.appendChild(app.view);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    bullets = [];
    enemies = [];
    delayCounter = 0;
    scoreCounter = 0;
    enemiesSpeed = 0;
    enemiesLineLeftToSpeedUpGame = enemiesLineToSpeedUpGame;
    fireIsPressed = false;

    app.ticker.add(update, this);
    app.stage.addChild(scoreText);
}

function speedUpGame() {
    if (enemiesLineLeftToSpeedUpGame === 0) {
        enemiesLineLeftToSpeedUpGame = enemiesLineToSpeedUpGame;

        enemiesSpeed++;
    }
}

function isEnemiesCanMove() {
    delayCounter++;

    if (delayCounter < 120) {
        return false;
    }

    delayCounter = enemiesSpeed;
    return true;
}

function moveEnemies() {
    enemies.forEach(enemy => enemy.y += PIXEL_SIZE);
}

function addEnemyLine() {
    for (let i = 0; i < SCREEN_WIDTH / PIXEL_SIZE; i++) {
        if (Math.random() <= 0.5) {
            const enemy = drawPixel(PIXEL_SIZE * i, TOP_PADDING);
            enemies.push(enemy);
        }
    }

    enemiesLineLeftToSpeedUpGame--;
}

function moveBullets() {
    bullets.forEach(bullet => {
        moveBullet(bullet);
        checkCollision(bullet)
    })
}

function checkCollision(bullet) {
    enemies.forEach(enemy => {
        if (enemy.x === bullet.x && enemy.y === bullet.y) {
            enemy.isDead = true;
            bullet.isDead = true;

            scoreCounter += 1;
            scoreText.text = "Счет: " + scoreCounter;
        }
    })
}

function clear() {
    app.stage.children.filter(child => child.isDead).forEach(child => child.removeFromParent());
    bullets = bullets.filter(bullet => !bullet.isDead);
    enemies = enemies.filter(enemy => !enemy.isDead);
}

function moveBullet(bullet) {
    bullet.y -= PIXEL_SIZE;

    if (bullet.y < TOP_PADDING) {
        bullet.isDead = true;
    }
}

function isFail() {
    return enemies.find(enemy => enemy.y === hero.y) !== undefined;
}

function stopGame() {
    document.removeEventListener("keydown", onKeyDown);
    app.ticker.remove(update, this);
    setGameOverMessage();
}

function drawPixel(x, y) {
    const view = new PIXI.Graphics();
    view.lineStyle(2, COLOR);
    view.beginFill(BG_COLOR);
    view.drawRect(0, 0, PIXEL_SIZE, PIXEL_SIZE);
    view.beginFill(COLOR);
    view.drawRect(4, 4, PIXEL_SIZE - 8, PIXEL_SIZE - 8);
    view.x = x;
    view.y = y;

    app.stage.addChild(view);

    return view;
}

function setGameOverMessage() {
    const cage = new PIXI.Container();
    const textBG = new PIXI.Graphics();

    // Вычисляем размер шрифта относительно SCREEN_WIDTH и SCREEN_HEIGHT
    const fontSize = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.1; // Например, 5% от минимальной стороны экрана

    // Создаем текст с относительным размером шрифта
    const gameOverText = new PIXI.Text("Игра окончена", {fill: COLOR, fontSize: fontSize});

    // Относительные координаты и размеры текста
    gameOverText.x = 0.5 * SCREEN_WIDTH;
    gameOverText.y = 0.5 * SCREEN_HEIGHT;
    gameOverText.anchor.set(0.5);

    // Относительные размеры и положение фона текста
    const padding = 10; // Отступы вокруг текста
    const bgWidth = gameOverText.width + 2 * padding;
    const bgHeight = gameOverText.height + 2 * padding;
    const bgX = 0.5 * SCREEN_WIDTH - 0.5 * bgWidth;
    const bgY = 0.5 * SCREEN_HEIGHT - 0.5 * bgHeight;

    textBG.beginFill(BG_COLOR);
    textBG.drawRect(bgX, bgY, bgWidth, bgHeight);
    textBG.endFill();

    cage.addChild(textBG, gameOverText);

    app.stage.addChild(cage);
    createRestartButton();
}

function createRestartButton() {
    const button = new PIXI.Graphics();
    const buttonText = new PIXI.Text("Начать заново", {fill: COLOR});

    // Отрисовка кнопки
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = SCREEN_WIDTH / 2 - buttonWidth / 2;
    const buttonY = SCREEN_HEIGHT - 100;

    button.beginFill(0xCCCCCC);
    button.drawRect(buttonX, buttonY, buttonWidth, buttonHeight);
    button.endFill();

    buttonText.x = buttonX + buttonWidth / 2;
    buttonText.y = buttonY + buttonHeight / 2;
    buttonText.anchor.set(0.5);

    // Флаг, указывающий, что кнопка была нажата
    let isButtonDown = false;

    // Добавление обработчиков событий на кнопку
    button.interactive = true;
    button.buttonMode = true;
    button.on("pointerdown", () => {
        button.tint = 0x999999;
        isButtonDown = true;
    });
    button.on("pointerup", (event) => {
        const pointerUpX = event.data.global.x;
        const pointerUpY = event.data.global.y;
        if (
            isButtonDown &&
            pointerUpX > buttonX && pointerUpX < buttonX + buttonWidth &&
            pointerUpY > buttonY && pointerUpY < buttonY + buttonHeight
        ) {
            button.tint = 0xFFFFFF;
            restartGame();
        }
        isButtonDown = false;
    });
    button.on("pointerupoutside", () => {
        button.tint = 0xFFFFFF;
        isButtonDown = false;
    });

    // Добавление кнопки на сцену
    app.stage.addChild(button, buttonText);
}


function onKeyDown(key) {
    switch (key.key) {
        case "ArrowRight" : {
            if (hero.x < SCREEN_WIDTH - PIXEL_SIZE) {
                hero.x += PIXEL_SIZE;
            }
            break;
        }
        case "ArrowLeft" : {
            if (hero.x > 0) {
                hero.x -= PIXEL_SIZE;
            }
            break;
        }
        case " ": {

            if (!fireIsPressed) {
                let bullet = drawPixel(hero.x, hero.y);
                bullets.push(bullet);
                fireIsPressed = true;
            }

            break;
        }
    }
}

function onKeyUp(key) {
    switch (key.key) {
        case " ": {
            fireIsPressed = false;
            break;
        }
    }
}

