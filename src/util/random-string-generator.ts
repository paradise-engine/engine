/**
 * Generates a random string 
 */
export function generateRandomString() {
    return Math.random().toString(36).substring(2);
}