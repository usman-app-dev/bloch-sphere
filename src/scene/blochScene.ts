import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createAxes, createSphere, StateArrow } from './objects';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { toWorld } from './coordinates';
import type { Vec3 } from '../quantum/vec3';
import { PALETTE } from './objects';

export class BlochScene {

  private readonly container: HTMLElement;
  private readonly sizes = { width: 0, height: 0 };
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly ambientLight: THREE.AmbientLight;
  private readonly directionalLight: THREE.DirectionalLight;
  private readonly labelRenderer = new CSS2DRenderer();
  private readonly arrow = new StateArrow();
  private readonly trails = new THREE.Group();
  private readonly trailMaterial = new THREE.LineBasicMaterial({ color: PALETTE.trail });
  private activeTrail: THREE.Line | null = null;

  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
    if (!canvas) throw new Error('Canvas "canvas.webgl" not found');
    this.canvas = canvas;

    this.container = canvas.parentElement as HTMLElement;
    this.sizes.width = this.container.clientWidth;
    this.sizes.height = this.container.clientHeight;

    this.scene = new THREE.Scene()

    //////////////// *** Lights *** ////////////////
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.6)
    this.directionalLight.position.set(3, 4, 5);

    //////////////// *** Cameras *** ////////////////
    this.camera = new THREE.PerspectiveCamera(40, this.sizes.width / this.sizes.height, 0.1, 100);
    this.camera.position.copy(toWorld({ x: 4.2, y: 1.8, z: 1.7 }));

    //////////////// *** Controls *** ////////////////
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.minDistance = 2.5;   // can't get closer than 2 units (sphere radius is 1)
    this.controls.maxDistance = 9;

    //////////////// *** Renderer *** ////////////////
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(this.sizes.width, this.sizes.height, false)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    const container = this.canvas.parentElement as HTMLElement;
    this.labelRenderer.domElement.classList.add('label-layer');
    container.appendChild(this.labelRenderer.domElement);


    this.scene.add(
      this.ambientLight,
      this.directionalLight,
      createSphere(),
      createAxes(),
      this.arrow.getGroup(),
      this.trails
    );

    // window.addEventListener('resize', this.onResize);
    new ResizeObserver(this.onResize).observe(this.container);
    this.tick();
  }

  //////////////// *** Resize *** ////////////////
  private readonly onResize = (): void => {
    this.sizes.width = this.container.clientWidth;
    this.sizes.height = this.container.clientHeight;

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.sizes.width, this.sizes.height, false);
    this.labelRenderer.setSize(this.sizes.width, this.sizes.height);
  };

  //////////////// *** Animate *** ////////////////
  private readonly tick = (): void => {
    // Update controls
    this.controls.update();

    // Render
    this.renderer.render(this.scene, this.camera);

    // Labels
    this.labelRenderer.render(this.scene, this.camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(this.tick);
  };

  //////////////// *** State arrow and trail *** ////////////////
  public setBlochVector(v: Vec3): void {
    this.arrow.setDirection(v);
  }

  /** Adds the path a gate will follow, hidden until revealTrail() is called. */
  public startTrail(path: readonly Vec3[]): void {
    const geometry = new THREE.BufferGeometry().setFromPoints(path.map((p) => toWorld(p)));
    geometry.setDrawRange(0, 0);
    this.activeTrail = new THREE.Line(geometry, this.trailMaterial);
    this.trails.add(this.activeTrail);
  }

  /** Shows the first `fraction` (0 to 1) of the trail added last. */
  public revealTrail(fraction: number): void {
    if (!this.activeTrail) return;
    const pointCount = this.activeTrail.geometry.getAttribute('position').count;
    this.activeTrail.geometry.setDrawRange(0, Math.ceil(fraction * (pointCount - 1)) + 1);
  }

  public clearTrail(): void {
    for (const line of this.trails.children as THREE.Line[]) line.geometry.dispose();
    this.trails.clear();
    this.activeTrail = null;
  }
}
