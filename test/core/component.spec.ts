import { Component, GameObject, ManagedObjectDestroyedError, RuntimeInconsistencyError } from '../../src';

class Comp1 extends Component { }
class Comp2 extends Component { }

describe('Component instatiation', () => {

    it('cannot be directly instantiated', () => {
        expect(() => {
            new Comp1(new GameObject());
        }).toThrow(RuntimeInconsistencyError);
    });

    it('can be instantiated through GameObject', () => {

        const obj = new GameObject();
        expect(() => {
            obj.addComponent(Comp1);
        }).not.toThrow();

    });

    it('is returned as instance by GameObject once instatiated', () => {
        const obj = new GameObject();
        const comp = obj.addComponent(Comp1);
        expect(comp).toBeInstanceOf(Comp1);
        expect(comp).toBeInstanceOf(Component);
    });

    it('correctly returns all instantiated components', () => {
        const obj = new GameObject();
        const initial = Component.getAllLoadedObjects();

        const c1 = obj.addComponent(Comp1);
        const c2 = obj.addComponent(Comp2);
        const c3 = obj.addComponent(Comp2);

        let loadedComps = Component.getAllLoadedObjects();

        expect(loadedComps.length - initial.length).toBe(3);
        expect(loadedComps).toContain(c1);
        expect(loadedComps).toContain(c2);
        expect(loadedComps).toContain(c3);

        c2.destroy();

        loadedComps = Component.getAllLoadedObjects();

        expect(loadedComps.length - initial.length).toBe(2);
        expect(loadedComps).toContain(c1);
        expect(loadedComps).not.toContain(c2);
        expect(loadedComps).toContain(c3);

    });

    it('holds a reference to its GameObject', () => {
        const obj = new GameObject();
        const comp = obj.addComponent(Comp1);
        expect(comp.gameObject).toBe(obj);
    });

});

describe('Component destruction', () => {

    it('gets removed from GameObject once destroyed', () => {
        const obj = new GameObject();
        const comp = obj.addComponent(Comp1);

        expect(comp.isDestroyed).toBe(false);
        expect(obj.getAllComponents()).toContain(comp);

        comp.destroy();
        expect(comp.isDestroyed).toBe(true);
        expect(obj.getAllComponents()).not.toContain(comp);
    });

    it('throws an error when accessing GameObject after being destroyed', () => {
        const obj = new GameObject();
        const comp = obj.addComponent(Comp1);

        expect(comp.gameObject).toBe(obj);

        comp.destroy();

        expect(() => comp.gameObject).toThrow(ManagedObjectDestroyedError);
    });

    it('throws an error when accessing GameObject after being orphaned', () => {
        /**
         * This is just a hypothetical test. Without explicitly hacking your way to it,
         * this part of the code should not be reachable.
         */
        const obj = new GameObject();
        const comp = obj.addComponent(Comp1);
        comp.destroy();

        // the hack that makes reaching this part of the code possible
        (comp as any)['_isDestroyed'] = false;
        expect(() => comp.gameObject).toThrow(RuntimeInconsistencyError);
    });

});