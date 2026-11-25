import type { BlochScene } from './scene/blochScene';
import { formatComplex } from './quantum/complex';
import { type Gate, type RotationAxis, FIXED_GATES, gateMatrix, rotationGate, rotationMatrix } from './quantum/gates';
import { type QubitState, CARDINAL_STATES, KET_0, applyMatrix, blochVector, normalize, removeGlobalPhase } from './quantum/qubit';
import { length } from './quantum/vec3';

const TRAIL_POINTS = 100;

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element #${id} not found`);
  return element as T;
}

function setText(id: string, text: string): void {
  byId(id).textContent = text;
}

function toDegrees(radians: number): string {
  return `${((radians * 180) / Math.PI).toFixed(1)}°`;
}

export class App {
  private readonly scene: BlochScene;
  private readonly angleSlider = byId<HTMLInputElement>('angle-slider');
  private readonly angleInput = byId<HTMLInputElement>('angle-number');
  private state: QubitState = KET_0;
  private history: QubitState[] = [];
  private animating = false;

  constructor(scene: BlochScene) {
    this.scene = scene;
    this.bindControls();
    this.render(this.state);
  }

  private bindControls(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-gate]').forEach((button) => {
      const gate = FIXED_GATES.find((g) => g.name === button.dataset.gate);
      if (!gate) throw new Error(`Unknown gate "${button.dataset.gate}"`);
      button.addEventListener('click', () => this.applyGate(gate));
    });

    document.querySelectorAll<HTMLButtonElement>('[data-rotation-axis]').forEach((button) => {
      const axis = button.dataset.rotationAxis as RotationAxis;
      button.addEventListener('click', () => this.applyGate(rotationGate(axis, this.angle())));
    });

    document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
      const preset = CARDINAL_STATES[Number(button.dataset.preset)];
      if (!preset) throw new Error(`Unknown preset "${button.dataset.preset}"`);
      button.addEventListener('click', () => this.prepare(preset.state));
    });

    this.angleSlider.addEventListener('input', () => (this.angleInput.value = this.angleSlider.value));
    this.angleInput.addEventListener('input', () => (this.angleSlider.value = this.angleInput.value));
    this.angleInput.addEventListener('change', () => (this.angleInput.value = String(this.angle())));

    byId('undo').addEventListener('click', () => this.undo());
    byId('reset').addEventListener('click', () => this.reset());
    byId('clear-trail').addEventListener('click', () => this.scene.clearTrail());
  }

  /** The angle box in degrees, clamped to ±360 (0 if empty). */
  private angle(): number {
    const degrees = Number(this.angleInput.value) || 0;
    return Math.max(-360, Math.min(360, degrees));
  }

  /** Animates the gate as a rotation of the arrow about the gate's axis. */
  private applyGate(gate: Gate): void {
    if (this.animating) return;
    this.animating = true;

    const start = this.state;
    this.history.push(start);

    // Partway through, the state is the same rotation by a fraction of the angle.
    const stateAt = (t: number) => applyMatrix(rotationMatrix(gate.axis, gate.angle * t), start);
    const path = Array.from({ length: TRAIL_POINTS + 1 }, (_, i) => blochVector(stateAt(i / TRAIL_POINTS)));
    this.scene.startTrail(path);

    const duration = 400 + (400 * Math.abs(gate.angle)) / Math.PI; // ms, longer for bigger turns
    let startTime: number | undefined;

    const frame = (now: number): void => {
      startTime ??= now;
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t * t * (3 - 2 * t); // smoothstep: ease in and out
      this.render(stateAt(eased));
      this.scene.revealTrail(eased);

      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }
      // Finish on the exact gate result, including its global phase.
      this.state = normalize(applyMatrix(gateMatrix(gate), start));
      this.render(this.state);
      this.animating = false;
    };
    requestAnimationFrame(frame);
  }

  private prepare(state: QubitState): void {
    if (this.animating) return;
    this.history.push(this.state);
    this.setState(state);
  }

  private undo(): void {
    if (this.animating) return;
    const previous = this.history.pop();
    if (previous) this.setState(previous);
  }

  private reset(): void {
    if (this.animating) return;
    this.history = [];
    this.scene.clearTrail();
    this.setState(KET_0);
  }

  private setState(state: QubitState): void {
    this.state = state;
    this.render(state);
  }

  /** Points the arrow at the state and fills in the State card. */
  private render(state: QubitState): void {
    const v = blochVector(state);
    this.scene.setBlochVector(v);

    const { alpha, beta } = removeGlobalPhase(state);
    setText('state-alpha', formatComplex(alpha));
    setText('state-beta', formatComplex(beta));

    // θ, φ and the probabilities can all be read straight off the Bloch vector.
    const theta = Math.acos(Math.max(-1, Math.min(1, v.z)));
    const phi = (Math.atan2(v.y, v.x) + 2 * Math.PI) % (2 * Math.PI);
    const atPole = Math.hypot(v.x, v.y) < 1e-9; // φ is undefined at |0⟩ and |1⟩
    setText('state-theta', toDegrees(theta));
    setText('state-phi', atPole ? '—' : toDegrees(phi));
    setText('state-bloch', length(v).toFixed(3));

    const p0 = (1 + v.z) / 2;
    const p1 = 1 - p0;
    byId('prob-0-bar').style.width = `${p0 * 100}%`;
    byId('prob-1-bar').style.width = `${p1 * 100}%`;
    setText('prob-0-value', p0.toFixed(3));
    setText('prob-1-value', p1.toFixed(3));
  }
}
