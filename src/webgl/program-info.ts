import { Dictionary } from "../util";
import { AttributeSetters } from "./attribute-setters";
import { BufferInfo } from "./buffer-info";
import { UniformData, UniformSetters } from "./uniform-setters";

export interface ProgramInfo {
    program: WebGLProgram;
    uniformSetters: UniformSetters;
    attributeSetters: AttributeSetters;
    uniformInfo: Dictionary<UniformData>;
    bufferInfo: BufferInfo;
}
