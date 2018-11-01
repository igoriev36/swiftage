import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { IProject } from "../models/project";

interface IProps {
  project: IProject;
}

class ProjectInfo extends React.Component<IProps> {
  render() {
    return <h1>{this.props.project.name}</h1>;
  }
}

export default compose(
  inject("project"),
  observer
)(ProjectInfo);
