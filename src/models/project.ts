import { types } from "mobx-state-tree";
import Technology from "./technology";

const Project = types.model("Project", {
  name: types.string,
  technology: Technology
});

export default Project;
