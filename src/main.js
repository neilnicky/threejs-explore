import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 1;

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(55, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 10);
pointLight.position.set(0, 3, 2);
scene.add(pointLight);

// Pencil Body (Hexagonal Prism)
const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 6);
const bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffcc33,
  roughness: 0.3,
  metalness: 0.4,
  clearcoat: 0.5,
  clearcoatRoughness: 0.1,
});
const pencilBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
pencilBody.castShadow = true;
scene.add(pencilBody);

// Pencil Tip (Cone)
const tipGeometry = new THREE.ConeGeometry(0.2, 0.5, 20);
const tipMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x5a3d1c,
  roughness: 0.8,
  metalness: 0.2,
});
const pencilTip = new THREE.Mesh(tipGeometry, tipMaterial);

// Correct the position
pencilTip.position.y = -1.74; // Move slightly upward to connect properly

// Correct rotation (in radians)
pencilTip.rotation.x = Math.PI; // Flips the cone upside down correctly

pencilTip.castShadow = true;
scene.add(pencilTip);

// Eraser (Cylinder)
const eraserGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.3, 20);
const eraserMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff4d4d,
  roughness: 0.6,
  metalness: 0.2,
  clearcoat: 0.6,
});
const eraser = new THREE.Mesh(eraserGeometry, eraserMaterial);
eraser.position.y = 1.75;
eraser.castShadow = true;
scene.add(eraser);

// Metallic Holder (Thin Cylinder)
const holderGeometry = new THREE.CylinderGeometry(0.23, 0.23, 0.2, 20);
const holderMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xb0b0b0,
  roughness: 0.2,
  metalness: 1.0,
});
const holder = new THREE.Mesh(holderGeometry, holderMaterial);
holder.position.y = 1.55;
holder.castShadow = true;
scene.add(holder);

// Ground Plane
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.4 });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
