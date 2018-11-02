import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { IProject } from "../../models/project";

interface IProps {
  project: IProject;
}

class BillOfMaterials extends React.Component<IProps> {
  render() {
    const { project } = this.props;
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Technology</th>
              <td>{project.technology.id}</td>
            </tr>
            <tr>
              <th>Grid Size</th>
              <td>
                {project.technology.gridSize}
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
              <th>X</th>
              <th>Z</th>
              <td />
            </tr>
          </thead>
          <tbody>
            {project.entities.map(e => (
              <tr key={e.id}>
                <td>
                  <select
                    value={e.subAssembly.id}
                    onChange={evt => e.changeSubAssembly(evt.target.value)}
                  >
                    {project.technology.subAssemblies.map(subAssembly => (
                      <option key={subAssembly.id} value={subAssembly.id}>
                        {subAssembly.id}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{e.subAssembly.manufacturingTime}</td>
                <td>{e.subAssembly.assemblyTime}</td>
                <td>
                  <input
                    value={e.position.x}
                    onChange={evt =>
                      e.updatePosition("x", Number(evt.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    value={e.position.z}
                    onChange={evt =>
                      e.updatePosition("z", Number(evt.target.value))
                    }
                  />
                </td>
                <td>
                  <button onClick={() => project.removeEntity(e)}>x</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <td>{project.total("manufacturingTime")}</td>
              <td>{project.total("assemblyTime")}</td>
            </tr>
          </tfoot>
        </table>
        <button onClick={() => project.addEntity()}>Add Entity</button>
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
