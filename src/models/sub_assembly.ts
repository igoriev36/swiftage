import { Instance, types } from "mobx-state-tree";

const SubAssembly = types
  .model("SubAssembly", {
    id: types.identifier,
    points: types.array(types.array(types.number))
  })
  .views(self => ({
    get assemblyTime() {
      return 0.5;
    },
    get manufacturingTime() {
      return 1.5;
    }
  }));

export type ISubAssembly = Instance<typeof SubAssembly>;

export default SubAssembly;
