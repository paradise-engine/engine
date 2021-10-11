/**
 * This file contains constants that are used during testing
 */

/**
 * Determines the maximum number of decimals that are compared when
 * asserting floating point numbers.
 * The expected value given in assertions should have at least one more
 * decimal than FLOAT_PRECISION.
 */
export const FLOAT_PRECISION = 4;

export function round(input: number, decimals: number = FLOAT_PRECISION) {
    return parseFloat(input.toFixed(decimals));
}