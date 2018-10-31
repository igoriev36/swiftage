import { types } from "mobx-state-tree";

const Grid = types.model({
  name: types.string,
  x: types.number,
  y: types.maybe(types.number),
  z: types.number
});

export default Grid;
