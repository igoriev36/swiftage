import * as THREE from "three";

// export const entityMaterial = new THREE.MeshBasicMaterial({ color: "yellow" });

export const normalMaterial = new THREE.MeshNormalMaterial();

const vertexShader = `
attribute vec3 center;
varying vec3 vCenter;

void main() {
  vCenter = center;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
varying vec3 vCenter;

float edgeFactorTri() {
  vec3 d = fwidth(vCenter.xyz);
  vec3 a3 = smoothstep(vec3(0.0), d * 1.5, vCenter.xyz);
  return min(min(a3.x, a3.y), a3.z);
}

void main() {
  // green outline, white face
  // gl_FragColor.rgb = mix(vec3(0.0, 1.0, 0.0), vec3(1.0), edgeFactorTri());

  // black outline, white face
  gl_FragColor.rgb = mix(vec3(0.0), vec3(1.0), edgeFactorTri());

  gl_FragColor.a = 1.0;
}`;

const invalidFragmentShader = `
varying vec3 vCenter;

float edgeFactorTri() {
  vec3 d = fwidth(vCenter.xyz);
  vec3 a3 = smoothstep(vec3(0.0), d * 1.5, vCenter.xyz);
  return min(min(a3.x, a3.y), a3.z);
}

void main() {
  gl_FragColor.rgb = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 0.8, 0.999), edgeFactorTri());

  gl_FragColor.a = 1.0;
}`;

export const invalidEntityMaterial = new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader,
  fragmentShader: invalidFragmentShader
});
invalidEntityMaterial.extensions.derivatives = true;

export const entityMaterial = new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader,
  fragmentShader
});
entityMaterial.extensions.derivatives = true;
