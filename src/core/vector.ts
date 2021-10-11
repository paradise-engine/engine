import { Point } from "./point";
import { Rotation } from "./rotation";

/**
 * Represents a 2D vector.
 */
export class Vector extends Point {

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
     * Rotates a given vector around its origin by
     * a given amount.
     * @param vector The vector to rotate
     * @param rotation The rotation amount
     */
    public static rotate(vector: Vector, rotation: Rotation): Vector {
        const alpha = rotation.degrees;
        return new Vector(
            (vector.x * Math.cos(alpha)) - (vector.y * Math.sin(alpha)),
            (vector.x * Math.sin(alpha)) + (vector.y * Math.cos(alpha))
        );
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

}