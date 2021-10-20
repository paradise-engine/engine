import { Dictionary } from "../util";
import { BufferInfo } from "./buffer-info";
import { ProgramInfo } from "./program-info";
import { UniformData } from "./uniform-setters";

export interface DrawObject {
    programInfo: ProgramInfo;
    uniformInfo: Dictionary<UniformData>;
    bufferInfo: BufferInfo;
}