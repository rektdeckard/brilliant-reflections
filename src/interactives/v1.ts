
import p5 from "p5";
import { CANVAS_WIDTH, CANVAS_HEIGHT, C, PHOTON_RADIUS, Color } from "../constants";

export default function(p: p5) {
  let base1: p5.Vector;
  let base2: p5.Vector;
  let position: p5.Vector;
  let velocity: p5.Vector;
  let incidence: p5.Vector;

  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    p.fill(128);
    base1 = p.createVector(0, p.height - 150);
    base2 = p.createVector(p.width, p.height);

    position = p.createVector(p.width / 2, 0);

    velocity = p5.Vector.random2D();
    velocity.mult(C);
  }

  p.draw = () => {
    p.fill(0, 12);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);

    p.fill(...Color.MIRROR);
    p.quad(base1.x, base1.y, base2.x, base2.y, base2.x, p.height, 0, p.height);

    let baseDelta = p5.Vector.sub(base2, base1);
    baseDelta.normalize();
    let normal = p.createVector(-baseDelta.y, baseDelta.x);
    let intercept = p5.Vector.dot(base1, normal);

    p.noStroke();
    p.fill(...Color.DEBUG);
    p.ellipse(position.x, position.y, PHOTON_RADIUS * 2, PHOTON_RADIUS * 2);

    position.add(velocity);

    incidence = p5.Vector.mult(velocity, -1) as unknown as p5.Vector;
    incidence.normalize();

    if (p5.Vector.dot(normal, position) > intercept) {
      let dot = incidence.dot(normal);

      velocity.set(
        2 * normal.x * dot - incidence.x,
        2 * normal.y * dot - incidence.y,
        0.
      );
      velocity.mult(C);

      p.stroke(...Color.DEBUG);
      p.line(
        position.x,
        position.y,
        position.x - normal.x * 100,
        position.y - normal.y * 100,
      );
    }

    if (position.x > p.width - PHOTON_RADIUS) {
      position.x = p.width - PHOTON_RADIUS;
      velocity.x *= -1;
    }
    if (position.x < PHOTON_RADIUS) {
      position.x = PHOTON_RADIUS;
      velocity.x *= -1;
    }
    if (position.y < PHOTON_RADIUS) {
      position.y = PHOTON_RADIUS;
      velocity.y *= -1;

      base1.y = p.random(p.height - 100, p.height);
      base2.y = p.random(p.height - 100, p.height);
    }
  }
}

