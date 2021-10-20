
/**
 * Returns a string representation of a numeric WebGL enum value.
 * 
 * @param gl The WebGL context.
 * @param v The enum value to lookup.
 * @returns String representation of the enum value.
 */
export function glEnumToString(gl: WebGLRenderingContext, v: number): string {

    const results = [];

    for (const key of Object.keys(gl)) {
        const value = (gl as any)[key];
        if (value === v) {
            results.push(key);
        }
    }

    return results.length > 0
        ? results.join(' | ')
        : `0x${v.toString(16)}`;
}