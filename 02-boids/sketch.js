const boids = [];
const numBoids = 800;
let boidImage;

let modifiers = [];
let mouseModifier = null;

let alignmentSlider;
let cohesionSlider;
let separationSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);

  boidImage = loadImage("./bird.png");

  alignmentSlider = createLabeledSlider(0, "Alignment");
  cohesionSlider = createLabeledSlider(1, "Cohesion");
  separationSlider = createLabeledSlider(2, "Separation", 1.5);

  for (let index = 0; index < numBoids; index++) {
    boids.push(new Boid());
  }
}

function draw() {
  background(220);

  alignmentPower = alignmentSlider.value();
  cohesionPower = cohesionSlider.value();
  separationPower = separationSlider.value();

  for (const modifier of modifiers) {
    modifier.apply();
  }

  const minDistance = Math.min(
    alignDistance,
    cohesionDistance,
    separationDistance
  );

  for (let index = 0; index < boids.length; index++) {
    const boid = boids[index];

    for (let sibling = index + 1; sibling < boids.length; sibling++) {
      const other = boids[sibling];
      const delta = p5.Vector.sub(boid.position, other.position);
      const distance = delta.mag();

      if (distance < minDistance) {
        boid.visit(other, distance, delta);
        other.visit(boid, distance, delta.mult(-1));
      }
    }

    boid.update();
    boid.draw();
    boid.reset();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  mouseModifier = getCurrentModifier();

  if (!mouseModifier) {
    mouseModifier = new Modifier();
    modifiers.push(mouseModifier);
  } else {
    mouseModifier.mousePressed();
  }
}

function mouseDragged() {
  if (mouseModifier) {
    mouseModifier.mouseMoved();
  }
}

function mouseReleased(event) {
  if (mouseModifier) {
    mouseModifier.mouseReleased(event);
  }

  mouseModifier = null;
}

function getCurrentModifier() {
  const mouse = createVector(mouseX, mouseY);
  return modifiers.find((modifier) => modifier.isHovered(mouse));
}

function createLabeledSlider(index, caption, value = 1) {
  const container = createDiv();
  container.position(10 + index * 100, 10);

  const label = createDiv();
  label.html(caption);
  label.parent(container);

  const slider = createSlider(0, 3, value, 0.1);
  slider.parent(container);
  slider.style("width", "80px");

  return slider;
}
