import { BaseControlOptions, ControlType } from "../controls";
import { ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { IComparable } from "./i-comparable";

export interface SerializableRect extends SerializableObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface RectControlOptions extends BaseControlOptions {
    prefixes?: [string, string, string, string],
    suffixes?: [string, string, string, string],
    step?: number;
}

/**
 * Represents an area in 2D space, defined by its position (top-left corner)
 * and by its width and height.
 */
@ControlType()
export class Rect implements IComparable, ISerializable<SerializableRect> {

    public static fromSerializable(s: SerializableRect) {
        return new Rect(s.x, s.y, s.width, s.height);
    }

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

    public equals(compare: Rect) {
        return this.x === compare.x &&
            this.y === compare.y &&
            this.width === compare.width &&
            this.height === compare.height;
    }

    public getSerializableObject(): SerializableRect {
        return {
            _ctor: Rect.name,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        }
    }
}

registerDeserializable(Rect);