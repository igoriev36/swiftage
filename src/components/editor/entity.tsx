import { reaction } from "mobx";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import * as THREE from "three";
import { IEntity } from "../../models/entity";
import { entityMaterial as material } from "./materials";

class Entity extends React.Component<{ scene: any; entity: IEntity }> {
  mesh;

  constructor(props) {
    super(props);
    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(6, 6, 6), material);

    reaction(
      () => this.props.entity.xyz,
      xyz => {
        this.mesh.position.set(...xyz);
        this.props.scene.render();
      }
    );
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
  inject("scene"),
  observer
)(Entity);
