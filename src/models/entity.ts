import { getRoot, Instance, types } from "mobx-state-tree";
import { IProject } from "./project";
import SubAssembly from "./sub_assembly";
import { ITechnology } from "./technology";

type xyz = "x" | "y" | "z";

const Vector = types.model({
  x: types.optional(types.number, 0),
  y: types.optional(types.number, 0),
  z: types.optional(types.number, 0)
});

const Entity = types
  .model("Entity", {
    id: types.identifier,
    subAssembly: types.reference(SubAssembly),
    position: types.optional(Vector, { x: 0, y: 0, z: 0 }),
    normal: types.optional(Vector, { x: 0, y: 0, z: 0 })
  })
  .views(self => ({
    get technology(): ITechnology {
      return (getRoot(self) as IProject).technology;
    },
    get xyz() {
      const {
        position,
        technology: { gridSize }
      } = self;
      return [
        (position.x * gridSize) / 100,
        (position.y * gridSize) / 100,
        (position.z * gridSize) / 100
      ];
    },
    get x() {
      return (self.position.x * self.technology.gridSize) / 100;
    },
    get y() {
      return (self.position.y * self.technology.gridSize) / 100;
    },
    get z() {
      return (self.position.z * self.technology.gridSize) / 100;
    }
  }))
  .actions(self => ({
    updatePosition(axis: xyz, val: number) {
      self.position[axis] = val;
    },
    // changeSubAssembly(subAssembly: ISubAssembly) {
    //   self.subAssembly = subAssembly;
    // }
    changeSubAssembly(subAssemblyId: string) {
      const subAssembly = self.technology.subAssemblies.find(
        s => s.id === subAssemblyId
      );
      self.subAssembly = subAssembly;
    }
  }));

export type IEntity = Instance<typeof Entity>;

export default Entity;
