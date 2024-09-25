let rl = require('readline-sync');
let myGrid = [];
let pcGrid = [];
let gridSize;
let mySunkShips = 0;
let pcSunkShips = 0;
let myPrevLocations = [];
let pcPrevLocations = [];
let numShips = [2, 3, 3, 4, 5];
let myShips = [];
let enemyShips = [];
let validPoints = new RegExp(`^(?:[a-jA-J]([1-${gridSize}]|10))$`);
let rowStr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
let columnHeaders = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

//modify the create map function so that it can make my grid and the opponent's grid.
const createMap = (size, grid) => {
  let grid = [];
  for (let x = 0; x < size; x++) {
    grid[x] = [];
    for (let y = 0; y < size; y++) {
      grid[x][y] = '';
    }
  }
  return grid;
};

//modify the getPoints so that we can specify which ships are accessed
const getRandomCoordinates = () => {
  const x = Math.floor(Math.random() * gridSize);
  const y = Math.floor(Math.random() * gridSize);
  const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

  return { x, y, direction };
};

const placeShips = (x, y, direction, length, grid) => {
  for (let i = 0; i < length; i++) {
    if (direction === 'horizontal') {
      grid[x][y + i] = 'S';
    } else {
      grid[x + i][y] = 'S';
    }
  }
};

const makeShip = (x, y, direction, length, ships) => {
  const ship = {
    startX: x,
    startY: y,
    length: length,
    direction: direction,
    hitSections: 0,
    isSunk: false,
  };

  ships.push(ship);
};

const getPoints = (length,grid, ships) => {
  let coordinates;
  do {
    coordinates = getRandomCoordinates();
  } while (
    !isValid(coordinates.x, coordinates.y, coordinates.direction, length, grid)
  );
  placeShips(coordinates.x, coordinates.y, coordinates.direction, length, grid);
  makeShip(coordinates.x, coordinates.y, coordinates.direction, length, ships);
};

const isValid = (x, y, direction, length, grid) => {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
    return false;
  }

  for (let i = 0; i < length; i++) {
    if (
      (direction === 'horizontal' &&
        (y + i >= gridSize || grid[x][y + i] === 'S')) ||
      (direction === 'vertical' &&
        (x + i >= gridSize || grid[x + i][y] === 'S'))
    ) {
      return false;
    }
  }
  return true;
};

const isHit = (grid) => {
  if (grid[x][y] === 'S') {
    return true;
  }
  return false;
};


//Function to print the grid to the console.
const printGrid = (size, columnHead, rowHeader) => {
  gridHeader(size, columnHead); 
  gridBorders();

  for (let x = 0; x < size; x++) {
    gridCell(size, rowHeader, x); 
    gridBorders();
  }
};

const gridHeader = (size, columnHead) => {
  process.stdout.write('   ');
  for (let i = 0; i < size; i++) {
    process.stdout.write(` ${columnHead[i]}  `);
  }
}

const gridBorders = () => {
  process.stdout.write('\n');
  process.stdout.write('  -');
  for (let i = 0; i < gridSize; i++) {
    process.stdout.write('----');
  }
};

const gridCell = (size, rowHeader, x) => {
  process.stdout.write(`${rowHeader[x]} |`);
  for (let y = 0; y < size; y++) {
    let cell = grid[x][y];
    switch (cell) {
      case 'S':
        cell = '   ';
        break;
      case 'O':
      case 'X':
        cell = ` ${cell} `;
        break;
      default:
        cell += '   ';
        break;
    }
    process.stdout.write(`${cell}|`);
  }
}

//refactor this function so that the game can differentiate between player ship and enemy ship.

const isShipHit = (x, y, ship) => {
  return (
    (ship.direction === 'horizontal' &&
      x === ship.startX &&
      y < ship.startY + ship.length) ||
    (ship.direction === 'vertical' &&
      y === ship.startY &&
      x < ship.startX + ship.length)
  );
};
const updateHitSection = (ship) => {
  ship.hitSection += 1;
}

const isSunk = (ship) => {
  return ship.hitSection === ship.length; 
}

const handleSunkShip = (ship) => {
  ship.isSunk = true; 
  console.log(`You sunk a ${ship.length}-unit ship!`);
  sunkShip++; 
}

const checkShip = (x, y, ) => {
  for (const ship of enemyShips) {
    if (isShipHit(x,y,ship)){
      updateHitSection(ship);
      if(isSunk(ship)) {
        handleSunkShip(ship); 
      }
    }
  }
};

//rename attack to checkAttack for readability
const checkAttack = (x, y) => {
  if (grid[x][y] === 'S') {
    console.log('Hit!');
    grid[x][y] = 'X';
    checkShip(x, y);
  } else {
    console.log('Miss');
    grid[x][y] = 'O';
  }
};

const reset = () => {
  grid = [];
  gridSize = '';
  enemyShips = [];
  prevLocations = [];
  sunkShips = 0;
  gameSetup();
  gameLoop();
};
//Refactor gameSetUp() to follow SRP. 
const getGridSize = () => {
  let minMax = new RegExp(/^(?:[3-9]|10)$/);
  return rl.question('Enter desired grid Size: ', {
    limit: minMax,
    limitMessage: 'Grid must be larger than 3 and smaller than 10',
  });
};

const filterShips = (gridSize) => {
  switch (gridSize) {
    case '3':
      return numShips.filter((ship) => ship < 3);
    case '4':
      return [...new Set(numShips)].filter((ship) => ship >= 2 && ship <= 3);
    case '5':
      return [...new Set(numShips)].filter((ship) => ship < 5);
    case '6':
      return [...new Set(numShips)];
    default:
      return numShips;
  }
};

/*
  Refactor gameSetUp to for single player against the computer.   
  create map for using my map and enemy map, 
  filter Ships for both my ships and pc ships

*/

const gameSetup = () => {
  gridSize = getGridSize();

  createMap(gridSize, pcGrid);
  createMap(gridSize, myGrid)

  let filteredShips = filterShips(gridSize);
  filteredShips.forEach((ship) => getPoints(ship, myGrid, ));
};

/*
  During the game loop, we would need to refactor the code so that the players can take turns guessing the checking the guess. 
*/

const gameLoop = () => {
  do {
    let playerGuess = rl.question('Enter a location to strike ie: "A1" : ', {
      limit: validPoints,
      limitMessage: 'Not a valid point on the map, please try again. ',
    });

    let guess = playerGuess.toUpperCase();

    if (prevLocations.includes(guess)) {
      console.log('You have already picked this location. Miss!');
    } else {
      prevLocations.push(guess);

      let x = rowStr.indexOf(guess.slice(0, 1));
      let y = guess.slice(1) - 1;

      checkAttack(x, y);
      printGrid(gridSize, columnHeaders, rowStr);

      console.log('\n');

      if (sunkShips === enemyShips.length) {
        console.log('You sunk all the ships!');
        if (rl.keyInYNStrict('Would you like to play again? : ')) {
          reset();
        } else {
          console.log('Thank you for playing.');
        }
      }
    }
  } while (sunkShips < enemyShips.length);
};

const gameInit = () => {
  console.log('===| Welcome to Battle ship! |===');
  console.log('You can choose between 3-10 grid sizes');
  console.log(
    'smaller grids will have fewer ships and larger grids will have 5 total ships'
  );
  console.log('====| Happy Hunting! |===');
  rl.keyInYNStrict('Would you like to begin? : ')
    ? (gameSetup(), gameLoop())
    : console.log('Have a nice day =)');
};

gameInit();

/*
  Game set-up logic: 
   - game will ask player for grid size
   - gride size will then be used for both player and computer's board. 
   - game will randomly place player's ship.
   - game will randomly place computer's ship.
   - round 1 wil begin. 
*/

/*
  Game loop logic
  1st round: 
  = PLAYER'S TURN LOGIC =
    - Player guesses location
    - game will check if location is a repeat. 
      (If location is already guessed, game will ask the player to make another guess)
    - game will then check if the location is a hit or miss
      (If hit: game will log "hit", if miss: game will log "miss")
    - game will check if any ship is sunk
    - game will then keep track of any hits and valid guesses made. 
    - end player's turn. 
  = COMPUTER'S TURN LOGIC = 
    - computer will randomly generate a location 
    - game will check if the locations is a repeat. 
      (computer will loop until a non-repeat location is made)
    - game will check if hit or miss 
      (If hit: game will log "hit", if miss: game will log "miss")
    - game will check if any ship is sunk
    - game will keep track of any hits and valid guesses made. 
    - computer ends it's turn. 
  - at the end of of every round, game will evaluate for any sunk ships (player's and PC's) if either player 
    has all ships sink, then the game will end and that player will lose. 
  - game will print player's board and enemy's board accordingly showing accumulated guesses and ends the round
*/

// Create a turn function where  each player and computer will make a guess and game can check the guesses made
// Create a round functions where the turn turns will take place (after each round iterations, the game should notify the player what the current round is.)

// what do I need to add to this to make it "multi-player"?
/*
  create trackers for each player and computer opp
    - grid
    - ship locations
    - previous locations 
    - sunk ships
    - remaining ships
*/

// create 2 grids: an enemy grid and your own grid.
// you can create the size of the grid for both you and your opponent.
// ships for both will have randomly selected ships.
