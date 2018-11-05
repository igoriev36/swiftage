import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { BoxGeometry, Mesh, MeshNormalMaterial, Scene } from "three";
import { IProject } from "../../../models/project";

class Hanger extends React.Component<{ scene: Scene; project: IProject }> {
  mesh;

  constructor(props) {
    super(props);
    const size = (this.props.project.technology.gridSize / 100) * 3;
    const geometry = new BoxGeometry(size, size, size / 3);
    this.mesh = new Mesh(geometry, new MeshNormalMaterial());
    this.mesh.translateY(size / 2);
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
  inject("scene", "project"),
  observer
)(Hanger);
