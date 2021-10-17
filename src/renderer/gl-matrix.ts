import { GLMatrixOutOfBoundsError } from "../errors";

export type GLPoint = [number, number, number, number];
export type GLRow = [number, number, number, number];
export type GLColumn = [number, number, number, number];

export class GLMatrix {

    private static readonly _zeroMatrixValues = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ];

    private static readonly _identityMatrixValues = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

    public static get zeroMatrix() {
        return new GLMatrix(this._zeroMatrixValues);
    }

    /**
     * Special transformation matrix. Multiplying any
     * matrix by the identity matrix gives a resulting matrix
     * that equals the original matrix.
     */
    public static get identityMatrix() {
        return new GLMatrix(this._identityMatrixValues);
    }

    public static multiplyMatrixAndPoint(out: GLPoint, m: GLMatrix, p: GLPoint): GLPoint {
        const x = p[0];
        const y = p[1];
        const z = p[2];
        const w = p[3];

        const resultX = (x * m.c0r0) + (x * m.c0r1) + (x * m.c0r2) + (x * m.c0r3);
        const resultY = (y * m.c1r0) + (y * m.c1r1) + (y * m.c1r2) + (y * m.c1r3);
        const resultZ = (z * m.c2r0) + (z * m.c2r1) + (z * m.c2r2) + (z * m.c2r3);
        const resultW = (w * m.c3r0) + (w * m.c3r1) + (w * m.c3r2) + (w * m.c3r3);

        out[0] = resultX;
        out[1] = resultY;
        out[2] = resultZ;
        out[3] = resultW;
        return out;
    }

    public static multiplyMatrices(out: GLMatrix, a: GLMatrix, b: GLMatrix): GLMatrix {

        // copy values from a
        const a0r0 = a.c0r0,
            a0r1 = a.c0r1,
            a0r2 = a.c0r2,
            a0r3 = a.c0r3,

            a1r0 = a.c1r0,
            a1r1 = a.c1r1,
            a1r2 = a.c1r2,
            a1r3 = a.c1r3,

            a2r0 = a.c2r0,
            a2r1 = a.c2r1,
            a2r2 = a.c2r2,
            a2r3 = a.c2r3,

            a3r0 = a.c3r0,
            a3r1 = a.c3r1,
            a3r2 = a.c3r2,
            a3r3 = a.c3r3;


        // row 0
        let bx = b.c0r0;
        let by = b.c1r0;
        let bz = b.c2r0;
        let bw = b.c3r0;
        out.c0r0 = (bx * a0r0) + (bx * a0r1) + (bx * a0r2) + (bx * a0r3);
        out.c1r0 = (by * a1r0) + (by * a1r1) + (by * a1r2) + (by * a1r3);
        out.c2r0 = (bz * a2r0) + (bz * a2r1) + (bz * a2r2) + (bz * a2r3);
        out.c3r0 = (bw * a3r0) + (bw * a3r1) + (bw * a3r2) + (bw * a3r3);

        // row 1
        bx = b.c0r1;
        by = b.c1r1;
        bz = b.c2r1;
        bw = b.c3r1;
        out.c0r1 = (bx * a0r0) + (bx * a0r1) + (bx * a0r2) + (bx * a0r3);
        out.c1r1 = (by * a1r0) + (by * a1r1) + (by * a1r2) + (by * a1r3);
        out.c2r1 = (bz * a2r0) + (bz * a2r1) + (bz * a2r2) + (bz * a2r3);
        out.c3r1 = (bw * a3r0) + (bw * a3r1) + (bw * a3r2) + (bw * a3r3);

        // row 2
        bx = b.c0r2;
        by = b.c1r2;
        bz = b.c2r2;
        bw = b.c3r2;
        out.c0r2 = (bx * a0r0) + (bx * a0r1) + (bx * a0r2) + (bx * a0r3);
        out.c1r2 = (by * a1r0) + (by * a1r1) + (by * a1r2) + (by * a1r3);
        out.c2r2 = (bz * a2r0) + (bz * a2r1) + (bz * a2r2) + (bz * a2r3);
        out.c3r2 = (bw * a3r0) + (bw * a3r1) + (bw * a3r2) + (bw * a3r3);

        // row 3
        bx = b.c0r3;
        by = b.c1r3;
        bz = b.c2r3;
        bw = b.c3r3;
        out.c0r3 = (bx * a0r0) + (bx * a0r1) + (bx * a0r2) + (bx * a0r3);
        out.c1r3 = (by * a1r0) + (by * a1r1) + (by * a1r2) + (by * a1r3);
        out.c2r3 = (bz * a2r0) + (bz * a2r1) + (bz * a2r2) + (bz * a2r3);
        out.c3r3 = (bw * a3r0) + (bw * a3r1) + (bw * a3r2) + (bw * a3r3);

        return out;
    }

    private _values: Float32Array;

    public get values() {
        return this._values;
    }

    // single field getter
    public get c0r0() { return this._values[0] }
    public get c1r0() { return this._values[1] }
    public get c2r0() { return this._values[2] }
    public get c3r0() { return this._values[3] }

    public get c0r1() { return this._values[4] }
    public get c1r1() { return this._values[5] }
    public get c2r1() { return this._values[6] }
    public get c3r1() { return this._values[7] }

    public get c0r2() { return this._values[8] }
    public get c1r2() { return this._values[9] }
    public get c2r2() { return this._values[10] }
    public get c3r2() { return this._values[11] }

    public get c0r3() { return this._values[12] }
    public get c1r3() { return this._values[13] }
    public get c2r3() { return this._values[14] }
    public get c3r3() { return this._values[15] }

    // single field setter
    public set c0r0(value: number) { this._values[0] = value }
    public set c1r0(value: number) { this._values[1] = value }
    public set c2r0(value: number) { this._values[2] = value }
    public set c3r0(value: number) { this._values[3] = value }

    public set c0r1(value: number) { this._values[4] = value }
    public set c1r1(value: number) { this._values[5] = value }
    public set c2r1(value: number) { this._values[6] = value }
    public set c3r1(value: number) { this._values[7] = value }

    public set c0r2(value: number) { this._values[8] = value }
    public set c1r2(value: number) { this._values[9] = value }
    public set c2r2(value: number) { this._values[10] = value }
    public set c3r2(value: number) { this._values[11] = value }

    public set c0r3(value: number) { this._values[12] = value }
    public set c1r3(value: number) { this._values[13] = value }
    public set c2r3(value: number) { this._values[14] = value }
    public set c3r3(value: number) { this._values[15] = value }

    private constructor(values?: number[]) {
        if (values && values.length !== 16) {
            throw new GLMatrixOutOfBoundsError(`Cannot create GLMatrix with given values: expected 16 values, got ${values.length}`);
        } else if (!values) {
            values = GLMatrix._zeroMatrixValues;
        }

        this._values = new Float32Array(values);
    }
}