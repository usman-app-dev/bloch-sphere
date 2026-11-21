import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

export class BlochScene {

  private readonly sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly textureLoader: THREE.TextureLoader;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly ambientLight: THREE.AmbientLight;
  private readonly timer = new THREE.Timer();


  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
    if (!canvas) throw new Error('Canvas "canvas.webgl" not found');
    this.canvas = canvas;

    this.scene = new THREE.Scene()
    this.textureLoader = new THREE.TextureLoader();

    //////////////// *** Lights *** ////////////////
    this.ambientLight = new THREE.AmbientLight('#86cdff', 0.275)

    //////////////// *** Cameras *** ////////////////
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100);
    this.camera.position.set(4, 2, 5)

    //////////////// *** Controls *** ////////////////
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;

    //////////////// *** Renderer *** ////////////////
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    this.scene.add(this.ambientLight);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    );
    this.scene.add(sphere);

    window.addEventListener('resize', this.onResize);
    this.tick();
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

    // Call tick again on the next frame
    window.requestAnimationFrame(this.tick);
  };


}
