import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { Color, GridHelper, Scene } from "three";
import { IProject } from "../../../models/project";

const NUMBER_OF_GRIDS = 51;

class Grid extends React.Component<{ scene: Scene; project: IProject }> {
  mesh;

  constructor(props) {
    super(props);
    this.mesh = new GridHelper(
      (NUMBER_OF_GRIDS * this.props.project.technology.gridSize) / 100,
      NUMBER_OF_GRIDS,
      new Color(0xdddddd),
      new Color(0xdddddd)
    );
    this.mesh.position.x = this.props.project.technology.gridSize / 100 / 2;
    this.mesh.position.z = this.props.project.technology.gridSize / 100 / 2;
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
)(Grid);
