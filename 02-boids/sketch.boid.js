const maxForce = 0.03;
const maxSpeed = 2;

const alignDistance = 50;
const cohesionDistance = 50;
const separationDistance = 25;

/**
 * Simplify the mag function.
 */
p5.Vector.prototype.mag = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Return an axis value that will loop at 0 and the given size.
 */
function getLoopedPosition(value, size) {
  if (value < 0) value += size;
  if (value > size) value -= size;
  return value;
}

/**
 * A single member of the flock
 */
class Boid {
  /**
   * Called when a new boid is created.
   */
  constructor() {
    // Pick a random start position
    const x = random(width);
    const y = random(height);
    this.position = createVector(x, y);

    // Pick a random initial velocity
    const speed = random(1, 5);
    const direction = random(Math.PI * 2);
    this.velocity = createVector(
      Math.sin(direction) * speed,
      Math.cos(direction) * speed
    );

    // Prepare buffers
    this.aligns = createVector();
    this.numAligns = 0;
    this.cohesions = createVector();
    this.numCohesions = 0;
    this.steers = createVector();
    this.numSteers = 0;
  }

  /**
   * Draws the boid to the screen.
   */
  draw() {
    const { position, velocity } = this;

    resetMatrix();
    translate(position.x, position.y);
    rotate(Math.atan2(velocity.y, velocity.x));
    scale(0.5);

    image(boidImage, boidImage.width / -2, boidImage.height / -2);
  }

  /**
   * Applies the current velocity to the position.
   */
  update() {
    const { position, velocity } = this;
    const alignment = this.getAlignmentAcceleration();
    const cohesion = this.getCohesionAcceleration();
    const separation = this.getSeparationAcceleration();

    velocity.x +=
      alignment.x * alignmentPower +
      cohesion.x * cohesionPower +
      separation.x * separationPower;

    velocity.y +=
      alignment.y * alignmentPower +
      cohesion.y * cohesionPower +
      separation.y * separationPower;

    const x = position.x + velocity.x;
    const y = position.y + velocity.y;

    position.x = getLoopedPosition(x, width);
    position.y = getLoopedPosition(y, height);
  }

  /**
   * Reset the collision buffers.
   */
  reset() {
    this.aligns.set(0, 0, 0);
    this.numAligns = 0;

    this.cohesions.set(0, 0, 0);
    this.numCohesions = 0;

    this.steers.set(0, 0, 0);
    this.numSteers = 0;
  }

  /**
   * Visit another boid and collect collision data.
   */
  visit(other, distance, delta) {
    if (distance < alignDistance) {
      this.aligns.add(other.velocity);
      this.numAligns++;
    }

    if (distance < cohesionDistance) {
      this.cohesions.add(other.position);
      this.numCohesions++;
    }

    if (distance < separationDistance) {
      this.steers.add(delta);
      this.numSteers++;
    }
  }

  /**
   * Calculate the acceleration caused by the alignment behavior.
   * Steer towards average heading of neighbours
   */
  getAlignmentAcceleration() {
    const { aligns, numAligns } = this;
    if (numAligns === 0) {
      return aligns;
    }

    aligns.div(numAligns);
    aligns.normalize();
    aligns.mult(maxSpeed);

    const steer = aligns.sub(this.velocity);
    steer.limit(maxForce);

    return steer;
  }

  /**
   * Calculate the acceleration caused by the cohesion behavior.
   * Steer towards average position of neighbours (long range attraction)
   */
  getCohesionAcceleration() {
    const { cohesions, numCohesions } = this;
    if (numCohesions === 0) {
      return cohesions;
    }

    cohesions.div(numCohesions);
    const delta = p5.Vector.sub(cohesions, this.position);
    delta.normalize();
    delta.mult(maxSpeed);

    const steer = p5.Vector.sub(delta, this.velocity);
    steer.limit(maxForce);

    return steer;
  }

  /**
   * Calculate the acceleration caused by the separation behavior.
   * Avoid crowding neighbours (short range repulsion)
   */
  getSeparationAcceleration() {
    const { steers, numSteers } = this;
    if (numSteers === 0 || steers.mag() === 0) {
      return steers;
    }

    steers.div(numSteers);
    steers.normalize();
    steers.mult(maxSpeed);
    steers.sub(this.velocity);
    steers.limit(maxForce);

    return steers;
  }
}
