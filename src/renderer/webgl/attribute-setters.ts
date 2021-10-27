import { Dictionary } from "../../util";
import { AttributeData } from "./attribute-data";

export type AttributeSetterFunction = (value: AttributeData) => void;
export type AttributeSetters = Dictionary<AttributeSetterFunction>;

/**
 * Creates setter functions for all attributes of a shader
 * program.
 *
 * @param gl The WebGL Context.
 * @param program The program to create setters for.
 * @return An object with a setter for each attribute by name.
 */
export function createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram): AttributeSetters {
    const attribSetters: AttributeSetters = {};

    function createAttribSetter(index: number): AttributeSetterFunction {
        return function (b) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
            gl.enableVertexAttribArray(index);
            gl.vertexAttribPointer(index, b.numComponents, b.type, b.normalized || false, b.stride || 0, b.offset || 0);
        };
    }

    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; i++) {
        const attribInfo = gl.getActiveAttrib(program, i);
        if (!attribInfo) {
            break;
        }
        const index = gl.getAttribLocation(program, attribInfo.name);
        attribSetters[attribInfo.name] = createAttribSetter(index);
    }

    return attribSetters;
}