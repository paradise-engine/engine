/**
 * Generator that yields color component arrays
 */
export function* colorGenerator() {
    // the current alphabet
    let alphabet: number[] = [0, 255];
    // the old alphabet - to prevent duplicate values
    let oldAlphabet: number[] = [];
    // current value that's been added to the alphabet
    let val = 255;

    /**
     * Recursive inner generator to generate all possible component
     * combinations for current alphabet.
     * @param index Index of the component to generate for (`0 = red, 1 = green, 2 = blue`)
     */
    function* getComponents(index: number): Generator<number[], void> {
        if (index === 2) {
            for (let i = 0; i < alphabet.length; i++) {
                yield [alphabet[i]]
            }
            return;
        }

        for (let i = 0; i < alphabet.length; i++) {
            for (const comps of getComponents(index + 1)) {
                yield [alphabet[i], ...comps]
            }
        }
    }

    // loop that creates each alphabet and generates their values
    // runs as long as our alphabet length is below 256
    while (alphabet.length < 256) {
        oldAlphabet = alphabet;
        alphabet = [];

        let lastPushed = false;
        for (let a = 0; a <= 256; a += val) {
            if (a >= 255) {
                // prevent 255 being pushed twice in last alphabet
                if (!lastPushed) {
                    alphabet.push(255);
                    lastPushed = true;
                }
            } else {
                alphabet.push(a)
            }
        }

        // generate values for current alphabet
        for (const rgb of getComponents(0)) {
            // only yield values that contain at least one component
            // that isn't part of the last alphabet to prevent duplicates
            if (
                val === 255
                || (oldAlphabet.indexOf(rgb[0]) === -1)
                || (oldAlphabet.indexOf(rgb[1]) === -1)
                || (oldAlphabet.indexOf(rgb[2]) === -1)
            ) {
                yield (rgb);
            }
        }

        // halve the value that's being added to the alphabet
        val = Math.ceil(val / 2);
    }

    return;
}
