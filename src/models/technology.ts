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
      points: [
        [0, 0],
        [16, 0],
        [16, 4],
        [15, 4],
        [15, 1],
        [1, 1],
        [1, 4],
        [0, 4]
      ]
    },
    {
      id: "h",
      points: [
        [0, 0],
        [1, 0],
        [1, 7],
        [15, 7],
        [15, 0],
        [16, 0],
        [16, 10],
        [15, 10],
        [15, 8],
        [1, 8],
        [1, 10],
        [0, 10]
      ]
    }
  ]
});
export type ITechnology = Instance<typeof Technology>;

export default Technology;
