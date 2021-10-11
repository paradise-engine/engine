import { IComparable } from "./i-comparable";
import { Rotation } from "./rotation";

/**
 * Represents a 2D vector. Can be used for directional vectors but also for representing points.
 */
export class Vector implements IComparable {

    /**
     * Calculates the dot product of two Vectors
     * @param a The first Vector
     * @param b The second Vector
     */
    public static dotProduct(a: Vector, b: Vector) {
        return (a.x * b.x) + (a.y * b.y);
    }

    /**
     * Adds one Vector to another Vector
     * @param a The first Vector
     * @param b The second Vector
     */
    public static add(a: Vector, b: Vector) {
        return new Vector(a.x + b.x, a.y + b.y);
    }

    /**
     * Calculates the difference Vector between two Vectors
     * @param a The pointer Vector
     * @param b The foot Vector
     */
    public static substract(a: Vector, b: Vector) {
        return new Vector(a.x - b.x, a.y - b.y);
    }

    /**
     * Multiplies one Vector by another Vector
     * @param a The first Vector
     * @param b The second Vector
     */
    public static multiply(a: Vector, b: Vector) {
        return new Vector(a.x * b.x, a.y * b.y);
    }

    /**
     * Divides one Vector by another Vector
     * @param a The first Vector
     * @param b The second Vector
     */
    public static divide(a: Vector, b: Vector) {
        return new Vector(a.x / b.x, a.y / b.y);
    }

    /**
     * Rotates a given vector anti-clockwise around its origin by
     * a given amount.
     * @param vector The vector to rotate
     * @param rotation The rotation amount
     */
    public static rotate(vector: Vector, rotation: Rotation): Vector {
        const alpha = rotation.radian;
        return new Vector(
            (vector.x * Math.cos(alpha)) - (vector.y * Math.sin(alpha)),
            (vector.x * Math.sin(alpha)) + (vector.y * Math.cos(alpha))
        );
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

    /**
     * The length of the vector
     */
    public get length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * The vectors rotation in degrees, ranging from 0 to 180 or -180 respectively
     */
    public get rotation() {
        return Rotation.fromRadian(Math.atan2(this.y, this.x)); // * (180 / Math.PI);
    }

    public equals(compare: Vector) {
        return this.x === compare.x && this.y === compare.y;
    }

}