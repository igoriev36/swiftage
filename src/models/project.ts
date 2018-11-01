import { Instance, types } from "mobx-state-tree";
import Technology, { swift } from "./technology";

const Project = types.model("Project", {
  name: types.string,
  technology: Technology
});

export type IProject = Instance<typeof Project>;

export function createProject(name) {
  const project = Project.create({
    name,
    technology: swift
  });
  global["project"] = project;
  return project;
}
