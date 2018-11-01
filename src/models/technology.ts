import { types } from "mobx-state-tree";

const Technology = types.model("Technology", {
  id: types.identifier,
  gridSize: types.number
});

export default Technology;
