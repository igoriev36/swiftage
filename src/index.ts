import { fromEvent, merge } from "rxjs";
import { debounceTime, share, startWith, throttleTime } from "rxjs/operators";
import * as THREE from "three";
import { addControls } from "./editor/controls";

const pressedKeys = new Set();

const GRID_SIZE = 3;
const NUMBER_OF_GRIDS = 41;

const objects = [];

const meshMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: "pink"
});

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

const shape = new THREE.Shape();
make()
  .map(([x, y]) => [x / 100, y / 100])
  .forEach(([x, y], index) => {
    if (index == 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });

const extrudeSettings = {
  depth: GRID_SIZE * 4,
  bevelEnabled: false,
  steps: 1
};
const sgeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

// setup 3D scene

const scene = new THREE.Scene();
const container = document.getElementById("scene");
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(-30, 100, -70);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xeeeeee);
renderer.shadowMap.enabled = true;

// setup handlers

function handleResize(event = null) {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

const resize$ = fromEvent(window, "resize").pipe(
  debounceTime(50),
  share()
);
resize$.subscribe(handleResize);
handleResize();

var grid = new THREE.GridHelper(
  NUMBER_OF_GRIDS * GRID_SIZE,
  NUMBER_OF_GRIDS,
  new THREE.Color(0xdddddd),
  new THREE.Color(0xdddddd)
);
grid.position.x = -1.5;
grid.position.z = -1.5;
scene.add(grid);

var geometry = new THREE.PlaneBufferGeometry(
  NUMBER_OF_GRIDS * GRID_SIZE,
  NUMBER_OF_GRIDS * GRID_SIZE
);
geometry.rotateX(-Math.PI / 2);
const plane = new THREE.Mesh(
  geometry,
  new THREE.ShadowMaterial({ opacity: 1 })
);
plane.receiveShadow = true;
objects.push(plane);
scene.add(plane);

var mouse2D = { x: 0, y: 0 };
var vector = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
let intersects = [];

scene.add(new THREE.AmbientLight(0xffffff, 0.1));

var light = new THREE.SpotLight(0xffffff, 0.5);
light.position.set(30, 100, -10);
light.lookAt(0, 0, 0);
scene.add(light);

var cubeGeo = new THREE.BoxBufferGeometry(48, 12, 12);
var cubeMat = new THREE.MeshLambertMaterial({
  color: 0xebcaa7
});

function render() {
  requestAnimationFrame(animate);
}

function animate() {
  renderer.render(scene, camera);
}

var rollOverMesh = new THREE.Mesh(
  cubeGeo,
  new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.3,
    transparent: true
  })
);
scene.add(rollOverMesh);

let pos = new THREE.Vector3();

container.appendChild(renderer.domElement);

function handleMouseMove(event) {
  mouse2D.x = (event.clientX / container.clientWidth) * 2 - 1;
  mouse2D.y = -(event.clientY / container.clientHeight) * 2 + 1;
  vector.set(mouse2D.x, mouse2D.y, camera.near);

  raycaster.setFromCamera(mouse2D, camera);
  intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    pos
      .copy(intersects[0].point)
      .add(intersects[0].face.normal)
      .divideScalar(12)
      .floor()
      .multiplyScalar(12)
      .addScalar(6);

    rollOverMesh.position.copy(pos);
  }
}

function handleClick(event) {
  if (pressedKeys.has("Shift") && intersects.length > 0) {
    const cube = new THREE.Mesh(sgeo, cubeMat);
    cube.receiveShadow = true;
    cube.castShadow = true;
    const s = new THREE.Box3().setFromObject(cube);
    const container = new THREE.Object3D();
    const box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(
        s.max.x - s.min.x,
        s.max.y - s.min.y,
        s.max.z - s.min.z
      ),
      meshMaterial
    );
    container.add(cube);
    container.add(box);
    cube.position.x -= (s.max.x - s.min.x) / 2;
    cube.position.z -= (s.max.z - s.min.z) / 2;
    cube.position.y -= (s.max.y - s.min.y) / 2;
    container.position.copy(pos);
    // s.position.copy(pos);
    scene.add(container);
    // scene.add(cube);
    objects.push(box);
    setTimeout(() => {
      handleMouseMove(event);
    }, 50);
  }
}

function handleKeyDown(e) {
  pressedKeys.add(e.key);
  controls.enabled = !pressedKeys.has("Shift");
}

function handleKeyUp(e) {
  pressedKeys.delete(e.key);
  controls.enabled = !pressedKeys.has("Shift");
}

const keyDown$ = fromEvent(window, "keydown").pipe(share());
keyDown$.subscribe(handleKeyDown);

const keyUp$ = fromEvent(window, "keyup").pipe(share());
keyUp$.subscribe(handleKeyUp);

const wheel$ = fromEvent(renderer.domElement, "wheel");

const click$ = fromEvent(renderer.domElement, "click").pipe(share());
click$.subscribe(handleClick);

const mouseMove$ = fromEvent(renderer.domElement, "mousemove").pipe(
  throttleTime(10),
  share()
);
mouseMove$.subscribe(handleMouseMove);

merge(keyUp$, keyDown$)
  .pipe(startWith(null))
  .subscribe(() => (rollOverMesh.visible = pressedKeys.has("Shift")));

merge(mouseMove$, wheel$, keyUp$, keyDown$, click$, resize$)
  .pipe(
    startWith(null),
    throttleTime(10)
  )
  .subscribe(render);

const controls = addControls(camera, renderer.domElement);
