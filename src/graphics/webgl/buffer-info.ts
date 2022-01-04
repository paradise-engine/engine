import { Dictionary } from "../../util";
import { AttributeData } from "./attribute-data";

export interface BufferInfo {
    /**
     * The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
     */
    numElements: number;
    /**
     * The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
     */
    indices?: WebGLBuffer;
    /**
     * The attribute data.
     */
    attribs: Dictionary<AttributeData>
}