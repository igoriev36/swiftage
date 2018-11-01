import { Instance, types } from "mobx-state-tree";

const Project = types.model("Project", {
  name: types.string
});

export type IProject = Instance<typeof Project>;

export default Project;
