import { IComparable } from "./i-comparable";

/**
 * Represents an area in 2D space, defined by its position (top-left corner)
 * and by its width and height.
 */
export class Rectangle implements IComparable {
    /**
     * The x-position of the rectangle's top-left corner
     */
    public x: number;
    /**
     * The y-position of the rectangle's top-left corner
     */
    public y: number;
    /**
     * The width of the rectangle
     */
    public width: number;
    /**
     * The height of the rectangle
     */
    public height: number;

    /**
     * 
     * @param x The x-position of the rectangle's top-left corner
     * @param y The y-position of the rectangle's top-left corner
     * @param width The width of the rectangle
     * @param height The height of the rectangle
     */
    constructor(x?: number, y?: number, width?: number, height?: number) {
        this.x = x || 0;
        this.y = y || 0;

        this.width = width || 0;
        this.height = height || 0;
    }

    public equals(compare: Rectangle) {
        return this.x === compare.x &&
            this.y === compare.y &&
            this.width === compare.width &&
            this.height === compare.height;
    }
}