export function browserApisAvailable() {
    /**
     * ugly hack to detect if we're in web frontend or node backend
     * in order to load up the correct renderer for engine
     */
    try {
        document;
        return true;
    } catch (err) {
        return false;
    }
}