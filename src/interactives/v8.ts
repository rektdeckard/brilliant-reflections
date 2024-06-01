import p5 from "p5";
import {
  Color,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DETECTOR_RADIUS,
  OBJECT_RADIUS,
  PHOTON_RADIUS,
  WALL_THICKNESS,
} from "../constants";

export default function(p: p5) {
  let canv: p5.Renderer;
  let simulating: boolean = true;
  let debug: boolean = false;

  let detectorImage: p5.Image;
  let objectImage: p5.Image;
  let reflectionImage: p5.Image;
  let targetImage: p5.Image;

  let room: Room;
  let object: Thing;
  let target: Thing;
  let detector: Detector;

  let position: p5.Vector;

  let draggingObject = false;
  let draggingDetector = false;
  let raySegments: Array<p5.Vector> = [];

  p.preload = () => {
    detectorImage = p.loadImage("eye.png");
    objectImage = p.loadImage("gem.png");
    reflectionImage = p.loadImage("gem.png");
    targetImage = p.loadImage("gem-outline.png");
  }

  p.setup = () => {
    canv = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    room = new Room(p);
    object = new Thing(p.createVector(
      p.random(room.left() + OBJECT_RADIUS, room.right() - OBJECT_RADIUS),
      p.random(room.top() + OBJECT_RADIUS, room.bottom() - OBJECT_RADIUS),
    ));
    detector = new Detector(p.createVector((p.width / 2) - (WALL_THICKNESS / 2), room.bottom() - (WALL_THICKNESS / 2)));
    target = new Thing(p.createVector(
      p.random(room.left() + OBJECT_RADIUS, room.right() - OBJECT_RADIUS),
      p.random(room.top() + OBJECT_RADIUS, room.bottom() - OBJECT_RADIUS),
    ));

    position = object.position.copy();
    pushPosition();

    targetImage.filter(p.GRAY);
    p.strokeWeight(2);

    canv.mousePressed((e: MouseEvent) => {
      const pos = p.createVector(e.offsetX, e.offsetY);
      if (detector.isDetecting(p, pos)) {
        draggingDetector = true;
        p.cursor("grabbing");
      } else if (object.contains(p, pos)) {
        draggingObject = true;
        p.cursor("grabbing");
      }
    });

    canv.mouseReleased((e: MouseEvent) => {
      draggingDetector = false;
      draggingObject = false;

      const pos = p.createVector(e.offsetX, e.offsetY);
      if (detector.isDetecting(p, pos) || object.contains(p, pos)) {
        p.cursor("grab");
      } else {
        p.cursor(p.ARROW);
      }
    });

    canv.mouseMoved((e: MouseEvent) => {
      const pos = p.createVector(e.offsetX, e.offsetY);

      if (room.contains(pos)) {
        if (detector.isDetecting(p, pos) || object.contains(p, pos)) {
          p.cursor("grab");

          if (draggingObject) {
            object.position = pos;
            p.cursor("grabbing");
          }
          if (draggingDetector) {
            detector.position = pos;
            p.cursor("grabbing");
          }
        } else {
          p.cursor(p.ARROW);
        }
      }
    });

    const dbg = document.querySelector<HTMLInputElement>("#debug > input")!;
    dbg.checked = debug;
    dbg.addEventListener("change", () => debug = !debug);
  }

  p.draw = () => {
    if (!simulating) {
      p.noLoop();
      return;
    };

    room.render(p);
    object.render(p, objectImage);

    {
      p.noStroke();
      p.fill(...Color.MIRROR, 128);
      p.quad(
        room.left() / 2 + WALL_THICKNESS * 2, room.top(),
        room.left() / 2 + WALL_THICKNESS * 3, room.top(),
        room.left() / 2 + WALL_THICKNESS * 3, room.bottom(),
        room.left() / 2 + WALL_THICKNESS * 2, room.bottom(),
      );
      p.quad(
        room.left() * 2 - WALL_THICKNESS * 2, room.top(),
        room.left() * 2 - WALL_THICKNESS * 3, room.top(),
        room.left() * 2 - WALL_THICKNESS * 3, room.bottom(),
        room.left() * 2 - WALL_THICKNESS * 2, room.bottom(),
      );

      const rl = object.position.copy();
      const rll = object.position.copy();
      const rr = object.position.copy();
      const rrr = object.position.copy();
      const trl = target.position.copy();
      const trll = target.position.copy();
      const trr = target.position.copy();
      const trrr = target.position.copy();

      rl.x = (room.left() * 2) - rl.x + WALL_THICKNESS * 2;
      rll.x = (room.left() * 3) - rl.x - WALL_THICKNESS * 2;
      rr.x = (room.left() * 2) - rr.x + (room.right() * (3 / 5)) + WALL_THICKNESS * 6;
      rrr.x = (room.left() * 2) - rr.x + WALL_THICKNESS * 2;

      trl.x = (room.left() * 2) - trl.x + WALL_THICKNESS * 2;
      trll.x = (room.left() * 3) - trl.x - WALL_THICKNESS * 2;
      trr.x = (room.left() * 2) - trr.x + (room.right() * (3 / 5)) + WALL_THICKNESS * 6;
      trrr.x = (room.left() * 2) - trr.x + WALL_THICKNESS * 2;

      p.image(targetImage, trl.x - OBJECT_RADIUS, trl.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
      p.image(targetImage, trr.x - OBJECT_RADIUS, trr.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
      p.image(targetImage, trll.x - OBJECT_RADIUS, trll.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
      p.image(targetImage, trrr.x - OBJECT_RADIUS, trrr.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);

      const success = target.contains(p, object.position);
      if (success || debug) {
        const color = (success ? Color.SUCCESS : Color.RAY) as [number, number, number];
        p.stroke(...color);
        p.line(detector.position.x, detector.position.y, rl.x, rl.y);
        p.line(detector.position.x, detector.position.y, rll.x, rll.y);
        p.line(detector.position.x, detector.position.y, rr.x, rr.y);
        p.line(detector.position.x, detector.position.y, rrr.x, rrr.y);

        p.fill(...Color.OBJECT, 128);
        p.noStroke();
        if (!success) {
          p.tint(255, 128);
        }
        p.image(reflectionImage, rl.x - OBJECT_RADIUS, rl.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
        p.image(reflectionImage, rll.x - OBJECT_RADIUS, rll.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
        p.image(reflectionImage, rr.x - OBJECT_RADIUS, rr.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
        p.image(reflectionImage, rrr.x - OBJECT_RADIUS, rrr.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
        p.tint(255, 255);
      }
    }

    detector.render(p, detectorImage);
  }

  function pushPosition() {
    raySegments.push(position.copy());
  }
}

class Room {
  mirrorLeft: [p5.Vector, p5.Vector];
  mirrorRight: [p5.Vector, p5.Vector];
  wallTop: [p5.Vector, p5.Vector];
  wallBottom: [p5.Vector, p5.Vector];

  constructor(p: p5) {
    const topl = [p.width * (2 / 5), p.height / 4];
    const topr = [p.width * (3 / 5), p.height / 4];
    const botl = [p.width * (2 / 5), p.height * (3 / 4)];
    const botr = [p.width * (3 / 5), p.height * (3 / 4)];

    this.mirrorLeft = [p.createVector(...topl), p.createVector(...botl)];
    this.mirrorRight = [p.createVector(...topr), p.createVector(...botr)];
    this.wallTop = [p.createVector(...topl), p.createVector(...topr)];
    this.wallBottom = [p.createVector(...botl), p.createVector(...botr)]
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

    p.fill(...Color.WALL, 128);
    p.quad(
      0, this.top(),
      this.left(), this.top(),
      this.left(), this.top() + WALL_THICKNESS,
      0, this.top() + WALL_THICKNESS,
    );
    p.quad(
      0, this.bottom(),
      0, this.bottom() - WALL_THICKNESS,
      this.left(), this.bottom() - WALL_THICKNESS,
      this.left(), this.bottom(),
    );
    p.quad(
      this.right(), this.top(),
      p.width, this.top(),
      p.width, this.top() + WALL_THICKNESS,
      this.right(), this.top() + WALL_THICKNESS,
    );
    p.quad(
      this.right(), this.bottom(),
      this.right(), this.bottom() - WALL_THICKNESS,
      p.width, this.bottom() - WALL_THICKNESS,
      p.width, this.bottom(),
    );
  }
}

class Thing {
  position: p5.Vector;

  constructor(position: p5.Vector) {
    this.position = position;
  }

  contains(p: p5, point: p5.Vector) {
    const d = p.dist(point.x, point.y, this.position.x, this.position.y);
    return d <= OBJECT_RADIUS;
  }

  render(p: p5, image: p5.Image) {
    p.image(image, this.position.x - OBJECT_RADIUS, this.position.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
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

  render(p: p5, image: p5.Image) {
    p.image(
      image,
      this.position.x - DETECTOR_RADIUS,
      this.position.y - DETECTOR_RADIUS,
      DETECTOR_RADIUS * 2,
      DETECTOR_RADIUS * 2,
    );
  }
}
