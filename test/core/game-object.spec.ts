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

    it('correctly returns all instantiated objects', () => {
        const initial = GameObject.getAllLoadedObjects();
        const obj = new GameObject();

        let loadedObjects = GameObject.getAllLoadedObjects();

        expect(initial).not.toContain(obj);
        expect(loadedObjects.length - initial.length).toBe(1);
        expect(loadedObjects).toContain(obj);

        obj.destroy();

        loadedObjects = GameObject.getAllLoadedObjects();

        expect(loadedObjects.length - initial.length).toBe(0);
        expect(initial).not.toContain(obj);
        expect(loadedObjects).not.toContain(obj);
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

describe('GameObject hierarchy', () => {

    it('initially has no children', () => {
        const obj = new GameObject();
        expect(obj.hasChildren).toBe(false);
        expect(obj.getChildren().length).toBe(0);
    });

    it('correctly adds and removes children', () => {
        const root = new GameObject();
        const middle1 = new GameObject();
        const middle2 = new GameObject();
        const leaf = new GameObject();

        expect(root.hasChildren).toBe(false);
        expect(root.getChildren().length).toBe(0);

        expect(middle1.getParent()).toBeUndefined();
        expect(middle2.getParent()).toBeUndefined();
        expect(leaf.getParent()).toBeUndefined();

        root.addChild(middle1);
        expect(root.hasChildren).toBe(true);

        let rootChildren = root.getChildren();

        expect(rootChildren.length).toBe(1);
        expect(rootChildren).toContain(middle1);
        expect(middle1.getParent()).toBe(root);

        root.addChild(middle2);
        expect(root.hasChildren).toBe(true);

        rootChildren = root.getChildren();

        expect(rootChildren.length).toBe(2);
        expect(rootChildren).toContain(middle1);
        expect(rootChildren).toContain(middle2);
        expect(middle1.getParent()).toBe(root);
        expect(middle2.getParent()).toBe(root);

        middle1.addChild(leaf);

        expect(middle1.hasChildren).toBe(true);
        expect(root.hasChildren).toBe(true);

        rootChildren = root.getChildren();
        let middle1Children = middle1.getChildren();

        expect(rootChildren.length).toBe(2);
        expect(middle1Children.length).toBe(1);

        expect(rootChildren).toContain(middle1);
        expect(rootChildren).toContain(middle2);
        expect(rootChildren).not.toContain(leaf);
        expect(middle1Children).toContain(leaf);

        expect(middle1.getParent()).toBe(root);
        expect(middle2.getParent()).toBe(root);
        expect(leaf.getParent()).toBe(middle1);

        root.removeChild(middle1);

        rootChildren = root.getChildren();
        middle1Children = middle1.getChildren();

        expect(rootChildren.length).toBe(1);
        expect(middle1Children.length).toBe(1);

        expect(rootChildren).not.toContain(middle1);
        expect(rootChildren).toContain(middle2);
        expect(rootChildren).not.toContain(leaf);
        expect(middle1Children).toContain(leaf);

        expect(middle1.getParent()).toBeUndefined();
        expect(middle2.getParent()).toBe(root);
        expect(leaf.getParent()).toBe(middle1);

    });

});

// components are destroyed
// children are destroyed
// removed from parent once destroyed
describe('GameObject destruction', () => {

    it('destroys self and its transform on destroy', () => {
        const obj = new GameObject();
        expect(obj.isDestroyed).toBe(false);
        expect(obj.transform.isDestroyed).toBe(false);

        obj.destroy();
        expect(obj.isDestroyed).toBe(true);
        expect(obj.transform.isDestroyed).toBe(true);
    });

    it('destroys all attached components on destroy', () => {
        const obj = new GameObject();
        const c1 = obj.addComponent(CompUpper);
        const c2 = obj.addComponent(CompUpper);

        expect(obj.isDestroyed).toBe(false);
        expect(obj.transform.isDestroyed).toBe(false);
        expect(c1.isDestroyed).toBe(false);
        expect(c2.isDestroyed).toBe(false);

        obj.destroy();

        expect(obj.isDestroyed).toBe(true);
        expect(obj.transform.isDestroyed).toBe(true);
        expect(c1.isDestroyed).toBe(true);
        expect(c2.isDestroyed).toBe(true);

    });

    it('destroys all children on destroy', () => {

        const root = new GameObject();
        const middle1 = new GameObject();
        const middle2 = new GameObject();
        const leaf = new GameObject();

        root.addChild(middle1);
        root.addChild(middle2);
        middle1.addChild(leaf);

        expect(root.isDestroyed).toBe(false);
        expect(middle1.isDestroyed).toBe(false);
        expect(middle2.isDestroyed).toBe(false);
        expect(leaf.isDestroyed).toBe(false);

        root.destroy();

        expect(root.isDestroyed).toBe(true);
        expect(middle1.isDestroyed).toBe(true);
        expect(middle2.isDestroyed).toBe(true);
        expect(leaf.isDestroyed).toBe(true);

    });

    it('is removed from parent on destroy', () => {

        const root = new GameObject();
        const child = new GameObject();

        root.addChild(child);

        expect(root.hasChildren).toBe(true);
        expect(root.getChildren()).toContain(child);
        expect(child.getParent()).toBe(root);

        child.destroy();

        expect(child.isDestroyed).toBe(true);
        expect(root.isDestroyed).toBe(false);

        expect(root.hasChildren).toBe(false);
        expect(root.getChildren()).not.toContain(child);
        expect(child.getParent()).toBeUndefined();

    });

});