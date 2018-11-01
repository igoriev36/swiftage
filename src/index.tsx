import { Provider } from "mobx-react";
import * as React from "react";
import { render } from "react-dom";
import ProjectInfo from "./components/project_info";
import Project from "./models/project";

class App extends React.Component {
  render() {
    const project = Project.create({ name: "Untitled Project" });
    return (
      <Provider project={project}>
        <ProjectInfo />
      </Provider>
    );
  }
}

render(<App />, document.getElementById("app"));
