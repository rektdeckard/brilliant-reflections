import p5 from "p5";
import {
  Color,
  C,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DETECTOR_RADIUS,
  OBJECT_RADIUS,
  PHOTON_RADIUS,
  WALL_THICKNESS,
} from "../constants";

class Room {
  mirrorLeft: [p5.Vector, p5.Vector];
  mirrorRight: [p5.Vector, p5.Vector];
  wallTop: [p5.Vector, p5.Vector];
  wallBottom: [p5.Vector, p5.Vector];

  constructor(p: p5) {
    this.mirrorLeft = [p.createVector(CANVAS_WIDTH, 0), p.createVector(CANVAS_WIDTH, p.height)];
    this.mirrorRight = [p.createVector(CANVAS_WIDTH * 2, 0), p.createVector(CANVAS_WIDTH * 2, p.height)];
    this.wallTop = [p.createVector(CANVAS_WIDTH, 0), p.createVector(CANVAS_WIDTH * 2, 0)];
    this.wallBottom = [p.createVector(CANVAS_WIDTH, p.height), p.createVector(CANVAS_WIDTH * 2, p.height)]
  }

  left() {
    return this.mirrorLeft[0].x;
  }

  right() {
    return this.mirrorRight[0].x;
  }

  top() {
    return this.wallTop[0].y;
  }

  bottom() {
    return this.wallBottom[0].y;
  }

  isLeftReflection(position: p5.Vector) {
    return position.x < this.left() + PHOTON_RADIUS;
  }

  isRightReflection(position: p5.Vector) {
    return position.x > this.right() - PHOTON_RADIUS;
  }

  isTopAbsorption(position: p5.Vector) {
    return position.y < this.top() + PHOTON_RADIUS;
  }

  isBottomAbsorption(position: p5.Vector) {
    return position.y > this.bottom() - PHOTON_RADIUS;
  }

  contains(position: p5.Vector) {
    return !(
      this.isLeftReflection(position) ||
      this.isRightReflection(position) ||
      this.isTopAbsorption(position) ||
      this.isBottomAbsorption(position)
    );
  }

  render(p: p5) {
    p.fill(...Color.FLOOR);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);

    p.fill(...Color.MIRROR);
    p.quad(
      this.left(), this.top(),
      this.left() + WALL_THICKNESS, this.top(),
      this.left() + WALL_THICKNESS, this.bottom(),
      this.left(), this.bottom(),
    );
    p.quad(
      this.right(), this.top(),
      this.right() - WALL_THICKNESS, this.top(),
      this.right() - WALL_THICKNESS, this.bottom(),
      this.right(), this.bottom(),
    );
    p.fill(...Color.WALL);
    p.quad(
      this.left(), this.top(),
      this.right(), this.top(),
      this.right(), this.top() + WALL_THICKNESS,
      this.left(), this.top() + WALL_THICKNESS,
    );
    p.quad(
      this.left(), this.bottom() - WALL_THICKNESS,
      this.right(), this.bottom() - WALL_THICKNESS,
      this.right(), this.bottom(),
      this.left(), this.bottom(),
    );
  }
}

class Emitter {
  position: p5.Vector;

  constructor(position: p5.Vector) {
    this.position = position;
  }

  render(p: p5) {
    p.noStroke();
    p.fill(...Color.OBJECT);
    p.circle(this.position.x, this.position.y, OBJECT_RADIUS * 2);
  }
}

class VirtualImage {
  position: p5.Vector;

  constructor(position: p5.Vector) {
    this.position = position;
  }

  render(p: p5, d: Detector) {
    p.stroke(...Color.RAY);
    p.line(this.position.x, this.position.y, d.position.x, d.position.y);

    p.noStroke();
    p.fill(...Color.OBJECT, 64);
    p.circle(this.position.x, this.position.y, OBJECT_RADIUS * 2);
  }
}

class Detector {
  position: p5.Vector;

  constructor(position: p5.Vector) {
    this.position = position;
  }

  isDetecting(p: p5, point: p5.Vector) {
    const d = p.dist(point.x, point.y, this.position.x, this.position.y);
    return d <= DETECTOR_RADIUS;
  }

  render(p: p5) {
    p.noStroke();
    p.fill(...Color.DEBUG);
    p.ellipse(this.position.x, this.position.y, DETECTOR_RADIUS * 2, DETECTOR_RADIUS * 2);
  }
}

export default function(p: p5) {
  let canv: p5.Renderer;
  let simulating: boolean = true;

  let room: Room;
  let object: Emitter;
  let image: VirtualImage;
  let detector: Detector;

  let position: p5.Vector;
  let velocity: p5.Vector;
  let incidence: p5.Vector;

  let raySegments: Array<p5.Vector> = [];

  p.setup = () => {
    canv = p.createCanvas(CANVAS_WIDTH * 3, CANVAS_HEIGHT);
    room = new Room(p);
    object = new Emitter(p.createVector(p.random(room.left(), room.right()), p.random(room.top(), room.bottom())));
    image = new VirtualImage(object.position.copy());
    detector = new Detector(p.createVector(p.width / 2, p.height - WALL_THICKNESS / 2));

    position = object.position.copy();
    pushPosition();

    velocity = p5.Vector.random2D();
    velocity.mult(C);

    canv.mouseMoved((e: MouseEvent) => {
      const pos = p.createVector(e.offsetX, e.offsetY);
      if (!room.contains(pos)) {
        image.position = pos;
      }
    });
  }

  p.draw = () => {
    if (!simulating) return;

    room.render(p);
    object.render(p);
    position.add(velocity);

    incidence = p5.Vector.mult(velocity, -1) as unknown as p5.Vector;
    incidence.normalize();

    if (!room.contains(image.position)) {
      image.render(p, detector);
    }

    if (detector.isDetecting(p, position)) {
      p.stroke(...Color.DEBUG);
      simulating = false;
    }

    if (room.isRightReflection(position)) {
      position.x = room.right() - PHOTON_RADIUS;
      velocity.x *= -1;
      pushPosition();
    }
    if (room.isLeftReflection(position)) {
      position.x = room.left() + PHOTON_RADIUS;
      velocity.x *= -1;
      pushPosition();
    }
    if (room.isTopAbsorption(position)) {
      position.y = room.top() + PHOTON_RADIUS;
      velocity.y *= -1;
      pushPosition();
    }
    if (room.isBottomAbsorption(position)) {
      position.y = room.bottom() - PHOTON_RADIUS;
      velocity.y *= -1;
      pushPosition();
      simulating = false;
    }

    detector.render(p);
    renderSegments();
    renderPhoton();
  }

  function pushPosition() {
    raySegments.push(position.copy());
  }


  function renderPhoton() {
    p.noStroke();
    p.fill(...Color.RAY);
    p.ellipse(position.x, position.y, PHOTON_RADIUS * 2, PHOTON_RADIUS * 2);
  }


  function renderSegments() {
    p.stroke(...Color.RAY);
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

