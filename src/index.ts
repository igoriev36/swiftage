import * as THREE from "three";
import Grid from "./models/grid";
import Project from "./models/project";
import Technology from "./models/technology";

function make({
  gridX = 300,
  gridY = 300,
  gridWidth = 16,
  gridHeight = 4,
  thickness = 336
} = {}) {
  const width = gridWidth * gridX;
  const height = gridHeight * gridY;

  const pts = [
    [0, 0],
    [width, 0],
    [width, height],
    [width - thickness, height],
    [width - thickness, thickness],
    [thickness, thickness],
    [thickness, height],
    [0, height]
  ];
  return pts.map(xy => [...xy]);
}

const swiftProject = Project.create({
  name: "Almere",
  technology: Technology.create({
    id: "swift",
    grids: [
      Grid.create({
        name: "minor",
        x: 300,
        z: 300
      }),
      Grid.create({
        name: "major",
        x: 1200,
        z: 1200
      })
    ]
  })
});

const scene = new THREE.Scene();
const container = document.getElementById("scene");
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 0);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer();

function handleResize(event = null) {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
handleResize();
window.addEventListener("resize", handleResize);

container.appendChild(renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
