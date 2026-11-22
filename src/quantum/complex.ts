export interface Complex {
  readonly re: number;
  readonly im: number;
}

export function mul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

/** Create complex number. */
export function complex(re: number, im = 0): Complex {
  return { re, im };
}

export function add(a: Complex, b: Complex): Complex {
  return complex(a.re + b.re, a.im + b.im);
}

/** Multiplies by a real number. */
export function scale(z: Complex, k: number): Complex {
  return complex(z.re * k, z.im * k);
}

/** Complex conjugate. */
export function conj(z: Complex): Complex {
  return complex(z.re, -z.im);
}

/** Squared magnitude. */
export function abs2(z: Complex): number {
  return z.re * z.re + z.im * z.im;
}

/** Magnitude. */
export function abs(z: Complex): number {
  return Math.hypot(z.re, z.im);
}

/** Phase angle in radians. */
export function arg(z: Complex): number {
  return Math.atan2(z.im, z.re);
}

/** Create e^(ix) = cosx + isinx. */
export function expi(theta: number): Complex {
  return complex(Math.cos(theta), Math.sin(theta));
}

const MINUS = "−"; // typographic minus sign "−"

/**
 * Formats z as "0.707", "−0.500i" or "0.354 + 0.612i".
 * A part that would round to zero at the given precision is hidden.
 */
export function formatComplex(z: Complex, digits = 3): string {
  const roundsToZero = (x: number) => Number(Math.abs(x).toFixed(digits)) === 0;
  const mag = (x: number) => Math.abs(x).toFixed(digits);
  const signed = (x: number) => (x < 0 ? MINUS : "") + mag(x);

  const showRe = !roundsToZero(z.re);
  const showIm = !roundsToZero(z.im);

  if (showRe && showIm) {
    return `${signed(z.re)} ${z.im < 0 ? MINUS : "+"} ${mag(z.im)}i`;
  }
  if (showIm) return `${signed(z.im)}i`;
  if (showRe) return signed(z.re);
  return (0).toFixed(digits);
}
