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
      id: "u"
    }
  ]
});

export default Technology;
