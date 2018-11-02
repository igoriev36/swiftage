import { reaction } from "mobx";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import * as THREE from "three";
import { IEntity } from "../../models/entity";

class Entity extends React.Component<{ scene: THREE.Scene; entity: IEntity }> {
  mesh;

  constructor(props) {
    super(props);
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ color: "yellow" })
    );

    reaction(
      () => this.props.entity.position.x,
      x => {
        this.mesh.position.x = x;
        console.log("updated position");
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
