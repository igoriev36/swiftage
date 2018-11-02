import { reaction } from "mobx";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import * as THREE from "three";
import { IEntity } from "../../models/entity";
import { IProject } from "../../models/project";
import { entityMaterial, invalidEntityMaterial } from "./materials";
import { setUpBarycentricCoordinates } from "./utils";

class Entity extends React.Component<{
  scene: any;
  project: IProject;
  entity: IEntity;
}> {
  mesh: THREE.Mesh;
  geometry;

  constructor(props) {
    super(props);
    this.draw = this.draw.bind(this);

    reaction(
      () => this.props.entity.xyz,
      xyz => {
        this.mesh.position.set(...xyz);
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
    if (this.mesh) {
      this.mesh.geometry = this.geometry;
    } else {
      this.mesh = new THREE.Mesh(this.geometry, entityMaterial);
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

export default compose(
  inject("project", "scene"),
  observer
)(Entity);
