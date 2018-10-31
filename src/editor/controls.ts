import { Camera, OrbitControls } from "three";
import "three-orbit-controls";

export function addControls(camera: Camera, domElement: HTMLElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableZoom = true;
  controls.enableDamping = true;
  controls.minDistance = 4;
  controls.maxDistance = 200;
  controls.dampingFactor = 0.25;
  controls.rotateSpeed = 0.4;
  (controls as any).panSpeed = 0.2;
  controls.minPolarAngle = 0.1;
  controls.maxPolarAngle = Math.PI / 2 - 0.15;
  return controls;
}
