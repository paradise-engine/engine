import { Dictionary } from "../../util";
import { UniformData } from "./uniform-data";

export type UniformSetterFunction = (value: UniformData) => void;
export type UniformSetters = Dictionary<UniformSetterFunction>;