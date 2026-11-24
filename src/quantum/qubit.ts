import type { Complex } from "./complex";
import { complex, add, mul, scale, abs2, conj } from "./complex";
import type { Vec3 } from "./vec3";
import { vec3 } from "./vec3";

const ZERO: Complex = { re: 0, im: 0 };
const ONE: Complex = { re: 1, im: 0 };

export interface QubitState {
  alpha: Complex
  beta: Complex
};

export function qubit(alpha: Complex, beta: Complex): QubitState {
  return { alpha, beta };
}

const INV_SQRT2 = Math.SQRT1_2;
export const KET_0 = qubit(ONE, ZERO);
export const KET_1 = qubit(ZERO, ONE);
export const KET_PLUS = qubit(complex(INV_SQRT2), complex(INV_SQRT2));
export const KET_MINUS = qubit(complex(INV_SQRT2), complex(-INV_SQRT2));
export const KET_PLUS_I = qubit(complex(INV_SQRT2), complex(0, INV_SQRT2));
export const KET_MINUS_I = qubit(complex(INV_SQRT2), complex(0, -INV_SQRT2));

export interface NamedState {
  readonly label: string;
  readonly state: QubitState;
}

/** The six cardinal states, i.e. the ± eigenstates of Z, X and Y. */
export const CARDINAL_STATES: readonly NamedState[] = [
  { label: '|0⟩', state: KET_0 },
  { label: '|1⟩', state: KET_1 },
  { label: '|+⟩', state: KET_PLUS },
  { label: '|−⟩', state: KET_MINUS },
  { label: '|+i⟩', state: KET_PLUS_I },
  { label: '|−i⟩', state: KET_MINUS_I },
];

export type Matrix2 = readonly [readonly [Complex, Complex], readonly [Complex, Complex]];

export function applyMatrix(m: Matrix2, s: QubitState): QubitState {
  const [[m00, m01], [m10, m11]] = m;
  return qubit(add(mul(m00, s.alpha), mul(m01, s.beta)), add(mul(m10, s.alpha), mul(m11, s.beta)));
}

export function norm(s: QubitState): number {
  return Math.sqrt(abs2(s.alpha) + abs2(s.beta));
}

/** Rescale to unit norm; guards against floating-point drift after many gates. */
export function normalize(s: QubitState): QubitState {
  const n = norm(s);
  if (n === 0) throw new RangeError('Cannot normalise the zero state');
  return qubit(scale(s.alpha, 1 / n), scale(s.beta, 1 / n));
}

export function blochVector(s: QubitState): Vec3 {
  const coherence = mul(conj(s.alpha), s.beta);
  return vec3(2 * coherence.re, 2 * coherence.im, abs2(s.alpha) - abs2(s.beta));
}
