import { RenderingContextError } from "../../errors";
import { UniformSetterFunction, UniformSetters } from "../types";
import { taggedMessage } from "./context-debug";
import { glEnumToString } from "./gl-enum-to-string";

/**
 * Creates setter functions for all uniforms of a shader
 * program.
 *
 * @param gl The WebGL Context.
 * @param program The program to create setters for.
 * @returns An object with a setter by name for each uniform.
 */
export function createUniformSetters(gl: WebGLRenderingContext, program: WebGLProgram, debug?: boolean): UniformSetters {
    let textureUnit = 0;

    /**
     * Creates a setter for a uniform of the given program with it's
     * location embedded in the setter.
     * @param program
     * @param uniformInfo
     * @returns The created setter.
     */
    function createUniformSetter(program: WebGLProgram, uniformInfo: WebGLActiveInfo): UniformSetterFunction {
        if (debug) {
            taggedMessage(gl, 'Getting Uniform Loc from Program', true, program);
        }
        const location = gl.getUniformLocation(program, uniformInfo.name);

        if (location === null) {
            throw new RenderingContextError(`Could not get location for uniform named ${uniformInfo.name} from WebGLProgram`);
        }

        const type = uniformInfo.type;

        // Check if this uniform is an array
        const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
        if (type === gl.FLOAT && isArray) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform1fv(location, v as Float32List);
            };
        }
        if (type === gl.FLOAT) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform1f(location, v as number);
            };
        }
        if (type === gl.FLOAT_VEC2) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform2fv(location, v as Float32List);
            };
        }
        if (type === gl.FLOAT_VEC3) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform3fv(location, v as Float32List);
            };
        }
        if (type === gl.FLOAT_VEC4) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform4fv(location, v as Float32List);
            };
        }
        if (type === gl.INT && isArray) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform1iv(location, v as Int32List);
            };
        }
        if (type === gl.INT) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform1i(location, v as number);
            };
        }
        if (type === gl.INT_VEC2) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform2iv(location, v as Int32List);
            };
        }
        if (type === gl.INT_VEC3) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform3iv(location, v as Int32List);
            };
        }
        if (type === gl.INT_VEC4) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform4iv(location, v as Int32List);
            };
        }
        if (type === gl.BOOL) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform1iv(location, v as Int32List);
            };
        }
        if (type === gl.BOOL_VEC2) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform2iv(location, v as Int32List);
            };
        }
        if (type === gl.BOOL_VEC3) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform3iv(location, v as Int32List);
            };
        }
        if (type === gl.BOOL_VEC4) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniform4iv(location, v as Int32List);
            };
        }
        if (type === gl.FLOAT_MAT2) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniformMatrix2fv(location, false, v as Float32List);
            };
        }
        if (type === gl.FLOAT_MAT3) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniformMatrix3fv(location, false, v as Float32List);
            };
        }
        if (type === gl.FLOAT_MAT4) {
            return function (v) {
                taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, v);
                gl.uniformMatrix4fv(location, false, v as Float32List);
            };
        }
        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
            const units = [];
            for (let i = 0; i < uniformInfo.size; i++) {
                units.push(textureUnit++);
            }
            return function (bindPoint, units): UniformSetterFunction {
                return function (textures) {
                    taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, textures);
                    gl.uniform1iv(location, units);
                    (textures as WebGLTexture[]).forEach(function (texture, index) {
                        gl.activeTexture(gl.TEXTURE0 + units[index]);
                        if (debug) {
                            taggedMessage(gl, 'Binding Texture', true, texture);
                        }
                        gl.bindTexture(bindPoint, texture);
                    });
                };
            }(getBindPointForSamplerType(gl, type), units);
        }
        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            return function (bindPoint, unit): UniformSetterFunction {
                return function (texture) {
                    taggedMessage(gl, 'Setting uniform ' + uniformInfo.name, false, texture);
                    gl.uniform1i(location, unit);
                    gl.activeTexture(gl.TEXTURE0 + unit);
                    if (debug) {
                        taggedMessage(gl, 'Binding Texture', true, texture);
                    }
                    gl.bindTexture(bindPoint, texture as WebGLTexture);
                };
            }(getBindPointForSamplerType(gl, type), textureUnit++);
        }

        throw new RenderingContextError(`Could not determine uniform setter for unknown type: ${glEnumToString(gl, type)}`);
    }

    const uniformSetters: UniformSetters = {};

    if (debug) {
        taggedMessage(gl, 'Getting Program Parameters', true, program);
    }
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < numUniforms; i++) {
        const uniformInfo = gl.getActiveUniform(program, i);
        if (!uniformInfo) {
            break;
        }
        let name = uniformInfo.name;
        // remove the array suffix.
        if (name.substr(-3) === '[0]') {
            name = name.substr(0, name.length - 3);
        }
        const setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
    }
    return uniformSetters;
}

/**
 * Returns the corresponding bind point for a given sampler type.
 */
function getBindPointForSamplerType(gl: WebGLRenderingContext, type: number) {
    if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;
    if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
    throw new RenderingContextError(`Could not get bind point for sampler type ${glEnumToString(gl, type)}`);
}