import { Instance, types } from "mobx-state-tree";
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
    },
    {
      id: "h",
      points: [[0, 0], [3, 0], [3, 2], [0, 2]]
    }
  ]
});
export type ITechnology = Instance<typeof Technology>;

export default Technology;
