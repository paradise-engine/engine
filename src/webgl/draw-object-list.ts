import { ProgramInfo } from "./program-info";
import { DrawObject } from "./draw-object";
import { BufferInfo } from "./buffer-info";
import { setAttributes } from "./set-attributes";
import { setUniforms } from "./set-uniforms";

/**
 * Draws a list of objects
 * 
 * @param gl A WebGLRenderingContext
 * @param objectsToDraw an array of objects to draw.
 */
export function drawObjectList(gl: WebGLRenderingContext, objectsToDraw: DrawObject[]) {
    let lastUsedProgramInfo: ProgramInfo | null = null;
    let lastUsedBufferInfo: BufferInfo | null = null;

    objectsToDraw.forEach(function (object) {
        const programInfo = object.programInfo;
        const bufferInfo = object.bufferInfo;
        let bindBuffers = false;

        if (programInfo !== lastUsedProgramInfo) {
            lastUsedProgramInfo = programInfo;
            gl.useProgram(programInfo.program);
            bindBuffers = true;
        }

        // Setup all the needed attributes.
        if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
            lastUsedBufferInfo = bufferInfo;
            setAttributes(gl, programInfo.attributeSetters, bufferInfo);
        }

        // Set the uniforms.
        setUniforms(programInfo.uniformSetters, object.uniformInfo);

        // Draw
        drawBufferInfo(gl, bufferInfo);
    });
}

/**
 * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
 *
 * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
 * but calling this means if you switch from indexed data to non-indexed
 * data you don't have to remember to update your draw call.
 *
 * @param gl A WebGLRenderingContext
 * @param bufferInfo BufferInfo
 * @param {enum} [primitiveType] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
 * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
 * @param {number} [offset] An optional offset. Defaults to 0.
 * @memberOf module:webgl-utils
 */
function drawBufferInfo(gl: WebGLRenderingContext, bufferInfo: BufferInfo) {
    const indices = bufferInfo.indices;
    const primitiveType = gl.TRIANGLES;
    const numElements = bufferInfo.numElements;
    const offset = 0;

    if (indices) {
        gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
    } else {
        gl.drawArrays(primitiveType, offset, numElements);
    }
}