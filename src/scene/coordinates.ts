import { Vector3 } from "three";
import type { Vec3 } from "../quantum/vec3";

// Do all maths in physics coordinates and convert only when drawing.
// (x, y, z) -> (x, z, -y)
export function toWorld(v: Vec3, target = new Vector3()): Vector3 {
  return target.set(v.x, v.z, -v.y);
}
