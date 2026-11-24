export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

export const X_AXIS = vec3(1, 0, 0);
export const Y_AXIS = vec3(0, 1, 0);
export const Z_AXIS = vec3(0, 0, 1);

export function dot(v1: Vec3, v2: Vec3): number {
  return (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z);
}

export function cross(v1: Vec3, v2: Vec3): Vec3 {
  return vec3(v1.y * v2.z - v1.z * v2.y, -(v1.x * v2.z) + v1.z * v2.x, v1.x * v2.y - v1.y * v2.x);
}

export function length(v: Vec3): number {
  return Math.sqrt(dot(v, v));
}

export function normalize(v: Vec3): Vec3 {
  const len = length(v);
  if (len === 0) throw new RangeError('Cannot normalise the zero vector');
  return vec3(v.x / len, v.y / len, v.z / len);
}
