import { getRoot, onSnapshot, types } from "mobx-state-tree";
import { fromEvent, merge } from "rxjs";
import { debounceTime, share, startWith, throttleTime } from "rxjs/operators";
import * as THREE from "three";
import { addControls } from "./editor/controls";

const GRID_SIZE = 3;
const NUMBER_OF_GRIDS = 71;

const pressedKeys = new Set();
const objects = [];

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
scene.add(
  new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(),
    40,
    0xff0000,
    5,
    3
  )
);
const container = document.getElementById("scene");
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(-30, 100, 70);
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
grid.position.x = -GRID_SIZE / 2;
grid.position.z = -GRID_SIZE / 2;
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
let xyz = [0, 0, 0];

container.appendChild(renderer.domElement);

function handleMouseMove(event) {
  mouse2D.x = (event.clientX / container.clientWidth) * 2 - 1;
  mouse2D.y = -(event.clientY / container.clientHeight) * 2 + 1;
  vector.set(mouse2D.x, mouse2D.y, camera.near);

  raycaster.setFromCamera(mouse2D, camera);

  if (pressedKeys.has("Shift")) {
    intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
      const { x, z } = pos
        .copy(intersects[0].point)
        .divideScalar(GRID_SIZE)
        .floor();
      xyz = [x, 0, z + 1];
      console.log(xyz);

      pos
        .copy(intersects[0].point)
        .add(intersects[0].face.normal)
        .divideScalar(12)
        .floor()
        .multiplyScalar(12)
        .addScalar(6);

      rollOverMesh.position.copy(pos);
    }
  } else if (pressedKeys.has("Alt")) {
    intersects = raycaster.intersectObjects(objects.slice(1));
    if (intersects.length > 0) {
      console.log(intersects[0]);
    }
  } else {
    intersects = [];
  }
}

function handleClick(event) {
  if (pressedKeys.has("Shift") && intersects.length > 0) {
    // const cube = new THREE.Mesh(sgeo, cubeMat);
    // cube.receiveShadow = true;
    // cube.castShadow = true;
    // const s = new THREE.Box3().setFromObject(cube);
    // const container = new THREE.Object3D();
    // const box = new THREE.Mesh(
    //   new THREE.BoxBufferGeometry(
    //     s.max.x - s.min.x,
    //     s.max.y - s.min.y,
    //     s.max.z - s.min.z
    //   ),
    //   meshMaterial
    // );
    // container.add(cube);
    // container.add(box);
    // cube.position.x -= (s.max.x - s.min.x) / 2;
    // cube.position.z -= (s.max.z - s.min.z) / 2;
    // cube.position.y -= (s.max.y - s.min.y) / 2;
    // container.position.copy(pos);
    // // s.position.copy(pos);
    // scene.add(container);
    // // scene.add(cube);
    // objects.push(box);
    // setTimeout(() => {
    //   handleMouseMove(event);
    // }, 50);
    window.s.addSubAssembly(...xyz);
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

merge(keyUp$, keyDown$)
  .pipe(startWith(null))
  .subscribe(() => {
    console.log(pressedKeys);
    rollOverMesh.visible = pressedKeys.has("Shift");
  });

const wheel$ = fromEvent(renderer.domElement, "wheel");

const click$ = fromEvent(renderer.domElement, "click").pipe(share());
click$.subscribe(handleClick);

const mouseMove$ = fromEvent(renderer.domElement, "mousemove").pipe(
  throttleTime(10),
  share()
);
mouseMove$.subscribe(handleMouseMove);

merge(mouseMove$, wheel$, keyUp$, keyDown$, click$, resize$)
  .pipe(
    startWith(null),
    throttleTime(10)
  )
  .subscribe(render);

const controls = addControls(camera, renderer.domElement);

// mobx-state-tree ------------------------------------------

const SubAssembly = types
  .model("SubAssembly", {
    id: types.identifier,
    x: types.number,
    y: types.number,
    z: types.number
  })
  .views(self => ({
    get isTouchingGround() {
      return self.y === 0;
    },
    isOverlapping(other) {
      return self.bbox.intersectsBox(other.bbox);
    },
    get scene() {
      return getRoot(self);
    }
  }))
  .volatile(self => ({
    get box() {
      const [width, height, depth] = [
        GRID_SIZE * 16,
        GRID_SIZE * 4,
        GRID_SIZE * 4
      ];
      const geom = new THREE.BoxBufferGeometry(width, height, depth);
      geom.translate(width / 2, height / 2, -depth / 2);
      const mesh = new THREE.Mesh(
        geom,
        new THREE.MeshBasicMaterial({ color: "pink" })
      );
      mesh.position.set(
        self.x * GRID_SIZE,
        self.y * GRID_SIZE,
        self.z * GRID_SIZE
      );
      return mesh;
    },
    get bbox() {
      return new THREE.Box3().setFromObject(self.box);
    }
  }))
  .actions(self => ({
    afterAttach() {
      scene.add(self.box);
    },
    beforeDestroy() {
      scene.remove(self.box);
    }
  }));

const Scene = types
  .model("Scene", {
    gridSize: types.optional(types.number, GRID_SIZE),
    subAssemblies: types.array(SubAssembly)
  })
  .volatile(self => ({
    get scene() {
      return scene;
    }
  }))
  .views(self => ({
    canPlace(subAssembly) {
      return true;
      // if (self.subAssemblies.some(s => s.isOverlapping(subAssembly))) {
      //   return false;
      // } else {
      //   if (subAssembly.isTouchingGround) {
      //     return true;
      //     // if (isOverlapping) {
      //     //   return false
      //     // } else {
      //     //   return true
      //     // }
      //   } else {
      //     return false;
      //     // const isHovering =

      //     // if (!isHovering) {
      //     //   return true
      //     // } else {
      //     //   return false
      //     // }
      //   }
      // }
    }
  }))
  .actions(self => ({
    afterCreate() {
      console.log("created scene");
      onSnapshot(self, snapshot => {
        localStorage.setItem("scene", JSON.stringify(snapshot));
      });
    },
    addSubAssembly(x, y, z) {
      const sub = SubAssembly.create({
        id: Math.random().toString(),
        x,
        y,
        z
      });

      if (self.canPlace(sub)) {
        self.subAssemblies.push(sub);
      }
    },
    removeSubAssemblies() {
      while (self.subAssemblies.length > 0) {
        self.subAssemblies.remove(self.subAssemblies[0]);
      }
    }
  }));

const s = Scene.create(JSON.parse(localStorage.getItem("scene") || "{}"));
window["s"] = s;
s.addSubAssembly(-8, 0, 2);
s.addSubAssembly(-8, 4, 2);
// s.addSubAssembly(5, 0, 10);
// s.addSubAssembly(3, 0, 0);
// s.addSubAssembly(10, 0, 0);
// s.addSubAssembly(20, 0, 0);

// setTimeout(() => {
//   s.removeSubAssemblies();
// }, 400);
