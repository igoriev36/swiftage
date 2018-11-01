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
    );
  }
}

export default compose(
  inject("project"),
  observer
)(BillOfMaterials);
