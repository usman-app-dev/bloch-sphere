import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createAxes, createSphere, StateArrow } from './objects';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { toWorld } from './coordinates';
import { vec3 } from '../quantum/vec3'
import { mul, formatComplex, complex, expi } from '../quantum/complex';

export class BlochScene {

  private readonly sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly ambientLight: THREE.AmbientLight;
  private readonly directionalLight: THREE.DirectionalLight;
  private readonly labelRenderer = new CSS2DRenderer();
  private readonly timer = new THREE.Timer();
  private readonly arrow = new StateArrow();


  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
    if (!canvas) throw new Error('Canvas "canvas.webgl" not found');
    this.canvas = canvas;

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
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.classList.add('label-layer');
    document.body.appendChild(this.labelRenderer.domElement);


    this.scene.add(
      this.ambientLight,
      this.directionalLight,
      createSphere(),
      createAxes(),
      this.arrow.getGroup()
    );

    window.addEventListener('resize', this.onResize);
    this.tick();

    // TODO: REMOVE TESTING
    // this.arrow.setDirection(vec3(1, 0, 0));
    // console.log(formatComplex(mul(complex(0, 1), complex(0, 1))));
    // console.log(formatComplex(expi(Math.PI / 2)));
    // console.log(formatComplex(complex(0.5, -0.5)));
  }

  //////////////// *** Resize *** ////////////////
  private readonly onResize = (): void => {
    // Update sizes
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
  };

  //////////////// *** Animate *** ////////////////
  private readonly tick = (timestamp?: number): void => {
    // Timer
    this.timer.update(timestamp);
    const elapsedTime = this.timer.getElapsed();

    // Update controls
    this.controls.update();

    // Render
    this.renderer.render(this.scene, this.camera);

    // Labels
    this.labelRenderer.render(this.scene, this.camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(this.tick);
  };


}
