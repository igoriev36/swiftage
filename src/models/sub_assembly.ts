import { types } from "mobx-state-tree";

const SubAssembly = types.model("SubAssembly", {
  id: types.identifier
});

export default SubAssembly;
