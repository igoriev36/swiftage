import { Provider } from "mobx-react";
import * as React from "react";
import { render } from "react-dom";
import BillOfMaterials from "./components/bill_of_materials";
import Editor from "./components/editor";
import ProjectInfo from "./components/project_info";
import { createProject } from "./models/project";

class App extends React.Component {
  render() {
    return (
      <Provider project={createProject("Untitled Project")}>
        <React.Fragment>
          <ProjectInfo />
          <Editor bgColor={0xeeeeee} />
          <BillOfMaterials />
        </React.Fragment>
      </Provider>
    );
  }
}

render(<App />, document.getElementById("app"));
