let rl = require('readline-sync'); 
let myGrid = [];   
let gridSize;
let sunkShips = 0; 
let prevLocations = []; 
let numShips = [2, 3, 3, 4, 5];
let enemyShips = []; 
let validPoints = new RegExp(`^(?:[a-jA-J]([1-${gridSize}]|10))$`); 
let minMax = (/^(?:[3-9]|10)$/)
let rowStr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
let columnHeaders = ['1', '2','3', '4','5','6','7','8','9','10']; 
 
const createMap = (size) => {
  let grid = []; 
  for (let x = 0 ; x < size ; x++) {
    grid[x] = [];
    for  (let y = 0 ; y < size ; y++) {
      grid[x][y] = ''; 
    } 
  }
  return grid; 
}

const getPoints = (length) => {
  let x, y, direction; 
  do {
    x = Math.floor(Math.random() * gridSize); 
    y = Math.floor(Math.random() * gridSize); 
    direction = Math.random() < 0.5 ? 'horizontal' : 'vertical'
  } while (!isValid(x, y, direction, length)); 
 
  for (let i = 0 ; i < length ; i++){
    if (direction === 'horizontal') {
      grid[x][y + i] = 'S'; 
    } else {
      grid[x + i][y] = 'S'
    }
  }

  const ship = {
    startX: x, 
    startY: y, 
    length: length, 
    direction: direction, 
    hitSections: 0, 
    isSunk: false, 
  }

  enemyShips.push(ship)
}

const isValid = (x, y, direction, length) => {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
    return false; 
  }

  for (let i = 0 ; i < length ; i++) {
    if (
      (direction === 'horizontal' && (y + i >= gridSize || grid[x][y + i] === 'S')) ||
      (direction === 'vertical' && (x + i >= gridSize || grid[x + i][y] === 'S'))      
    ) {
        return false; 
      }
  }
  return true; 
}

const printGrid = () => {
  process.stdout.write('   ')
  for (let i = 0 ; i < gridSize ; i++) {
    process.stdout.write(` ${columnHeaders[i]}  `)
  }
  gridBorders(); 

  process.stdout.write('\n'); 
  
  for (let x = 0 ; x < gridSize ; x++) {
    process.stdout.write(`${rowStr[x]} |`)
    for (let y = 0 ; y < gridSize ; y++){
      let cell = grid[x][y];
      switch (cell) {
        case 'S':
          cell = '   '
          break;
        case 'O':
        case 'X':
          cell = ` ${cell} `
          break;
        default:
          cell  += '   '
          break;
      }
      process.stdout.write(`${cell}|`)
    }
    gridBorders(); 
    process.stdout.write('\n')
  }
}

const gridBorders = () => {
  process.stdout.write('\n'); 
  process.stdout.write('  -'); 
  for (let i = 0 ; i < gridSize ; i++){
    process.stdout.write('----')
  }
}

const checkShip = (x,y) => {
  for(const ship of enemyShips) {
   if(
    (ship.direction === 'horizontal' && x === ship.startX && y < ship.startY + ship.length) ||
    (ship.direction === 'vertical' && y === ship.startY && x < ship.startX + ship.length)
   ) {
    ship.hitSections += 1
    if (ship.hitSections === ship.length) {
      ship.isSunk = true; 
      console.log(`You sunk a ${ship.length}-unit ship !`)
      sunkShips ++
    }
   }
  }
}

const attack = (x,y) => {
  if(grid[x][y] === 'S') {
    console.log('Hit!')
    grid[x][y] = 'X'
    checkShip(x,y); 
  } else {
    console.log('Miss')
    grid[x][y] = 'O'
  }
}

const reset = () => {
  grid = []; 
  gridSize = ''; 
  enemyShips = []; 
  prevLocations = []; 
  sunkShips = 0; 
  gameSetup(); 
  gameLoop(); 
}

const gameSetup = () => {
  let filteredShips; 
  gridSize = rl.question('Enter desired grid Size: ', {limit:minMax, limitMessage: 'Grid must be larger than 3 and smaller than 10'})
  createMap(gridSize); 
 
  switch (gridSize) {
    case '3': 
      filteredShips = numShips.filter(ship => ship< 3)
      break; 
    case '4': 
      filteredShips = [...new Set(numShips)].filter(ship => ship>= 2 && ship <= 3)
      break;
    case '5': 
      filteredShips = [...new Set(numShips)].filter(ship => ship < 5)
      break; 
    case '6':
      filteredShips = [...new Set(numShips)]; 
      break;
    default: 
      filteredShips = numShips
      break; 
  }

  filteredShips.forEach(ship => getPoints(ship)); 
}

const gameLoop = () => {
  do{ 
    let playerGuess = rl.question('Enter a location to strike ie: "A1" : ', 
    {limit:validPoints, limitMessage: 'Not a valid point on the map, please try again. '} );
    
    let guess = playerGuess.toUpperCase(); 

    if (prevLocations.includes(guess)) {
      console.log('You have already picked this location. Miss!')
    } else {
      prevLocations.push(guess); 

      let x = rowStr.indexOf(guess.slice(0,1)); 
      let y = guess.slice(1) -1; 

      attack(x,y);
      printGrid();

      console.log('\n')

      if (sunkShips === enemyShips.length) {
        console.log('You sunk all the ships!'); 
        if(rl.keyInYNStrict('Would you like to play again? : ')) {
          reset(); 
        } else {
          console.log('Thank you for playing.')
        }
      }
    }
  } while(sunkShips < enemyShips.length)
}

const gameInit = () => {
  console.log('===| Welcome to Battle ship! |===');
  console.log('You can choose between 3-10 grid sizes');
  console.log('smaller grids will have fewer ships and larger grids will have 5 total ships');
  console.log('====| Happy Hunting! |===')
  rl.keyInYNStrict('Would you like to begin? : ') 
    ? (gameSetup(), gameLoop())  
    : console.log('Have a nice day =)')
}

gameInit(); 


// create 2 grids enemy grid and your own grid. 
// ships for both will have randomly selected ships. 