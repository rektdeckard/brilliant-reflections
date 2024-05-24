import p5 from "p5";
import { CANVAS_WIDTH, CANVAS_HEIGHT, C, PHOTON_RADIUS, Color, WALL_THICKNESS } from "../constants";

export default function(p: p5) {
  let simulating: boolean = true;

  let base1: p5.Vector;
  let base2: p5.Vector;

  let position: p5.Vector;
  let velocity: p5.Vector;
  let incidence: p5.Vector;

  let mirrorLeft: [p5.Vector, p5.Vector];
  let mirrorRight: [p5.Vector, p5.Vector];
  let wallTop: [p5.Vector, p5.Vector];
  let wallBottom: [p5.Vector, p5.Vector];

  let raySegments: Array<p5.Vector> = [];

  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    mirrorLeft = [p.createVector(0, 0), p.createVector(0, p.height)];
    mirrorRight = [p.createVector(p.width, 0), p.createVector(p.width, p.height)];
    wallTop = [p.createVector(0, 0), p.createVector(p.width, 0)];
    wallBottom = [p.createVector(0, p.height), p.createVector(p.width, p.height)]

    base1 = p.createVector(0, p.height - 150);
    base2 = p.createVector(p.width, p.height);

    position = p.createVector(p.width / 2, 0);
    pushPoint();

    velocity = p5.Vector.random2D();
    velocity.mult(C);
  }

  p.draw = () => {
    if (!simulating) return;

    renderRoom();
    renderBase();
    renderWalls();

    let baseDelta = p5.Vector.sub(base2, base1).normalize();
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
      simulating = false;
    }

    if (position.x > p.width - PHOTON_RADIUS) {
      position.x = p.width - PHOTON_RADIUS;
      velocity.x *= -1;
      pushPoint();
    }
    if (position.x < PHOTON_RADIUS) {
      position.x = PHOTON_RADIUS;
      velocity.x *= -1;
      pushPoint();
    }
    if (position.y < PHOTON_RADIUS) {
      position.y = PHOTON_RADIUS;
      velocity.y *= -1;

      base1.y = p.random(p.height - 100, p.height);
      base2.y = p.random(p.height - 100, p.height);
    }

    renderSegments();
  }

  function pushPoint() {
    raySegments.push(position.copy());
  }

  function renderRoom() {
    p.fill(...Color.FLOOR);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);
  }

  function renderBase() {
    p.fill(...Color.MIRROR);
    p.quad(base1.x, base1.y, base2.x, base2.y, base2.x, p.height, 0, p.height);
  }

  function renderWalls() {
    p.fill(...Color.MIRROR);
    p.quad(
      wallTop[0].x, wallTop[0].y,
      wallTop[0].x, wallTop[0].y + WALL_THICKNESS,
      wallTop[1].x, wallTop[1].y + WALL_THICKNESS,
      wallTop[1].x, wallTop[1].y,
    );
    p.quad(
      wallBottom[0].x, wallBottom[0].y,
      wallBottom[0].x, wallBottom[0].y + WALL_THICKNESS,
      wallBottom[1].x, wallBottom[1].y + WALL_THICKNESS,
      wallBottom[1].x, wallBottom[1].y,
    );
    p.quad(
      mirrorLeft[0].x, mirrorLeft[0].y,
      mirrorLeft[0].x + WALL_THICKNESS, mirrorLeft[0].y,
      mirrorLeft[1].x + WALL_THICKNESS, mirrorLeft[1].y,
      mirrorLeft[1].x, mirrorLeft[1].y,
    );
    p.quad(
      mirrorRight[0].x, mirrorLeft[0].y,
      mirrorRight[0].x - WALL_THICKNESS, mirrorLeft[0].y,
      mirrorRight[1].x - WALL_THICKNESS, mirrorLeft[1].y,
      mirrorRight[1].x, mirrorLeft[1].y,
    );
  }

  function renderSegments() {
    p.stroke(...Color.DEBUG);
    raySegments.forEach((pt, i) => {
      if (i !== 0) {
        const prev = raySegments[i - 1];
        if (prev) {
          p.line(pt.x, pt.y, prev.x, prev.y);
        }
      }

      if (i === raySegments.length - 1) {
        p.line(position.x, position.y, pt.x, pt.y);
        return;
      }

    });
  }
}

