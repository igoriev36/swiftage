import { types } from "mobx-state-tree";
import Grid from "./grid";
// import SubAssembly from "./sub_assembly";

const Technology = types.model("Technology", {
  id: types.identifier,
  grids: types.array(Grid)
  // subAssemblies: types.maybe(types.map(SubAssembly))
});

export default Technology;
