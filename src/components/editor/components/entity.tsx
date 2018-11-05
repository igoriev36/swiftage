import { reaction } from "mobx";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import * as THREE from "three";
import { IEntity } from "../../../models/entity";
import { IProject } from "../../../models/project";
import { entityMaterial, invalidEntityMaterial } from "../materials";
import { setUpBarycentricCoordinates } from "../utils";

class Entity extends React.Component<{
  entity: IEntity;
  project: IProject;
  scene: any;
}> {
  mesh: THREE.Mesh;
  geometry: THREE.ExtrudeBufferGeometry;

  constructor(props) {
    super(props);
    this.draw = this.draw.bind(this);

    reaction(
      () => this.props.entity.xyz,
      ([x, y, z]) => {
        this.mesh.position.set(x, y, z);
        this.props.scene.render();
      }
    );

    reaction(
      () => this.props.entity.validPosition,
      valid => {
        if (valid) {
          this.mesh.material = entityMaterial;
        } else {
          this.mesh.material = invalidEntityMaterial;
        }
        this.props.scene.render();
      }
    );

    reaction(
      () => this.props.entity.subAssembly,
      xyz => {
        this.draw(true);
        this.props.scene.render();
      }
    );

    this.draw();
  }

  draw(remove = false) {
    // if (remove) {
    //   this.props.scene.remove(this.mesh)
    // }

    const shape = new THREE.Shape();
    this.props.entity.subAssembly.points
      .map(([x, y]) => [
        (x * this.props.project.technology.gridSize) / 100,
        (y * this.props.project.technology.gridSize) / 100
      ])
      .forEach(([x, y], index) => {
        if (index == 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
    const extrudeSettings = {
      depth: 12,
      bevelEnabled: false,
      steps: 1
    };
    this.geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);

    this.geometry.computeVertexNormals();
    setUpBarycentricCoordinates(this.geometry);

    // store buffergeometry in model instead, share when possible, only calculate it when required.
    const n = this.geometry.attributes.normal.array;
    const p = this.geometry.attributes.position.array;
    const c = this.geometry.attributes.center.array;

    const g = new THREE.BufferGeometry();
    g.addAttribute("normal", new THREE.BufferAttribute(n, 3));
    g.addAttribute("position", new THREE.BufferAttribute(p, 3));
    g.addAttribute("center", new THREE.BufferAttribute(c, 3));

    if (this.mesh) {
      this.mesh.geometry = g;
    } else {
      this.mesh = new THREE.Mesh(g, entityMaterial);
    }
  }

  componentDidMount() {
    this.props.scene.add(this.mesh);
  }

  componentWillUnmount() {
    this.props.scene.remove(this.mesh);
  }

  render() {
    return null;
  }
}

export default compose<{}, { entity: IEntity }>(
  inject("project", "scene"),
  observer
)(Entity);
