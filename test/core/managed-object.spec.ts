import { ManagedObject } from '../../src';

class MO1 extends ManagedObject { }
class MO2 extends ManagedObject { }

describe('ManagedObject', () => {

	it('generates incremental IDs', () => {
		const m1 = new MO1();
		const m2 = new MO2();

		expect(m1.id).toBe(m2.id - 1);
	});

	it('returns objects correctly by their id', () => {
		const m1 = new MO1();
		const m2 = new MO2();

		expect(ManagedObject.getObjectById(m1.id)).toBe(m1);
		expect(ManagedObject.getObjectById(m2.id)).toBe(m2);
		expect(ManagedObject.getObjectById(999)).toBeUndefined();
	});

	it('sets isDestroyed property once destroy() is called', () => {
		const m = new MO1();
		expect(m.isDestroyed).toBe(false);
		m.destroy();
		expect(m.isDestroyed).toBe(true);
	});

	it('does not return destroyed objects by their id', () => {
		const m = new MO1();
		m.destroy();

		expect(ManagedObject.getObjectById(m.id)).toBeUndefined();
	});

	it('returns all created objects that are not destroyed', () => {

		const initial = ManagedObject.getAllLoadedObjects();

		const m1 = new MO1();
		const m2 = new MO2();
		const m3 = new MO2();

		let allObjects = ManagedObject.getAllLoadedObjects();

		expect(allObjects.length - initial.length).toBe(3);
		expect(allObjects).toContain(m1);
		expect(allObjects).toContain(m2);
		expect(allObjects).toContain(m3);

		m2.destroy();

		allObjects = ManagedObject.getAllLoadedObjects();

		expect(allObjects.length - initial.length).toBe(2);
		expect(allObjects).toContain(m1);
		expect(allObjects).not.toContain(m2);
		expect(allObjects).toContain(m3);
	});

});
