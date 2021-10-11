import { Vector, Rotation } from '../../src';
import { FLOAT_PRECISION, round } from '../constants';

jest.mock('../../src', () => {
    const originalModule = jest.requireActual('../../src');

    const rotation = originalModule.Rotation;
    rotation.fromRadian = jest.fn();

    //Mock the default export and named export 'foo'
    return {
        __esModule: true,
        ...originalModule,
        Rotation: rotation
    };
});

describe('Vector instance', () => {

    it('defaults to Vector(0,0)', () => {
        const v = new Vector();
        expect(v.x).toBe(0);
        expect(v.y).toBe(0);
    });

    it('correctly receives position passed in constructor', () => {
        const v = new Vector(3, 8);
        expect(v.x).toBe(3);
        expect(v.y).toBe(8);
    });

    it('returns length of zero for Vector(0,0)', () => {
        const v = new Vector(0, 0);
        expect(v.length).toBe(0);
    });

    it('calculates length correctly', () => {
        let v = new Vector(0, 1);
        expect(v.length).toBe(1);

        v = new Vector(3, 0);
        expect(v.length).toBe(3);

        v = new Vector(1, 1);
        expect(v.length).toBeCloseTo(1.41421, FLOAT_PRECISION);

        v = new Vector(2, 2);
        expect(v.length).toBeCloseTo(2.82842, FLOAT_PRECISION);

        v = new Vector(5, 12);
        expect(v.length).toBe(13);
    });

    it('calculates rotation correctly', () => {
        let v = new Vector(0, 0);
        v.rotation;
        expect(Rotation.fromRadian).toHaveBeenCalledWith(0);

        v = new Vector(1, 0);
        v.rotation;
        expect(Rotation.fromRadian).toHaveBeenCalledWith(0);

        v = new Vector(0, 1);
        v.rotation;
        expect(Rotation.fromRadian).toHaveBeenCalledWith(Math.PI / 2);

        v = new Vector(-1, 0);
        v.rotation;
        expect(Rotation.fromRadian).toHaveBeenCalledWith(Math.PI);

        v = new Vector(0, -1);
        v.rotation;
        expect(Rotation.fromRadian).toHaveBeenCalledWith(-Math.PI / 2);
    });

    it('evaluates equality correctly', () => {
        const v1 = new Vector(5, 7);
        let v2 = new Vector(5, 7);

        expect(v1.equals(v2)).toBe(true);
        expect(v2.equals(v1)).toBe(true);

        v2 = new Vector(5, 8);

        expect(v1.equals(v2)).toBe(false);
        expect(v2.equals(v1)).toBe(false);
    });

});

describe('Vector static', () => {

    it('calculates the dot product correctly', () => {
        let v1 = new Vector(0, 0);
        let v2 = new Vector(1, 1);
        expect(Vector.dotProduct(v1, v2)).toBe(0);

        v1 = new Vector(1, 1);
        v2 = new Vector(1, 1);
        expect(Vector.dotProduct(v1, v2)).toBe(2);

        v1 = new Vector(2, 3);
        v2 = new Vector(3, 4);
        expect(Vector.dotProduct(v1, v2)).toBe(18);
    });

    it('calculates vector addition correctly', () => {
        let v1 = new Vector(0, 0);
        let v2 = new Vector(1, 1);
        expect(Vector.add(v1, v2)).toEqual(new Vector(1, 1));

        v1 = new Vector(1, 1);
        v2 = new Vector(1, 1);
        expect(Vector.add(v1, v2)).toEqual(new Vector(2, 2));

        v1 = new Vector(1, 3);
        v2 = new Vector(-2, 1);
        expect(Vector.add(v1, v2)).toEqual(new Vector(-1, 4));
    });

    it('calculates vector subtraction correctly', () => {
        let v1 = new Vector(0, 0);
        let v2 = new Vector(1, 1);
        expect(Vector.substract(v1, v2)).toEqual(new Vector(-1, -1));

        v1 = new Vector(1, 1);
        v2 = new Vector(1, 1);
        expect(Vector.substract(v1, v2)).toEqual(new Vector(0, 0));

        v1 = new Vector(1, 3);
        v2 = new Vector(-2, 1);
        expect(Vector.substract(v1, v2)).toEqual(new Vector(3, 2));
    });

    it('calculates vector multiplication correctly', () => {
        let v1 = new Vector(0, 0);
        let v2 = new Vector(1, 1);
        expect(Vector.multiply(v1, v2)).toEqual(new Vector(0, 0));

        v1 = new Vector(5, 3);
        v2 = new Vector(2, 2);
        expect(Vector.multiply(v1, v2)).toEqual(new Vector(10, 6));

        v1 = new Vector(1, 3);
        v2 = new Vector(-2, 1);
        expect(Vector.multiply(v1, v2)).toEqual(new Vector(-2, 3));
    });

    it('calculates vector division correctly', () => {
        let v1 = new Vector(0, 0);
        let v2 = new Vector(1, 1);
        expect(Vector.divide(v1, v2)).toEqual(new Vector(0, 0));

        v1 = new Vector(5, 3);
        v2 = new Vector(2, 2);
        expect(Vector.divide(v1, v2)).toEqual(new Vector(2.5, 1.5));

        v1 = new Vector(1, 3);
        v2 = new Vector(-2, 1);
        expect(Vector.divide(v1, v2)).toEqual(new Vector(-0.5, 3));
    });

    it('rotates vectors correctly', () => {

        let mockRotation = {
            degrees: 90,
            radian: Math.PI / 2
        } as Rotation;
        let v = new Vector(1, 0);
        let rot = Vector.rotate(v, mockRotation);
        expect(new Vector(round(rot.x), round(rot.y))).toEqual(new Vector(0, 1));

        mockRotation = {
            degrees: -90,
            radian: -Math.PI / 2
        } as Rotation;
        v = new Vector(1, 0);
        rot = Vector.rotate(v, mockRotation);
        expect(new Vector(round(rot.x), round(rot.y))).toEqual(new Vector(0, -1));

        mockRotation = {
            degrees: 180,
            radian: Math.PI
        } as Rotation;
        v = new Vector(1, 0);
        rot = Vector.rotate(v, mockRotation);
        expect(new Vector(round(rot.x), round(rot.y))).toEqual(new Vector(-1, 0));

        mockRotation = {
            degrees: 270,
            radian: Math.PI * 1.5
        } as Rotation;
        v = new Vector(1, 0);
        rot = Vector.rotate(v, mockRotation);
        expect(new Vector(round(rot.x), round(rot.y))).toEqual(new Vector(0, -1));
    });

});