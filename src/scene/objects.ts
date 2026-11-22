import * as THREE from 'three';
import type { Vec3 } from '../quantum/vec3';
import { CSS2DObject } from 'three/examples/jsm/Addons.js';
import { toWorld } from './coordinates';

export const PALETTE = {
  sphere: 0x3b82f6,
  gridBright: 0x94a3b8,
  gridDim: 0x475569,
  axis: 0xcbd5e1,
  state: 0xf472b6,
  trail: 0xfbbf24,
  rotationAxis: 0x34d399,
  projection: 0xf9a8d4,
} as const;

/** Creates a circle of given radius in the plane perpendicular to `normal` (world coordinates), centered at `centre`. */
function circle(radius: number, normal: THREE.Vector3, centre: THREE.Vector3, material: THREE.LineBasicMaterial, segments = 128): THREE.LineLoop {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * 2 * Math.PI;
    points.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
  }
  const loop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), material);
  loop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal.clone().normalize())
  loop.position.copy(centre);
  return loop;
}

export function createSphere(): THREE.Group {
  const group = new THREE.Group();

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 96),
    new THREE.MeshPhongMaterial({
      color: PALETTE.sphere,
      transparent: true,
      opacity: 0.10,
      shininess: 70,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );

  group.add(shell);

  const bright = new THREE.LineBasicMaterial({
    color: PALETTE.gridBright,
    transparent: true,
    opacity: 0.6,
  });
  const dim = new THREE.LineBasicMaterial({
    color: PALETTE.gridDim,
    transparent: true,
    opacity: 0.35,
  });

  group.add(circle(1, new THREE.Vector3(0, 1, 0), new THREE.Vector3(), bright));
  group.add(circle(1, new THREE.Vector3(0, 0, 1), new THREE.Vector3(), bright));
  group.add(circle(1, new THREE.Vector3(1, 0, 0), new THREE.Vector3(), bright));

  for (const latitude of [-60, -30, 30, 60]) {
    const rad = (latitude * Math.PI) / 180;
    group.add(circle(Math.cos(rad), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, Math.sin(rad), 0), dim));
  }
  for (const longitude of [30, 60, 120, 150]) {
    const rad = (longitude * Math.PI) / 180;
    group.add(
      circle(1, new THREE.Vector3(Math.cos(rad), 0, Math.sin(rad)), new THREE.Vector3(), dim),
    );
  }

  return group;
}

function label(html: string, className: string): CSS2DObject {
  const element = document.createElement('div');
  element.className = className;
  element.innerHTML = html;
  return new CSS2DObject(element);
}

interface AxisSpec {
  readonly direction: Vec3;
  readonly positive: string;
  readonly negative: string;
  readonly name: string;
}

const AXIS_SPECS: readonly AxisSpec[] = [
  { direction: { x: 1, y: 0, z: 0 }, positive: '|+⟩', negative: '|−⟩', name: 'x' },
  { direction: { x: 0, y: 1, z: 0 }, positive: '|+i⟩', negative: '|−i⟩', name: 'y' },
  { direction: { x: 0, y: 0, z: 1 }, positive: '|0⟩', negative: '|1⟩', name: 'z' },
];

/** x, y, z axes with labelled cardinal states at each end. */
export function createAxes(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: PALETTE.axis,
    transparent: true,
    opacity: 0.55,
  });
  const extent = 1.25;

  for (const spec of AXIS_SPECS) {
    const end = toWorld(spec.direction).multiplyScalar(extent);
    const geometry = new THREE.BufferGeometry().setFromPoints([end.clone().negate(), end]);
    group.add(new THREE.Line(geometry, material));

    const positive = label(
      `<span class="ket">${spec.positive}</span><span class="axis-name">${spec.name}</span>`,
      'axis-label',
    );
    positive.position.copy(end).multiplyScalar(1.1);
    const negative = label(`<span class="ket">${spec.negative}</span>`, 'axis-label');
    negative.position.copy(end).multiplyScalar(-1.1);
    group.add(positive, negative);
  }
  return group;
}

export class StateArrow {

  private static readonly CYL_DIM = {
    radius: 0.02,
    height: 0.85,
  };
  private static readonly CON_DIM = {
    radius: 0.07,
    height: 0.15,
  };
  private readonly cylinder: THREE.Mesh;
  private readonly cone: THREE.Mesh;
  private readonly group = new THREE.Group();
  private readonly material: THREE.MeshStandardMaterial;

  constructor() {
    this.material = new THREE.MeshStandardMaterial({
      color: PALETTE.state,
      emissive: PALETTE.state,
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0.1,
    });

    this.cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(StateArrow.CYL_DIM.radius, StateArrow.CYL_DIM.radius, StateArrow.CYL_DIM.height, 32),
      this.material
    );

    this.cone = new THREE.Mesh(
      new THREE.ConeGeometry(StateArrow.CON_DIM.radius, StateArrow.CON_DIM.height, 32),
      this.material
    );

    this.cylinder.translateY(StateArrow.CYL_DIM.height / 2)
    this.cone.translateY(StateArrow.CYL_DIM.height + StateArrow.CON_DIM.height / 2);
    this.group.add(this.cylinder, this.cone)
  }

  public setDirection(v: Vec3) {
    const direction = toWorld(v).normalize();
    this.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
  }

  public getGroup(): THREE.Group {
    return this.group;
  }
}
