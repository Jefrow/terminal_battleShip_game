let rl = require('readline-sync');  
let size = 4; 
let enemyShips = 2; 
let grid = []; 
let prevLocations = []; 
let enemyLocations = [];
let validPoint = new RegExp(`^(?:[a-dA-D][1-${size}])$`);
let rowStr = ['A', 'B', 'C', 'D'] 

const createMap = (gridSize) => {
  for (let x = 0 ; x < gridSize ; x++) {
    grid[x] = []; 
    for (let y = 0 ; y < gridSize; y++) {
      grid [x][y] = ''
    }
  }
  return grid; 
} 

const getPoints = (gridSize) => {
  let x, y; 
  do {
    x = Math.floor(Math.random() * gridSize); 
    y = Math.floor(Math.random() * gridSize); 
  } while (!isValid(x,y));
  grid[x][y] = "S"; 
  enemyLocations.push([x,y]); 
}


const isValid = (x,y) => {
  if (grid[x][y] === 'S') {
    return false; 
  }
  return true; 
}

const attack = (x,y) => {
  if (grid[x][y] === 'S') { 
    console.log('Hit!')
    grid[x][y] = '!' 
    enemyShips -= 1
  } else {
    console.log('Miss') 
    grid[x][y] = 'X' 
  }
}

const gameSetUp = () => {
  createMap(size); 
  for (let i = 0 ; i < enemyShips ; i++){
    getPoints(size)
  }
}

const reset = () => {
 grid = []; 
 enemyShips = 2; 
 prevLocations = []; 
 enemyLocations = [];
 gameSetUp(); 
 gameLoop(); 
}

/*
  Refactor gameLoop() so that it follows the single responsibility principle
    1.Get the player's guess 
    2.Check if the guess is valid and not a duplicate
    3.Process the guess (convert and attack). 
    4.Handle end-of-game logic 
    5.Prompt for a new game. 
*/

const getPlayerGuess = () => {
  return rl.question('Enter a location to strike ie "A1" : ' , 
    {limit:validPoint, limitMessage: 'Not at valid point on the map, please try again. '}); 
}

const isDuplicate = (guess, prevLocations) => {
  if(prevLocations.includes(guess)){
    console.log('You have already picked this location. Miss!')
    return true; 
  } else {
    return false; 
  }
}

const handleGuess = (guess, prevLocations) => {
  prevLocations.push(guess);

  let x = rowStr.indexOf(guess.slice(0,1)); 
  let y = guess.slice(1,2) -1; 

  attack (x,y);
}

const playAgainPrompt = () => {
  if (rl.keyInYNStrict('Would you like to play again? : ')){
    reset(); 
  } else {
    console.log('Thank you for playing.')
  }
}

const gameLoop = () => {
  do {
    let playerGuess = getPlayerGuess()
    
    let guess = playerGuess.toUpperCase(); 

    if(!isDuplicate(guess, prevLocations)) {
      handleGuess(guess, prevLocations)
    }
  } while (enemyShips > 0); 
  
  console.log('You sunk all the ships!'); 
  playAgainPrompt(); 
}

const gameInit = () => {
  console.log('===| Welcome to Battleship! |==='); 
  console.log('Find and sink the two ships to win'); 
  console.log('===| Happy Hunting! |===')
  rl.keyInYNStrict('Would you like to begin? : ') 
    ? (gameSetUp() , gameLoop())  
    : console.log('Have a nice day =)')
}

gameInit(); 