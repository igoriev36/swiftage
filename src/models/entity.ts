import { Instance, types } from "mobx-state-tree";
import SubAssembly from "./sub_assembly";

const Vector = types.model({
  x: types.number,
  y: types.number,
  z: types.optional(types.number, 0)
});

const Entity = types.model("Entity", {
  id: types.identifier,
  subAssembly: types.reference(SubAssembly),
  position: Vector,
  normal: Vector
});

export type IEntity = Instance<typeof Entity>;

export default Entity;
