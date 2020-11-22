/**
 * This file contains the logic of the game for the startup challenge.
 * 
 * @author    [Your full name] <[your email]>
 * @author    STEM Loyola <stemloyola@gmail.com>
 * @version   1.0
 * 
 * @copyright STEM Loyola 2020.
 */

'use strict';

// Canvas position in the browser window. 
// You may need to adjust these if not displayed well in your computer
const WIDTH = window.innerWidth * 0.8;  // Canvas width will be 80% of the browser's width
const HEIGHT = window.innerHeight - 100;  // Canvas height will be 100 pixels less than the browser's height
const OFFSET = 130;  // Distance between the fighter's feet and the bottom of browser's window

// Control fighter's movements
const GRAVITY = 0.8;  // How quickly the fighter returns to the ground
const FIGHTER_DY = -20;  // How high the fighter will jump
const FIGHTER_DX = 3;  // How fast the fighter will walk

// Track game data
let fighter;  // A sprite storing the fighter details (e.g. position, speed, animations)
let coin;  // A sprite storing coin details
let monster;  // A sprite storing the monster's details

let animFighter;  // An array storing fighter's images used for animations
let animCoin;  // Coin animation images
let animMonster;  // Monster's animation images
let imgGround;  // A list of image used to build the ground
let imgBack;  // A list of images for the background background and its objects


/**
 * Executed once and loads resources into RAM before setup() is executed
 * Useful for loading images, sounds, etc. that usually are not loaded fast
 * enough for the performance needed in gaming and simulations.
 */
function preload(){

    // Load images for the background and its objects
    imgBack = {};
    imgBack['background'] = loadImage('assets/images/background.png');
    imgBack['bush'] = loadImage('assets/images/bush.png');
    imgBack['cactus'] = loadImage('assets/images/cactus.png');
    imgBack['skeleton'] = loadImage('assets/images/skeleton.png');

    // Load the ground images
    imgGround = {};
    imgGround['left'] = loadImage('assets/images/ground-left.png');
    imgGround['middle'] = loadImage('assets/images/ground-middle.png');

    // Load fighter animation images. Notice in loading an animation, 
    // only the first and last images need to be specified
    animFighter = {};
    animFighter['idle'] = loadAnimation('assets/images/fighter/Idle-1.png', 'assets/images/fighter/Idle-10.png');
    animFighter['walk'] = loadAnimation('assets/images/fighter/Walk-1.png', 'assets/images/fighter/Walk-10.png');
    animFighter["jump"] = loadAnimation('assets/images/fighter/Jump-1.png', 'assets/images/fighter/Jump-10.png');

    // Load coin animations
    animCoin = loadAnimation('assets/images/coin/coin-1.png', 'assets/images/coin/coin-16.png');

    // Load monster's animations
    animMonster = loadAnimation('assets/images/monster/monster-1.png', 'assets/images/monster/monster-19.png');

}

/**
 * Executed once and initializes the canvas and other data. 
 * Everything that should be done once and at the beginning of the app
 * (e.g. loading images, sounds) should be done in this function.
 */
function setup() {

    /*
     * Setup the canvas
     */

    // Append a canvas into the website page (inside 'demo-container')
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('demo-container');


    /*
     * Build the fighter character
     */
    
    fighter = createSprite(80, HEIGHT - OFFSET);

    // Add all animations the fighter uses
    fighter.addAnimation('idling', animFighter['idle']);
    fighter.addAnimation('walking', animFighter['walk']);
    fighter.addAnimation('jumping', animFighter['jump']);

    // Reduce the size of the fighter to appear nicer on the screen
    fighter.scale = 0.25;

    // Set the fighter's collision boundary
    fighter.setCollider('circle', 0, 0, fighter.width / 2);
    
    // Define our own variable to track the state of the fighter
    fighter.isJumping = false;
    fighter.dy = FIGHTER_DY;
    fighter.score = 0;


    /*
     * Build the coin
     */

     // Test coin
    coin = createSprite(WIDTH * 1.2, HEIGHT / 4);
    coin.addAnimation('spin', animCoin);
    coin.scale = 0.5;
    coin.dy = -2;
    coin.MAX_HEIGHT = HEIGHT / 2;


    /*
     * Build the monsters
     */

    // Test monster
    monster = createSprite(WIDTH*1.5, HEIGHT - OFFSET + 45);
    monster.addAnimation('walk', animMonster);
    monster.scale = 0.35;
    monster.setVelocity(-5, 0);
    monster.setCollider('circle', 0, 0, monster.width / 7);

}

/**
 * Runs continously after setup() and updates the state of the application.
 * Everything that should continously be checked, updated, and done should
 * be done from function
 */
function draw() {

    /*
     * Update the game elements that depend on user input
     */

    // Respond to pressed/released keys if the fighter is NOT currently jumping
    if( fighter.isJumping === false ){

        // Pressing the right arrow moves the fighter forwards
        if( keyWentDown(RIGHT_ARROW) ){
            fighter.changeAnimation('walking');
            fighter.setVelocity(FIGHTER_DX, 0);
        }

        // Releasing the right arrow stops the fighter
        if( keyWentUp(RIGHT_ARROW) ){
            fighter.changeAnimation('idling');
            fighter.setVelocity(0, 0);
        }
        
        // Pressing the up arrow starts the fighter's jump
        if( keyWentDown(UP_ARROW) ){
            fighter.isJumping = true;
            fighter.changeAnimation('jumping');
            fighter.setVelocity(0, 0);
        } 
    } else { // Fighter is currently jumping

        // Calculate the new position. The new position is affected by 
        // fighter's current vertical speed. The current vertical speed
        // is affected by the vertical acceleration (a.k.a gravity)
        fighter.dy += GRAVITY;
        fighter.position.y += fighter.dy;

        fighter.position.y = constrain(fighter.position.y, 0, HEIGHT - OFFSET);
        
        // End the jump when the fighter returns to the ground
        if( fighter.position.y == HEIGHT - OFFSET ){
            fighter.isJumping = false;  // Mark the jump as finished
            fighter.dy = FIGHTER_DY;  // Reset initial vertical speed for the next jump

            // Fighter should now rest on the ground
            fighter.changeAnimation('idling');
        }
    }


    /*
     * Update the game elements that do not require user input
     */

    // Move the coin up and down
    coin.position.y += coin.dy;
    coin.position.y = constrain(coin.position.y, 0, coin.MAX_HEIGHT);

    if( coin.position.y == 0 || coin.position.y == coin.MAX_HEIGHT ){
        coin.dy = coin.dy * -1;
    }

    // Check if fighter has got a coin. If true, remove the coin from
    // the sketch and increase the score
    if( fighter.collide(coin) ){
        fighter.score++;
        coin.remove();
    }

    // Check if the monster has bitten the fighter. If true, game is over
    if( fighter.collide(monster) ){
        noLoop();
    }

    // Center the fighter on the screen for sometime
    if( fighter.position.x > WIDTH / 2 && fighter.position.x < WIDTH * 2 ) {
        camera.position.x = fighter.position.x;
    }


    /*
     * Display the game elements based on the canvas
     */

    // Display the background and its objects
    background(imgBack['background']);
    
    image(imgBack['skeleton'], WIDTH * 0.4, HEIGHT - OFFSET + 45);
    image(imgBack['bush'], WIDTH * 0.8, HEIGHT - OFFSET);
    image(imgBack['cactus'], WIDTH * 1.6, HEIGHT - OFFSET - 35);

    // Display the ground
    image(imgGround['left'], 10, HEIGHT - OFFSET + 75);
    
    for( let i = 1; i < 5*WIDTH / imgGround['middle'].width; i++ ){
        image(imgGround['middle'], imgGround['middle'].width * i + 10, HEIGHT - OFFSET + 75);
    }

    // Display all the sprites (e.g. fighter, monsters, coins)
    drawSprites();

}
