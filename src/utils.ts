import p5 from "p5";

export function reflectAbout(line: p5.Vector, point: p5.Vector): p5.Vector {
  const projectionInline = p5.Vector.mult(line, p5.Vector.dot(point, line)) as unknown as p5.Vector;
  const perpendicular = line.copy(); perpendicular.x *= -1;
  const projectionPerpendicular = p5.Vector.mult(perpendicular, p5.Vector.dot(point, perpendicular)) as unknown as p5.Vector;
  const reflected = p5.Vector.sub(projectionInline, projectionPerpendicular);
  return reflected;
}
