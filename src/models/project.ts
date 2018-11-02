import { Instance, types } from "mobx-state-tree";
import Entity from "./entity";
import Technology, { swift } from "./technology";

const Project = types
  .model("Project", {
    name: types.string,
    technology: Technology,
    entities: types.array(Entity)
  })
  .volatile(self => ({
    tool: "ORBIT"
  }))
  .actions(self => ({
    setTool(toolName: string) {
      self.tool = toolName;
    },
    removeEntity(entity) {
      self.entities = self.entities.filter(e => e !== entity);
    },
    addEntity() {
      self.entities.push(
        Entity.create({
          id: Math.random().toString(),
          subAssembly: swift.subAssemblies[0]
        })
      );
    }
  }));

export type IProject = Instance<typeof Project>;

export function createProject(name) {
  const project = Project.create({
    name,
    technology: swift,
    entities: [
      Entity.create({
        id: "first",
        subAssembly: swift.subAssemblies[0],
        normal: { x: 0, y: 0, z: 1 }
      })
    ]
  });
  global["project"] = project;
  return project;
}
