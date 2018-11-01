import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { IProject } from "../../models/project";

interface IProps {
  project: IProject;
}

class BillOfMaterials extends React.Component<IProps> {
  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Technology</th>
              <td>{this.props.project.technology.id}</td>
            </tr>
            <tr>
              <th>Grid Size</th>
              <td>
                {this.props.project.technology.gridSize}
                mm
              </td>
            </tr>
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Specification</th>
              <th>Quantity</th>
              <th>Unit</th>
            </tr>
          </thead>
        </table>
      </div>
    );
  }
}

export default compose(
  inject("project"),
  observer
)(BillOfMaterials);
