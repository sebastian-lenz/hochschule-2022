const minRadius = 10;

class Modifier {
  constructor() {
    this.position = createVector(mouseX, mouseY);
    this.radius = minRadius;
    this.power = 0.1;
    this.mode = "avoid";
    this.mouseMode = "create";
  }

  apply() {
    for (const boid of boids) {
      const delta = p5.Vector.sub(this.position, boid.position);
      const distance = delta.mag();

      if (distance < this.radius) {
        delta.normalize();
        delta.mult(this.power * (this.mode === "avoid" ? 1 : -0.25));
        boid.velocity.sub(delta);
      }
    }

    noStroke();
    if (this.mode === "avoid") {
      fill(255, 0, 0, 32);
    } else {
      fill(0, 255, 0, 32);
    }

    circle(this.position.x, this.position.y, this.radius * 2);
  }

  isHovered(mousePosition) {
    return this.position.dist(mousePosition) < this.radius;
  }

  mousePressed() {
    this.mouseDelta = createVector(mouseX, mouseY);
    this.mouseMode = "click";
  }

  mouseMoved() {
    const mouse = createVector(mouseX, mouseY);
    if (this.mouseMode === "click" && this.mouseDelta.dist(mouse) > 2) {
      this.mouseDelta.sub(this.position);
      this.mouseMode = "drag";
    }

    if (this.mouseMode === "create") {
      this.radius = Math.max(minRadius, this.position.dist(mouse));
    } else if (this.mouseMode === "drag") {
      this.position.x = mouseX - this.mouseDelta.x;
      this.position.y = mouseY - this.mouseDelta.y;
    }
  }

  mouseReleased(event) {
    if (this.mouseMode == "click" && event.shiftKey) {
      modifiers = modifiers.filter((modifier) => modifier !== this);
    } else if (this.mouseMode == "click") {
      this.mode = this.mode === "avoid" ? "attrackt" : "avoid";
    }

    this.mouseMode = "none";
  }
}
