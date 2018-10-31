import { types } from "mobx-state-tree";

const SubAssembly = types.model("SubAssembly", {
  id: types.identifier,
  nickname: types.string,
  points: types.array(types.array(types.number))
});

export default SubAssembly;
