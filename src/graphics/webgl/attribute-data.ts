export interface AttributeData {
    /**
     * The buffer that contains the data for this attribute
     */
    buffer: WebGLBuffer;
    /**
     * The number of components for this attribute.
     */
    numComponents: number;
    /**
     * The type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...).
     */
    type: number;
    /**
     * Whether or not to normalize the data. Default = false
     */
    normalized?: boolean;
    /**
     * Offset into buffer in bytes. Default = 0
     */
    offset?: number;
    /**
     * The stride in bytes per element. Default = 0
     */
    stride?: number;
}