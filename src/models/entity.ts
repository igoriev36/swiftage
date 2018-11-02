import { Instance, types } from "mobx-state-tree";
import SubAssembly from "./sub_assembly";

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
  .actions(self => ({
    updatePosition(axis: xyz, val: number) {
      self.position[axis] = val;
    }
  }));

export type IEntity = Instance<typeof Entity>;

export default Entity;
