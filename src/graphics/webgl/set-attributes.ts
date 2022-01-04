import { AttributeSetters, BufferInfo } from "../types";

/**
 * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
 *
 * @param gl The WebGL context.
 * @param setters Attribute setters as returned from `createAttributeSetters`.
 * @param data BufferInfo.
 */
export function setAttributes(gl: WebGLRenderingContext, setters: AttributeSetters, data: BufferInfo) {

    Object.keys(data.attribs).forEach(function (name) {
        const setter = setters[name];
        if (setter) {
            setter(data.attribs[name]);
        }
    });

    if (data.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.indices);
    }
}