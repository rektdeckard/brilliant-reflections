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

  let draggingObject = false;
  let draggingDetector = false;

  function reset() {
    object = new Thing(p.createVector(
      p.random(room.left() + OBJECT_RADIUS, room.right() - OBJECT_RADIUS),
      p.random(room.top() + OBJECT_RADIUS, room.bottom() - OBJECT_RADIUS),
    ));
    target = new Thing(p.createVector(
      p.random(room.left() + OBJECT_RADIUS, room.right() - OBJECT_RADIUS),
      p.random(room.top() + OBJECT_RADIUS, room.bottom() - OBJECT_RADIUS),
    ));
    detector = new Detector(p.createVector((p.width / 2) - (WALL_THICKNESS / 2), room.bottom() - (WALL_THICKNESS / 2)));
  }

  p.preload = () => {
    detectorImage = p.loadImage("eye.png");
    objectImage = p.loadImage("gem.png");
    reflectionImage = p.loadImage("gem.png");
    targetImage = p.loadImage("gem-outline.png");
  }

  p.setup = () => {
    canv = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    room = new Room(p);
    reset();

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
    dbg.addEventListener("change", () => {
      debug = !debug;
    });

    const rst = document.getElementById("reset")!;
    rst.addEventListener("click", reset);
  }

  p.draw = () => {
    if (!simulating) {
      p.noLoop();
      return;
    };

    room.render(p);

    {
      {
        // Render walls of virtual rooms
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
        p.quad(
          WALL_THICKNESS * 4, room.top(),
          WALL_THICKNESS * 5, room.top(),
          WALL_THICKNESS * 5, room.bottom(),
          WALL_THICKNESS * 4, room.bottom(),
        );
        p.quad(
          p.width - WALL_THICKNESS * 4, room.top(),
          p.width - WALL_THICKNESS * 5, room.top(),
          p.width - WALL_THICKNESS * 5, room.bottom(),
          p.width - WALL_THICKNESS * 4, room.bottom(),
        );
      }

      // Render virtual targets
      {
        const trl = target.position.copy();
        trl.x = (room.left() * 2) - trl.x + WALL_THICKNESS * 2;
        p.image(targetImage, trl.x - OBJECT_RADIUS, trl.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);

        const trll = target.position.copy();
        trll.x = (room.left() * 3) - trl.x - WALL_THICKNESS * 2;
        p.image(targetImage, trll.x - OBJECT_RADIUS, trll.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);

        const trr = target.position.copy();
        trr.x = (room.left() * 2) - trr.x + (room.right() * (3 / 5)) + WALL_THICKNESS * 6;
        p.image(targetImage, trr.x - OBJECT_RADIUS, trr.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);

        const trrr = target.position.copy();
        trrr.x = (room.left() * 2) - trr.x + WALL_THICKNESS * 2;
        p.image(targetImage, trrr.x - OBJECT_RADIUS, trrr.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
      }

      const success = target.contains(p, object.position);
      if (success || debug) {
        // Render virtual image r
        const rr = object.position.copy();
        rr.x = (room.left() * 2) - rr.x + (room.right() * (3 / 5)) + WALL_THICKNESS * 6;
        {
          const color = (success ? Color.SUCCESS : Color.WARNING) as [number, number, number];
          p.stroke(...color);
          const h = ((room.right() - detector.position.x) * (rr.y - detector.position.y)) / (rr.x - detector.position.x);
          const ri = p.createVector(room.right(), detector.position.y + h);
          p.line(detector.position.x, detector.position.y, ri.x, ri.y);
          p.line(ri.x, ri.y, object.position.x, object.position.y);
          p.stroke(...color, 64);
          p.line(ri.x, ri.y, rr.x, rr.y);
        }

        // Render virtual image l
        const rl = object.position.copy();
        rl.x = (room.left() * 2) - rl.x + WALL_THICKNESS * 2;
        {
          const color = (success ? Color.SUCCESS : Color.DEBUG) as [number, number, number];
          p.stroke(...color);
          const h = ((detector.position.x - room.left()) * (detector.position.y - rl.y)) / (detector.position.x - rl.x);
          const li = p.createVector(room.left(), detector.position.y - h);
          p.line(detector.position.x, detector.position.y, li.x, li.y);
          p.line(li.x, li.y, object.position.x, object.position.y);
          p.stroke(...color, 64);
          p.line(li.x, li.y, rl.x, rl.y);
        }

        // Render virtual image r'
        const rrr = object.position.copy();
        rrr.x = (room.left() * 3) - rl.x - WALL_THICKNESS * 2;
        {
          const color = (success ? Color.SUCCESS : Color.INFO) as [number, number, number];
          p.stroke(...color);
          const w = room.right() - room.left();
          const rw = (room.left() * 2 - WALL_THICKNESS * 3);
          const rat = (rrr.x - detector.position.x) / (rrr.y - detector.position.y);
          const h1 = (room.right() - detector.position.x) / rat;
          const h2 = ((room.left() * 2 + WALL_THICKNESS * 2) - detector.position.x) / rat;
          const rri = p.createVector(room.right(), detector.position.y + h1);
          const rrii = p.createVector(rw - w * 2 + WALL_THICKNESS * 3, detector.position.y + h2);
          p.line(detector.position.x, detector.position.y, rri.x, rri.y);
          p.line(rri.x, rri.y, rrii.x, rrii.y);
          p.line(rrii.x, rrii.y, object.position.x, object.position.y);
          p.stroke(...color, 64);
          p.line(detector.position.x, detector.position.y, rrr.x, rrr.y);
        }

        // Render virtual image l'
        const rll = object.position.copy();
        rll.x = (room.left() * 2) - rr.x + WALL_THICKNESS * 2;
        {
          const color = (success ? Color.SUCCESS : Color.ERROR) as [number, number, number];
          p.stroke(...color);
          const w = room.right() - room.left();
          const rw = (room.left() * 2 - WALL_THICKNESS * 3);
          const rat = (detector.position.x - rll.x) / (rll.y - detector.position.y);
          const h1 = (detector.position.x - room.left()) / rat;
          const h2 = (detector.position.x - room.left() / 2 + WALL_THICKNESS * 2) / rat;
          const rri = p.createVector(room.left(), detector.position.y + h1);
          const rrii = p.createVector(rw - w * 2 + WALL_THICKNESS * 3 + w, detector.position.y + h2);
          p.line(detector.position.x, detector.position.y, rri.x, rri.y);
          p.line(rri.x, rri.y, rrii.x, rrii.y);
          p.line(rrii.x, rrii.y, object.position.x, object.position.y);
          p.stroke(...color, 64);
          p.line(detector.position.x, detector.position.y, rll.x, rll.y);
        }

        p.fill(...Color.OBJECT, 128);
        p.noStroke();
        if (!success) {
          p.tint(255, 128);
        }
        p.image(reflectionImage, rl.x - OBJECT_RADIUS, rl.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
        p.image(reflectionImage, rrr.x - OBJECT_RADIUS, rrr.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
        p.image(reflectionImage, rr.x - OBJECT_RADIUS, rr.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
        p.image(reflectionImage, rll.x - OBJECT_RADIUS, rll.y - OBJECT_RADIUS, OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
        p.tint(255, 255);
      }
    }

    object.render(p, objectImage);
    detector.render(p, detectorImage);
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
