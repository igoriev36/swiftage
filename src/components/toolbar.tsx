import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { IProject, undoManager } from "../models/project";

class Toolbar extends React.Component<{ project: IProject }> {
  render() {
    const { project } = this.props;
    return (
      <div>
        <select
          value={project.tool}
          onChange={e => project.setTool(e.target.value)}
        >
          <option value="EXTRUDE">Extrude</option>
          <option value="ORBIT">Orbit</option>
        </select>
        <button
          disabled={!undoManager.canUndo}
          onClick={() => undoManager.undo()}
        >
          UNDO
        </button>
        <button
          disabled={!undoManager.canRedo}
          onClick={() => undoManager.redo()}
        >
          REDO
        </button>
      </div>
    );
  }
}

export default compose(
  inject("project"),
  observer
)(Toolbar);
