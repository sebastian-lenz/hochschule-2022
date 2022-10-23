// prettier-ignore
const neightbours = [
  [-1, -1], [0, -1], [1, -1],
  [-1,  0], /*   */  [1,  0],
  [-1,  1], [0,  1], [1,  1]
];

const numCells = 40;
let isSimulating = false;
let currentCells;
let nextCells;

function setup() {
  currentCells = createCells();
  nextCells = createCells();

  createCanvas(600, 600);
  noSmooth();
}

function keyPressed() {
  isSimulating = !isSimulating;
}

function draw() {
  if (mouseIsPressed) {
    applyMouseDraw();
  }

  if (frameCount % 20 == 0 && isSimulating) {
    updateCells();
    switchCells();
  }

  image(currentCells, 0, 0, width, height);
}

function applyMouseDraw() {
  const x = Math.floor((mouseX / width) * numCells);
  const y = Math.floor((mouseY / height) * numCells);
  const index = toIndex(x, y);

  currentCells.pixels[index] = 0;
  currentCells.updatePixels();
}

function createCells() {
  const cells = createImage(numCells, numCells);
  cells.loadPixels();

  for (let x = 0; x < numCells; x++) {
    for (let y = 0; y < numCells; y++) {
      const index = toIndex(x, y);
      cells.pixels[index + 0] = 255;
      cells.pixels[index + 1] = x % 2 == y % 2 ? 230 : 255;
      cells.pixels[index + 2] = 255;
      cells.pixels[index + 3] = 255;
    }
  }

  cells.updatePixels();
  return cells;
}

function updateCells() {
  for (let x = 0; x < numCells; x++) {
    for (let y = 0; y < numCells; y++) {
      const index = toIndex(x, y);
      const isAlive = currentCells.pixels[index] === 0;
      const numAlive = getNumAliveNeighbours(x, y);
      let willLive;

      if (isAlive) {
        willLive = numAlive == 2 || numAlive == 3;
      } else {
        willLive = numAlive == 3;
      }

      nextCells.pixels[index] = willLive ? 0 : 255;
    }
  }

  nextCells.updatePixels();
}

function switchCells() {
  let oldCells = currentCells;
  currentCells = nextCells;
  nextCells = oldCells;
}

function toIndex(x, y) {
  return (y * numCells + x) * 4;
}

function wrap(value) {
  if (value < 0) return value + numCells;
  if (value >= numCells) return value - numCells;
  return value;
}

function getNumAliveNeighbours(x, y) {
  let numAlive = 0;

  for (const neightbour of neightbours) {
    const targetX = wrap(neightbour[0] + x);
    const targetY = wrap(neightbour[1] + y);
    const targetIndex = toIndex(targetX, targetY);

    if (currentCells.pixels[targetIndex] === 0) {
      numAlive += 1;
    }
  }

  return numAlive;
}
