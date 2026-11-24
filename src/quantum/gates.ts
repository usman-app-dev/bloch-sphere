import { type Vec3, X_AXIS, Y_AXIS, Z_AXIS, normalize, vec3 } from './vec3';
import type { Matrix2 } from "./qubit";
import { type Complex, expi, mul } from './complex';

export function rotationMatrix(axis: Vec3, angle: number): Matrix2 {
  const n = normalize(axis);
  const c = Math.cos(angle / 2);
  const s = Math.sin(angle / 2);
  return [
    [{ re: c, im: -s * n.z }, { re: -s * n.y, im: -s * n.x }],
    [{ re: s * n.y, im: -s * n.x }, { re: c, im: s * n.z }],
  ];
}

export interface Gate {
  readonly name: string;
  readonly description: string;
  readonly axis: Vec3;
  /** Rotation angle in radians. */
  readonly angle: number;
  /** Global phase in radians; it does not move the Bloch vector. */
  readonly globalPhase: number;
}

export function gateMatrix(gate: Gate): Matrix2 {
  const phase = expi(gate.globalPhase);
  const [[a, b], [c, d]] = rotationMatrix(gate.axis, gate.angle);
  const p = (z: Complex): Complex => mul(phase, z);
  return [
    [p(a), p(b)],
    [p(c), p(d)],
  ];
}

const PI = Math.PI;

export const PAULI_X: Gate = {
  name: 'X',
  description: 'Pauli-X (NOT): π about x',
  axis: X_AXIS,
  angle: PI,
  globalPhase: PI / 2,
};
export const PAULI_Y: Gate = {
  name: 'Y',
  description: 'Pauli-Y: π about y',
  axis: Y_AXIS,
  angle: PI,
  globalPhase: PI / 2,
};
export const PAULI_Z: Gate = {
  name: 'Z',
  description: 'Pauli-Z (phase flip): π about z',
  axis: Z_AXIS,
  angle: PI,
  globalPhase: PI / 2,
};
export const HADAMARD: Gate = {
  name: 'H',
  description: 'Hadamard: π about (x + z)/√2',
  axis: normalize(vec3(1, 0, 1)),
  angle: PI,
  globalPhase: PI / 2,
};

// export const PHASE_S: Gate = {
//   name: 'S',
//   description: 'S = √Z: π/2 about z',
//   axis: Z_AXIS,
//   angle: PI / 2,
//   globalPhase: PI / 4,
// };
// export const PHASE_T: Gate = {
//   name: 'T',
//   description: 'T = √S: π/4 about z',
//   axis: Z_AXIS,
//   angle: PI / 4,
//   globalPhase: PI / 8,
// };

export const FIXED_GATES: readonly Gate[] = [PAULI_X, PAULI_Y, PAULI_Z, HADAMARD];

export type RotationAxis = 'x' | 'y' | 'z';

const AXES: Readonly<Record<RotationAxis, Vec3>> = { x: X_AXIS, y: Y_AXIS, z: Z_AXIS };

export function rotationGate(axis: RotationAxis, degrees: number): Gate {
  const label = `R${axis}(${formatDegrees(degrees)})`;
  return {
    name: label,
    description: `Rotate ${formatDegrees(degrees)} about ${axis}`,
    axis: AXES[axis],
    angle: (degrees * PI) / 180,
    globalPhase: 0,
  };
}

function formatDegrees(degrees: number): string {
  const rounded = Math.round(degrees * 10) / 10;
  return `${rounded.toString().replace('-', '−')}°`;
}
