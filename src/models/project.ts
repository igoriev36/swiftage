import { Instance, types } from "mobx-state-tree";
import { UndoManager } from "mst-middlewares";
import Entity from "./entity";
import Technology, { swift } from "./technology";

const adder = (acc, curr) => acc + curr;

export let undoManager = {} as any;
export const setUndoManager = targetStore => {
  undoManager = targetStore.history;
};

const Project = types
  .model("Project", {
    name: types.string,
    technology: Technology,
    entities: types.array(Entity),
    history: types.optional(UndoManager, {})
  })
  .views(self => ({
    total(key: string): number {
      return self.entities.map(e => e.subAssembly[key]).reduce(adder);
    }
  }))
  .volatile(self => ({
    tool: "ORBIT"
  }))
  .actions(self => {
    setUndoManager(self);
    return {
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
    };
  });

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
