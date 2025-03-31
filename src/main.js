import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class FerrisWheelSimulation {
  constructor() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    this.scene.fog = new THREE.Fog(0x87ceeb, 10, 50);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 50;
    this.controls.minDistance = 5;

    // Lighting
    this.setupLighting();

    // Wheel properties
    this.wheelRadius = 8;
    this.rotationSpeed = 0.002;
    this.currentRotation = 0;
    this.cabins = [];
    this.numCabins = 12;

    // Environment
    this.createEnvironment();
    this.createFerrisWheel();
    this.setupEventListeners();
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(15, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    // Soft fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);
  }

  createEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x32a852,
      roughness: 0.8,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createFerrisWheel() {
    // Wheel Structure
    const wheelGeometry = new THREE.TorusGeometry(
      this.wheelRadius,
      0.3,
      32,
      100
    );
    const wheelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff6b00,
      metalness: 0.7,
      roughness: 0.3,
      reflectivity: 0.5,
    });
    this.wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    this.wheel.rotation.x = Math.PI / 2;
    this.wheel.castShadow = true;
    this.scene.add(this.wheel);

    // Support Structures
    const supportMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2,
    });

    const createSupportBeam = (x, z) => {
      const beamGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 16);
      const beam = new THREE.Mesh(beamGeometry, supportMaterial);
      beam.position.set(x, -2.5, z);
      beam.rotation.x = Math.PI / 12;
      beam.castShadow = true;
      this.scene.add(beam);
    };

    createSupportBeam(-this.wheelRadius - 2, 2);
    createSupportBeam(this.wheelRadius + 2, 2);
    createSupportBeam(-this.wheelRadius - 2, -2);
    createSupportBeam(this.wheelRadius + 2, -2);

    // Cabins
    this.createCabins();
  }

  createCabins() {
    const cabinGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cabinMaterials = [
      new THREE.MeshPhysicalMaterial({
        color: 0xff4081,
        metalness: 0.3,
        roughness: 0.6,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x3f51b5,
        metalness: 0.3,
        roughness: 0.6,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x009688,
        metalness: 0.3,
        roughness: 0.6,
      }),
    ];

    for (let i = 0; i < this.numCabins; i++) {
      const cabin = new THREE.Mesh(
        cabinGeometry,
        cabinMaterials[i % cabinMaterials.length]
      );
      cabin.castShadow = true;
      this.cabins.push(cabin);
      this.scene.add(cabin);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Rotate wheel
    this.currentRotation += this.rotationSpeed;
    this.wheel.rotation.z = this.currentRotation;

    // Position cabins
    this.cabins.forEach((cabin, index) => {
      const angle =
        (index / this.numCabins) * Math.PI * 2 + this.currentRotation;
      cabin.position.x = Math.cos(angle) * this.wheelRadius;
      cabin.position.y = Math.sin(angle) * this.wheelRadius;
      cabin.position.z = 0;

      // Keep cabins upright
      cabin.rotation.z = -this.currentRotation;
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  setupEventListeners() {
    // Resize handler
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Optional: Speed control
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.rotationSpeed *= 1.1;
          break;
        case "ArrowDown":
          this.rotationSpeed *= 0.9;
          break;
      }
    });
  }

  start() {
    this.animate();
  }
}

// Initialize and start the simulation
const ferrisWheel = new FerrisWheelSimulation();
ferrisWheel.start();
