import { BaseControlOptions, ControlType } from "../controls";
import { ColorComponentOutOfBoundsError, InvalidHexCodeError } from "../errors";
import { ISerializable, registerDeserializable, SerializableObject } from "../serialization";

function toHex(comp: number) {
    let hex = comp.toString(16);
    if (hex.length === 1) {
        hex = '0' + hex;
    }
    return hex;
}

function rgbToHex(r: number, g: number, b: number) {
    return toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex: string) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export interface SerializableColor extends SerializableObject {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export interface ColorControlOptions extends BaseControlOptions { }

@ControlType()
export class Color implements ISerializable<SerializableColor> {

    public static get Red() {
        return new Color(255, 0, 0, 1);
    }

    public static get Green() {
        return new Color(0, 255, 0, 1);
    }

    public static get Blue() {
        return new Color(0, 0, 255, 1);
    }

    public static get White() {
        return new Color(255, 255, 255, 1);
    }

    public static get Black() {
        return new Color(0, 0, 0, 1);
    }

    public static get Transparent() {
        return new Color(0, 0, 0, 0);
    }

    public static fromSerializable(s: SerializableColor) {
        return new Color(s.red, s.green, s.blue, s.alpha);
    }

    private _red: number;
    private _green: number;
    private _blue: number;
    private _alpha: number;

    private _hex: string;

    public get red() {
        return this._red;
    }

    public get green() {
        return this._green;
    }

    public get blue() {
        return this._blue;
    }

    public get alpha() {
        return this._alpha;
    }

    public get hex() {
        return this._hex;
    }

    constructor(r: number = 255, g: number = 255, b: number = 255, a: number = 1) {
        this._red = r;
        this._green = g;
        this._blue = b;
        this._alpha = a;
        this._hex = rgbToHex(r, g, b);
    }

    private _validateComponents(r: number, g: number, b: number, a: number) {
        for (const comp of [r, g, b]) {
            if (comp < 0 || comp > 255) {
                throw new ColorComponentOutOfBoundsError(0, 255, comp);
            }
        }
        if (a < 0 || a > 255) {
            throw new ColorComponentOutOfBoundsError(0, 1, a);
        }
    }

    public setRgba(r: number, g: number, b: number, a: number) {
        this._validateComponents(r, g, b, a);

        this._red = r;
        this._green = g;
        this._blue = b;
        this._alpha = a;

        this._hex = rgbToHex(r, g, b);
    }

    public setHex(hex: string) {
        const comps = hexToRgb(hex);
        if (!comps) {
            throw new InvalidHexCodeError(hex);
        }

        this._red = comps.r;
        this._green = comps.g;
        this._blue = comps.b;
    }

    public getSerializableObject(): SerializableColor {
        return {
            _ctor: Color.name,
            red: this.red,
            green: this.green,
            blue: this.blue,
            alpha: this.alpha
        }
    }
}

registerDeserializable(Color);