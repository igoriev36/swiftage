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
              <th>SubAssembly</th>
              <th>Manufacturing Time</th>
              <th>Assembly Time</th>
              <td />
            </tr>
          </thead>
          <tbody>
            {this.props.project.entities.map(e => (
              <tr key={e.id}>
                <td>{e.subAssembly.id}</td>
                <td>{e.subAssembly.manufacturingTime}</td>
                <td>{e.subAssembly.assemblyTime}</td>
                <td>
                  <button onClick={() => this.props.project.removeEntity(e)}>
                    x
                  </button>
                </td>
              </tr>
            ))}
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
