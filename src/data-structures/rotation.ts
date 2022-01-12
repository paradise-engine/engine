import { BaseControlOptions, ControlType } from "../controls";
import { ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { IComparable } from "./i-comparable";

function radianToDegrees(rad: number) {
    return (rad / Math.PI) * 180;
}

function degreesToRadian(degrees: number) {
    return (degrees / 180) * Math.PI;
}

export interface SerializableRotation extends SerializableObject {
    degrees: number;
}

export interface RotationControlOptions extends BaseControlOptions { }

/**
 * Represents a rotation between 0 and 180 degrees and -180 degrees respectively.
 */
@ControlType()
export class Rotation implements IComparable, ISerializable<SerializableRotation> {

    public static fromSerializable(s: SerializableRotation) {
        return this.fromDegrees(s.degrees);
    }

    /**
     * Creates a new rotation based on degrees
     * @param degrees Degrees of the rotation
     */
    public static fromDegrees(degrees: number) {
        return new Rotation(degrees);
    }

    /**
     * Creates a new rotation based on radian
     * @param rad Radian of the rotation
     */
    public static fromRadian(rad: number) {
        return new Rotation(radianToDegrees(rad));
    }

    /**
     * Adds one Rotation to another Rotation
     * @param a The first Rotation
     * @param b The second Rotation
     */
    public static add(a: Rotation, b: Rotation) {
        return new Rotation(a.degrees + b.degrees);
    }

    /**
     * Substracts one Rotation from another Rotation
     * @param a The first Rotation
     * @param b The second Rotation
     */
    public static subtract(a: Rotation, b: Rotation) {
        return new Rotation(a.degrees - b.degrees);
    }

    // internally, a rotation is represented in degrees
    protected _valueDegrees: number = 0;

    public get degrees() {
        return this._valueDegrees;
    }

    public set degrees(val: number) {
        const degrees = val % 360;
        if (degrees > 180) {
            this._valueDegrees = -180 + (degrees - 180);
        } else if (degrees < -180) {
            this._valueDegrees = 180 + (degrees + 180);
        } else {
            this._valueDegrees = degrees;
        }

        if (this._valueDegrees === -0) {
            this._valueDegrees = 0;
        }

        if (this._valueDegrees === -180) {
            this._valueDegrees = 180;
        }
    }

    public get radian() {
        return degreesToRadian(this._valueDegrees);
    }

    public set radian(val: number) {
        this.degrees = radianToDegrees(val);
    }

    constructor(degrees: number) {
        this.degrees = degrees;
    }

    public equals(compare: Rotation): boolean {
        return this.degrees === compare.degrees;
    }

    public getSerializableObject(): SerializableRotation {
        return {
            _ctor: Rotation.name,
            degrees: this._valueDegrees
        }
    }
}

registerDeserializable(Rotation);