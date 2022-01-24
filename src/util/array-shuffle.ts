/**
 * Shuffle using Fisher-Yates Shuffle
 * @param arr 
 * @returns 
 */
export function shuffleArray<T>(arr: T[]): T[] {
    const workingArray = arr.slice();
    let currentIndex = workingArray.length;
    let randomIndex: number;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [workingArray[currentIndex], workingArray[randomIndex]] = [workingArray[randomIndex], workingArray[currentIndex]];
    }

    return workingArray;
}