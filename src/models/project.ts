import { Instance, types } from "mobx-state-tree";

const Project = types.model("Project", {
  name: types.string,
  gridSize: types.number
});

export type IProject = Instance<typeof Project>;

export function createProject(name) {
  return Project.create({ name, gridSize: 300 });
}
