import { GameObject, Component, Transform, MultipleTransformsError } from '../../src';

class CompUpper extends Component { }
class CompLower extends CompUpper { }
class CompNever extends CompLower { }

describe('GameObject basics', () => {

    it('has a default name if none provided', () => {
        const obj = new GameObject();
        expect(obj.name).toBe('EmptyObject');
    });

    it('accepts custom name', () => {
        const name = 'CustomObjectName';
        const obj = new GameObject(name);
        expect(obj.name).toBe(name);
    });

    it('creates a new Transform on instatiation', () => {
        const initial = Component.getAllLoadedObjects();
        const obj = new GameObject();
        expect(Component.getAllLoadedObjects().length).toBe(initial.length + 1);
        expect(obj.transform).not.toBeUndefined();
        expect(obj.transform.gameObject).toBe(obj);
        expect(obj.transform.isDestroyed).toBe(false);
    });

    it('throws if another Transform is added', () => {
        class AltTransform extends Transform { }
        const obj = new GameObject();
        expect(() => obj.addComponent(AltTransform)).toThrow(MultipleTransformsError);
        expect(() => obj.addComponent(Transform)).toThrow(MultipleTransformsError);
    });

    it('is active by default', () => {
        const obj = new GameObject();
        expect(obj.isActive).toBe(true);
    });

    it('can be enabled and disabled', () => {
        const obj = new GameObject();
        expect(obj.isActive).toBe(true);
        obj.disable();
        expect(obj.isActive).toBe(false);
        obj.enable();
        expect(obj.isActive).toBe(true);
    });
});

describe('GameObject Component handling', () => {

    it('can add Components', () => {
        const obj = new GameObject();
        let comps = obj.getAllComponents();
        expect(comps.length).toBe(1);
        expect(comps[0]).toBe(obj.transform);

        const comp = obj.addComponent(CompUpper);
        comps = obj.getAllComponents();
        expect(comps.length).toBe(2);
        expect(comps[1]).toBe(comp);
    });

    it('can return multiple attached Components by type non-strict', () => {
        const obj = new GameObject();
        const upper = obj.addComponent(CompUpper);
        const lower = obj.addComponent(CompLower);

        let comps = obj.getComponents(CompUpper);
        expect(comps.length).toBe(2);
        expect(comps).toContain(upper);
        expect(comps).toContain(lower);

        comps = obj.getComponents(CompLower);
        expect(comps.length).toBe(1);
        expect(comps).not.toContain(upper);
        expect(comps).toContain(lower);

        comps = obj.getComponents(CompNever);
        expect(comps.length).toBe(0);
    });

    it('can return multiple attached Components by type strict', () => {
        const obj = new GameObject();
        const upper = obj.addComponent(CompUpper);
        const lower = obj.addComponent(CompLower);

        let comps = obj.getComponents(CompUpper, true);
        expect(comps.length).toBe(1);
        expect(comps).toContain(upper);
        expect(comps).not.toContain(lower);

        comps = obj.getComponents(CompLower, true);
        expect(comps.length).toBe(1);
        expect(comps).not.toContain(upper);
        expect(comps).toContain(lower);

        comps = obj.getComponents(CompNever, true);
        expect(comps.length).toBe(0);
    });

    it('can return a single attached Component by type non-strict', () => {
        let obj = new GameObject();
        let upper = obj.addComponent(CompUpper);
        let lower = obj.addComponent(CompLower);

        expect(obj.getComponent(CompUpper)).toBe(upper);
        expect(obj.getComponent(CompLower)).toBe(lower);

        obj = new GameObject();
        lower = obj.addComponent(CompLower);
        upper = obj.addComponent(CompUpper);

        expect(obj.getComponent(CompUpper)).toBe(lower);
        expect(obj.getComponent(CompLower)).toBe(lower);
        expect(obj.getComponent(CompNever)).toBeUndefined();
    });

    it('can return a single attached Component by type non-strict', () => {
        let obj = new GameObject();
        let upper = obj.addComponent(CompUpper);
        let lower = obj.addComponent(CompLower);

        expect(obj.getComponent(CompUpper, true)).toBe(upper);
        expect(obj.getComponent(CompLower, true)).toBe(lower);

        obj = new GameObject();
        lower = obj.addComponent(CompLower);
        upper = obj.addComponent(CompUpper);

        expect(obj.getComponent(CompUpper, true)).toBe(upper);
        expect(obj.getComponent(CompLower, true)).toBe(lower);
        expect(obj.getComponent(CompNever, true)).toBeUndefined();
    });

    it('correctly removes Components', () => {
        const obj = new GameObject();
        const comp = obj.addComponent(CompUpper);

        let comps = obj.getAllComponents();
        expect(comps.length).toBe(2);
        expect(comps).toContain(comp);

        obj.removeComponent(comp);

        comps = obj.getAllComponents();
        expect(comps.length).toBe(1);
        expect(comps).not.toContain(comp);
    });

    it('destroys Components that are removed', () => {
        const obj = new GameObject();
        const comp = obj.addComponent(CompUpper);
        expect(comp.isDestroyed).toBe(false);
        obj.removeComponent(comp);
        expect(comp.isDestroyed).toBe(true);
    });

});
