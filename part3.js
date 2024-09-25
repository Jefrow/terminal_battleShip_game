let rl = require('readline-sync');
let grid = [];
let gridSize;
let sunkShips = 0;
let prevLocations = [];
let numShips = [2, 3, 3, 4, 5];
let enemyShips = [];
let validPoints;
let rowStr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
let columnHeaders = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const createMap = (size, grid) => {
  for (let x = 0; x < size; x++) {
    grid[x] = [];
    for (let y = 0; y < size; y++) {
      grid[x][y] = '';
    }
  }
  return grid;
};

//refactor getPoints to follow SRP
/*
  Currently, getPoints are doing multiple things
    1. Generates random coordinates and direction for placing ships
    2. Validates the generated coordinates and direction. 
    3. Places the ship on the grid  
    4. It creates a ship object and adds it to the 'enemyShips' array. 
*/
const getRandomCoordinates = () => {
  const x = Math.floor(Math.random() * gridSize);
  const y = Math.floor(Math.random() * gridSize);
  const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

  return { x, y, direction };
};

const placeShips = (x, y, direction, length) => {
  for (let i = 0; i < length; i++) {
    if (direction === 'horizontal') {
      grid[x][y + i] = 'S';
    } else {
      grid[x + i][y] = 'S';
    }
  }
};

const makeShip = (x, y, direction, length) => {
  const ship = {
    startX: x,
    startY: y,
    length: length,
    direction: direction,
    hitSections: 0,
    isSunk: false,
  };

  enemyShips.push(ship);
};

const getPoints = (length) => {
  let coordinates;
  do {
    coordinates = getRandomCoordinates();
  } while (
    !isValid(coordinates.x, coordinates.y, coordinates.direction, length)
  );
  placeShips(coordinates.x, coordinates.y, coordinates.direction, length);
  makeShip(coordinates.x, coordinates.y, coordinates.direction, length);
};

const isValid = (x, y, direction, length) => {
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

const isHit = (x, y) => {
  if (grid[x][y] === 'S') {
    return true;
  }
  return false;
};

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
  process.stdout.write('\n')
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
/* 
  checkShip() doesn't follow SRP this function is processing a couple of things
    1.check if the coordinates hit a ship.
    2.updates the hit section of the ship. 
    3.checks if the ship is sunk. 
    4.logs that the ship is sunk.
    5.updates the sunkShip counter. 
*/

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
  ship.hitSections += 1;
};

const isSunk = (ship) => {
  return ship.hitSections === ship.length;
};

const handleSunkShip = (ship) => {
  ship.isSunk = true;
  console.log(`You sunk a ${ship.length}-unit ship!`);
  sunkShips++;
};

const checkShip = (x, y) => {
  for (const ship of enemyShips) {
    if (isShipHit(x, y, ship)) {
      updateHitSection(ship);
      if (isSunk(ship)) {
        handleSunkShip(ship);
      }
    }
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

/*
  Refactor gameSetUp to follow SRP 
  gameSetup is responsible for a couple of things
    1. get the grid size from the player. 
    2. filter the number of ships based on the grid size
    3. create the ships. 
*/

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

const gameSetup = () => {
  gridSize = getGridSize();

  createMap(gridSize, grid);

  let filteredShips = filterShips(gridSize);
  filteredShips.forEach((ship) => getPoints(ship));
};

/*
  Refactor gameLoop() to follow SRP 
  What is happening in the gameLoop() and how can we refactor it so that it follows the single responsibility principle? 
  1. gets a guess from the player. 
  2. checks to see if the guess is a duplicate. 
  3. 
*/

const initValidPoints = (gridSize) => {
  const maxRow = String.fromCharCode('a'.charCodeAt(0) + (gridSize - 1));
  const maxNumber = getMaxValue(gridSize);

  return new RegExp(`^[a-${maxRow}A-${maxRow.toUpperCase()}]${maxNumber}$`);
};

const getMaxValue = (gridSize) => {
  if (Number(gridSize) === 10) {
    return '(10|[1-9])';
  } else {
    return `[1-${gridSize}]`;
  }
};

const getPlayerGuess = (validPoints) => {
  return rl.question('Enter a location to strike ie: "A1" : ', {
    limit: validPoints,
    limitMessage: 'Not a valid point on the map, please try again. ',
  });
};

const isDuplicate = (guess, prevLocations) => {
  if (prevLocations.includes(guess)) {
    console.log('You have already picked this location. Miss!');
    return true;
  }
  return false;
};

const handleGuess = (guess) => {
  prevLocations.push(guess);

  let x = rowStr.indexOf(guess.slice(0, 1));
  let y = guess.slice(1) - 1;

  return { x, y };
};

const handleGuessResult = (x, y) => {
  if (isHit(x, y)) {
    console.log('Hit');
    grid[x][y] = 'X';
    checkShip(x, y);
  } else {
    console.log('Miss');
    grid[x][y] = 'O';
  }
};

const sunkAllShips = () => {
  if (sunkShips === enemyShips.length) {
    console.log('You sunk all ships!');
    return true;
  }
  return false;
};

const promptReset = () => {
  if (rl.keyInYNStrict('Would you like to play again? : ')) {
    reset();
  } else {
    console.log('Thank you for playing. ');
  }
};

const gameLoop = () => {
  printGrid(gridSize, columnHeaders, rowStr); 
  validPoints = initValidPoints(gridSize);
  do {
    let playerGuess = getPlayerGuess(validPoints);

    let guess = playerGuess.toUpperCase();

    if (!isDuplicate(guess, prevLocations)) {
      const { x, y } = handleGuess(guess);

      handleGuessResult(x, y);

      printGrid(gridSize, columnHeaders, rowStr);

      console.log('\n');

      if (sunkAllShips()) {
        promptReset();
        return;
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
