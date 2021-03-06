import { Rect } from '../../src';

describe('Rectangle instance', () => {

    it('takes all zeroes as default', () => {
        const rec = new Rect();
        expect(rec.x).toBe(0);
        expect(rec.y).toBe(0);
        expect(rec.width).toBe(0);
        expect(rec.height).toBe(0);
    });

    it('correctly stores initial values', () => {
        const rec = new Rect(10, 20, 500, 100);
        expect(rec.x).toBe(10);
        expect(rec.y).toBe(20);
        expect(rec.width).toBe(500);
        expect(rec.height).toBe(100);
    });

    it('evaluates equality correctly', () => {
        let r1 = new Rect();
        let r2 = new Rect(0, 0, 0, 0);

        expect(r1.equals(r2)).toBe(true);
        expect(r2.equals(r1)).toBe(true);

        r1 = new Rect(10, 20, 30, 40);
        r2 = new Rect(10, 20, 30, 40);

        expect(r1.equals(r2)).toBe(true);
        expect(r2.equals(r1)).toBe(true);

        r2 = new Rect(11, 20, 30, 40);

        expect(r1.equals(r2)).toBe(false);
        expect(r2.equals(r1)).toBe(false);
    });

});