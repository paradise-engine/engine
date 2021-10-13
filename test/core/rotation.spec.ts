import { Rotation } from '../../src';
import { FLOAT_PRECISION } from '../constants';

describe('Rotation instance', () => {

	it('holds correct values in the units it was created in', () => {

		let rot = Rotation.fromDegrees(50);
		expect(rot.degrees).toBe(50);

		rot = Rotation.fromRadian(2);
		expect(rot.radian).toBe(2);

	});

	it('only holds values between -180 and 180 degrees', () => {

		const rot = Rotation.fromDegrees(200);
		expect(rot.degrees).toBe(-160);

		rot.degrees = 360;
		expect(rot.degrees).toBe(0);

		rot.degrees = 180;
		expect(rot.degrees).toBe(180);

		rot.degrees = 380;
		expect(rot.degrees).toBe(20);

		rot.degrees = -200;
		expect(rot.degrees).toBe(160);

		rot.degrees = -360;
		expect(rot.degrees).toBe(0);

		rot.degrees = -180;
		expect(rot.degrees).toBe(180);

		rot.degrees = -380;
		expect(rot.degrees).toBe(-20);

	});

	it('only holds values between -PI and PI radian', () => {

		const rot = Rotation.fromRadian(3.5);
		expect(rot.radian).toBeCloseTo(-2.78318, FLOAT_PRECISION);

		rot.radian = 2 * Math.PI;
		expect(rot.radian).toBe(0);

		rot.radian = Math.PI;
		expect(rot.radian).toBe(Math.PI);

		rot.radian = 7;
		expect(rot.radian).toBeCloseTo(0.71681, FLOAT_PRECISION)



		rot.radian = -3.5
		expect(rot.radian).toBeCloseTo(2.78318, FLOAT_PRECISION);

		rot.radian = -2 * Math.PI;
		expect(rot.radian).toBe(0);

		rot.radian = -Math.PI;
		expect(rot.radian).toBe(Math.PI);

		rot.radian = -7;
		expect(rot.radian).toBeCloseTo(-0.71681, FLOAT_PRECISION)

	});

	it('evaluates equality correctly', () => {

		let r1 = Rotation.fromDegrees(12);
		let r2 = Rotation.fromDegrees(12);
		expect(r1.equals(r2)).toBe(true);
		expect(r2.equals(r1)).toBe(true);

		r1 = Rotation.fromDegrees(0);
		r2 = Rotation.fromDegrees(360);
		expect(r1.equals(r2)).toBe(true);
		expect(r2.equals(r1)).toBe(true);

		r1 = Rotation.fromDegrees(180);
		r2 = Rotation.fromDegrees(-180);
		expect(r1.equals(r2)).toBe(true);
		expect(r2.equals(r1)).toBe(true);

		r1 = Rotation.fromRadian(2);
		r2 = Rotation.fromRadian(2);
		expect(r1.equals(r2)).toBe(true);
		expect(r2.equals(r1)).toBe(true);

		r1 = Rotation.fromRadian(Math.PI);
		r2 = Rotation.fromRadian(-Math.PI);
		expect(r1.equals(r2)).toBe(true);
		expect(r2.equals(r1)).toBe(true);

		r1 = Rotation.fromRadian(0);
		r2 = Rotation.fromRadian(0);
		expect(r1.equals(r2)).toBe(true);
		expect(r2.equals(r1)).toBe(true);

		r1 = Rotation.fromDegrees(0);
		r2 = Rotation.fromRadian(0);
		expect(r1.equals(r2)).toBe(true);
		expect(r2.equals(r1)).toBe(true);

		r1 = Rotation.fromRadian(Math.PI);
		r2 = Rotation.fromDegrees(180);
		expect(r1.equals(r2)).toBe(true);
		expect(r2.equals(r1)).toBe(true);

		r1 = Rotation.fromDegrees(50);
		r2 = Rotation.fromDegrees(20);
		expect(r1.equals(r2)).toBe(false);
		expect(r2.equals(r1)).toBe(false);

	});

});

describe('Rotation static', () => {

	it('correctly adds Rotations', () => {

		expect(Rotation.add(
			Rotation.fromDegrees(40),
			Rotation.fromDegrees(50)
		).degrees).toBe(90);

		expect(Rotation.add(
			Rotation.fromDegrees(50),
			Rotation.fromRadian(0.5)
		).degrees).toBeCloseTo(78.64788, FLOAT_PRECISION);

		expect(Rotation.add(
			Rotation.fromDegrees(200),
			Rotation.fromDegrees(100)
		).degrees).toBe(-60);

	});


	it('correctly subtracts Rotations', () => {

		expect(Rotation.subtract(
			Rotation.fromDegrees(40),
			Rotation.fromDegrees(50)
		).degrees).toBe(-10);

		expect(Rotation.subtract(
			Rotation.fromDegrees(50),
			Rotation.fromRadian(0.5)
		).degrees).toBeCloseTo(21.35211, FLOAT_PRECISION);

		expect(Rotation.subtract(
			Rotation.fromDegrees(200),
			Rotation.fromDegrees(100)
		).degrees).toBe(100);

	});

});