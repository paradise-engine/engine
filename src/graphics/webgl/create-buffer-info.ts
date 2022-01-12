import { RenderingContextError } from "../../errors";
import { Dictionary } from "../../util";
import { glEnumToString } from "./gl-enum-to-string";
import { AttributeData, BufferInfo, BufferInput, BufferInputData, TypedArray } from "../types";
import { registerContextObject, taggedMessage } from "./context-debug";

/**
 * Creates a BufferInfo from an object of arrays.
 *
 * @param gl A WebGLRenderingContext
 * @param arrays Your data
 * @return A BufferInfo
 */
export function createBufferInfo(gl: WebGLRenderingContext, input: BufferInput, indices?: number[], debug?: boolean): BufferInfo {

    const attribs: Dictionary<AttributeData> = createAttribs(gl, input, debug);

    if (indices) {
        const typedIndices = makeTypedArrayForIndices(indices);
        return {
            attribs,
            numElements: typedIndices.length,
            indices: { buffer: createBufferFromTypedArray(gl, typedIndices, gl.ELEMENT_ARRAY_BUFFER, undefined, debug) }
        }
    }

    return {
        attribs,
        numElements: getNumElementsFromNonIndexedArrays(input)
    }
}

/**
 * tries to get the number of elements from a set of arrays.
 */
const positionKeys = ['position', 'positions', 'a_position', 'a_positions'];
function getNumElementsFromNonIndexedArrays(input: BufferInput) {
    let key;
    for (const k of positionKeys) {
        if (k in input) {
            key = k;
            break;
        }
    }
    key = key || Object.keys(input)[0];
    const item = input[key];
    const length = item.data.length;
    const numComponents = item.numComponents;
    const numElements = length / numComponents;

    if (length % numComponents > 0) {
        throw new RenderingContextError(`Invalid attribute dimensions: numComponents ${numComponents} not correct for length ${length}`);
    }

    return numElements;
}

/**
 * Creates a set of attribute data and WebGLBuffers from set of input arrays
 *
 * @param gl The webgl rendering context.
 * @param input The input data.
 * @return the attribs
 */
function createAttribs(gl: WebGLRenderingContext, input: BufferInput, debug?: boolean): Dictionary<AttributeData> {

    const attribs: Dictionary<AttributeData> = {};

    Object.keys(input).forEach(function (attribName) {

        if (input.hasOwnProperty(attribName)) {
            const item = input[attribName];
            const array = makeTypedArray(item);

            attribs[attribName] = {
                buffer: { buffer: createBufferFromTypedArray(gl, array, undefined, undefined, debug) },
                numComponents: item.numComponents,
                type: getGLTypeForTypedArray(gl, array),
                normalized: getNormalizationForTypedArray(array),
            };
        }

    });

    return attribs;
}


function makeTypedArray(input: BufferInputData): TypedArray {
    const numElements = input.data.length / input.numComponents;
    const typedArray = new input.type(input.numComponents * numElements);

    for (let i = 0; i < input.data.length; i++) {
        typedArray[i] = input.data[i];
    }

    return typedArray;
}

function makeTypedArrayForIndices(indices: number[]): TypedArray {
    const typedArray = new Uint16Array(indices.length);

    for (let i = 0; i < indices.length; i++) {
        typedArray[i] = indices[i];
    }

    return typedArray;
}

function createBufferFromTypedArray(gl: WebGLRenderingContext, array: TypedArray, type?: number, drawType?: number, debug?: boolean) {
    type = type || gl.ARRAY_BUFFER;
    const buffer = gl.createBuffer();

    if (!buffer) {
        throw new RenderingContextError(`Could not create WebGLBuffer of type ${glEnumToString(gl, type)}`);
    }

    if (debug) {
        registerContextObject(gl, buffer, 'Created Buffer');
    }

    if (debug) {
        taggedMessage(gl, 'Binding Buffer', true, buffer);
    }
    gl.bindBuffer(type, buffer);
    if (debug) {
        taggedMessage(gl, 'Writing Buffer Data', false, array);
    }
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);

    return buffer;
}

function getGLTypeForTypedArray(gl: WebGLRenderingContext, typedArray: TypedArray) {
    if (typedArray instanceof Int8Array) { return gl.BYTE; }
    if (typedArray instanceof Uint8Array) { return gl.UNSIGNED_BYTE; }
    if (typedArray instanceof Int16Array) { return gl.SHORT; }
    if (typedArray instanceof Uint16Array) { return gl.UNSIGNED_SHORT; }
    if (typedArray instanceof Int32Array) { return gl.INT; }
    if (typedArray instanceof Uint32Array) { return gl.UNSIGNED_INT; }
    if (typedArray instanceof Float32Array) { return gl.FLOAT; }
    throw new RenderingContextError(`Array type ${(typedArray as TypedArray).constructor.name} not supported by WebGL`);
}

// This is really just a guess. Though I can't really imagine using
// anything else? Maybe for some compression?
function getNormalizationForTypedArray(typedArray: TypedArray) {
    if (typedArray instanceof Int8Array) { return true; }
    if (typedArray instanceof Uint8Array) { return true; }
    return false;
}