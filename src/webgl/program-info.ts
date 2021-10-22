import { Dictionary } from "../util";
import { BufferInfo } from "./buffer-info";
import { Shader } from "./shader";
import { UniformData } from "./uniform-setters";

export interface ProgramInfo {
    shader: Shader;
    uniformInfo: Dictionary<UniformData>;
    bufferInfo: BufferInfo;
}
