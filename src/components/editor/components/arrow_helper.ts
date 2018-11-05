import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { ArrowHelper as ThreeArrowHelper, Scene, Vector3 } from "three";
import { IProject } from "../../../models/project";

class ArrowHelper extends React.Component<{ scene: Scene; project: IProject }> {
  mesh;

  constructor(props) {
    super(props);
    this.mesh = new ThreeArrowHelper(
      new Vector3(0, 1, 0),
      new Vector3(),
      40,
      0xff0000,
      5,
      3
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
  inject("scene", "project"),
  observer
)(ArrowHelper);
