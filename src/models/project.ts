import { Instance, types } from "mobx-state-tree";
import Technology from "./technology";

const Project = types.model("Project", {
  name: types.string,
  technology: Technology
});

export type IProject = Instance<typeof Project>;

export function createProject(name) {
  const project = Project.create({
    name,
    technology: {
      id: "swift",
      gridSize: 300
    }
  });
  global["project"] = project;
  return project;
}
