
/**
 * Returns an array that contains every possible combination of the elements
 * in the passed array.
 * The result will not contain a combination multiple times in different orders.
 * The result will not contain the empty set.
 * @param array The array to permutate
 */
export function arrayPermutate<T = any>(array: T[]): T[][] {
    const allCombinations: T[][] = [];

    for (let i = 0; i < array.length - 1; i++) {
        const outerEl = array[i];
        allCombinations.push([outerEl]);
        const combined = [outerEl];

        for (let k = i + 1; k < array.length; k++) {
            const innerEl = array[k];
            combined.push(innerEl);
            allCombinations.push(combined.slice());
        }
    }

    return allCombinations;
}