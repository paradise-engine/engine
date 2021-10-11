/**
 * Represents a single point in a 2D space.
 */
export class Point {
    public static get Zero() {
        return new Point(0, 0);
    }

    public static get Min() {
        return new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
    }

    public static get Max() {
        return new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    }

    /**
     * The x-position of the point
     */
    public x: number;
    /**
     * The y-position of the point
     */
    public y: number;

    /**
     * @param x The x-position of the point
     * @param y The y-position of the point
     */
    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }
}
