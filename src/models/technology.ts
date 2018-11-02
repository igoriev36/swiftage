import { types } from "mobx-state-tree";
import SubAssembly from "./sub_assembly";

const Technology = types.model("Technology", {
  id: types.identifier,
  gridSize: types.number,
  subAssemblies: types.array(SubAssembly)
});

export const swift = Technology.create({
  id: "swift",
  gridSize: 300,
  subAssemblies: [
    {
      id: "u",
      points: [[0, 0], [3, 0], [3, 3], [0, 3]]
    }
  ]
});

export default Technology;
