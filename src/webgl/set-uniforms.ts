import { Dictionary } from "..";
import { UniformSetters, UniformData } from "./uniform-setters";

/**
 * Set uniforms and binds related textures.
 *
 * Example:
 *
 *     let programInfo = createProgramFromSource(gl, vsSource, fsSource);
 *
 *     let tex1 = gl.createTexture();
 *     let tex2 = gl.createTexture();
 *
 *     ... assume we setup the textures with data ...
 *
 *     let uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *       u_someColor: [1,0,0,1],
 *       u_somePosition: [0,1,1],
 *       u_someMatrix: [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ],
 *     };
 *
 *     gl.useProgram(program);
 *
 * This will automatically bind the textures AND set the
 * uniforms.
 *
 *     setUniforms(programInfo.uniformSetters, uniforms);
 *
 * For the example above it is equivalent to
 *
 *     let texUnit = 0;
 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
 *     gl.bindTexture(gl.TEXTURE_2D, tex1);
 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
 *     gl.bindTexture(gl.TEXTURE_2D, tex2);
 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
 *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
 *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
 *     gl.uniformMatrix4fv(u_someMatrix, false, [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ]);
 *
 * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
 *
 *     let uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *     };
 *
 *     let moreUniforms {
 *       u_someColor: [1,0,0,1],
 *       u_somePosition: [0,1,1],
 *       u_someMatrix: [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ],
 *     };
 *
 *     setUniforms(programInfo.uniformSetters, uniforms);
 *     setUniforms(programInfo.uniformSetters, moreUniforms);
 *
 * @param setters the setters returned from `createUniformSetters`.
 * @param uniformDicts objects with values for the uniforms.
 */
export function setUniforms(setters: UniformSetters, ...uniformDicts: Dictionary<UniformData>[]) {
    for (const uniformValues of uniformDicts) {
        if (uniformValues) {
            for (const name of Object.keys(uniformValues)) {
                if (uniformValues.hasOwnProperty(name)) {
                    const setter = setters[name];
                    if (setter) {
                        setter(uniformValues[name]);
                    }
                }
            }
        }

    }
}