import { Transform, GameObject, RuntimeInconsistencyError, Vector, Rotation, DestroyBoundTransformError } from '../../src';
import { FLOAT_PRECISION } from '../constants';

function createTransform() {
    const obj = new GameObject();

    return { obj, transform: obj.transform };
}

describe('Transform basics', () => {

    it('cannot be instantiated directly', () => {
        expect(() => {
            const obj = new GameObject();
            const t = new Transform(obj);
        }).toThrow(RuntimeInconsistencyError);
    });

    it('has correct default values', () => {
        const { transform } = createTransform();

        expect(transform.position.equals(new Vector(0, 0))).toBe(true);
        expect(transform.rotation.equals(Rotation.fromRadian(0))).toBe(true);
        expect(transform.scale.equals(new Vector(1, 1))).toBe(true);
    });

});

describe('Transform hierarchy', () => {

    it('initially has no parent and no children', () => {
        const { transform } = createTransform();
        expect(transform.parent).toBeUndefined();
        expect(transform.children.length).toBe(0);
    });

    it('can explicitly add children', () => {
        const { transform: parent } = createTransform();
        const { transform: child1 } = createTransform();
        const { transform: child2 } = createTransform();

        parent.addChild(child1);
        parent.addChild(child2);
        expect(parent.children.length).toBe(2);
        expect(parent.children).toContain(child1);
        expect(parent.children).toContain(child2);
        expect(child1.parent).toBe(parent);
        expect(child2.parent).toBe(parent);
    });

    it('can explicity remove children', () => {
        const { transform: parent } = createTransform();
        const { transform: child1 } = createTransform();
        const { transform: child2 } = createTransform();

        parent.addChild(child1);
        parent.addChild(child2);

        expect(parent.children.length).toBe(2);
        expect(child1.parent).toBe(parent);
        expect(child2.parent).toBe(parent);

        parent.removeChild(child1);
        expect(parent.children.length).toBe(1);
        expect(parent.children).not.toContain(child1);
        expect(child1.parent).toBeUndefined();
    });

    it('can explicitly set parent', () => {
        const { transform: parent } = createTransform();
        const { transform: child1 } = createTransform();
        const { transform: child2 } = createTransform();

        child1.setParent(parent);
        child2.setParent(parent);

        expect(parent.children.length).toBe(2);
        expect(parent.children).toContain(child1);
        expect(parent.children).toContain(child2);
        expect(child1.parent).toBe(parent);
        expect(child2.parent).toBe(parent);
    });

    it('can explicitly remove parent', () => {
        const { transform: parent } = createTransform();
        const { transform: child1 } = createTransform();
        const { transform: child2 } = createTransform();

        child1.setParent(parent);
        child2.setParent(parent);

        expect(parent.children.length).toBe(2);
        expect(child1.parent).toBe(parent);
        expect(child2.parent).toBe(parent);

        child1.setParent(null);

        expect(parent.children.length).toBe(1);
        expect(parent.children).not.toContain(child1);
        expect(child1.parent).toBeUndefined();
    });

    it('implicitly changes parent children when adding child to new parent', () => {
        const { transform: parent1 } = createTransform();
        const { transform: parent2 } = createTransform();
        const { transform: child } = createTransform();

        parent1.addChild(child);
        expect(parent1.children.length).toBe(1);
        expect(parent2.children.length).toBe(0);
        expect(child.parent).toBe(parent1);
        expect(parent1.children).toContain(child);

        parent2.addChild(child);
        expect(parent1.children.length).toBe(0);
        expect(parent2.children.length).toBe(1);
        expect(child.parent).toBe(parent2);
        expect(parent2.children).toContain(child);
    });

    it('implicitly changes parent children when assigning new parent to child', () => {
        const { transform: parent1 } = createTransform();
        const { transform: parent2 } = createTransform();
        const { transform: child } = createTransform();

        child.setParent(parent1);

        expect(parent1.children.length).toBe(1);
        expect(parent2.children.length).toBe(0);
        expect(child.parent).toBe(parent1);
        expect(parent1.children).toContain(child);

        child.setParent(parent2);

        expect(parent1.children.length).toBe(0);
        expect(parent2.children.length).toBe(1);
        expect(child.parent).toBe(parent2);
        expect(parent2.children).toContain(child);
    });

});

describe('Transform manipulation', () => {

    it('translates correctly', () => {
        const { transform } = createTransform();
        expect(transform.localPosition.equals(new Vector(0, 0))).toBe(true);

        transform.translate(new Vector(10, -10));
        expect(transform.localPosition.equals(new Vector(10, -10))).toBe(true);

        transform.translate(new Vector(10, -10));
        expect(transform.localPosition.equals(new Vector(20, -20))).toBe(true);
    });

    it('rotates correctly', () => {
        const { transform } = createTransform();
        expect(transform.localRotation.equals(Rotation.fromDegrees(0))).toBe(true);

        transform.rotate(Rotation.fromDegrees(45));
        expect(transform.localRotation.equals(Rotation.fromDegrees(45))).toBe(true);

        transform.rotate(Rotation.fromDegrees(45));
        expect(transform.localRotation.equals(Rotation.fromDegrees(90))).toBe(true);
    });

    it('scales correctly', () => {
        const { transform } = createTransform();
        expect(transform.localScale.equals(new Vector(1, 1))).toBe(true);

        transform.scaleRelative(new Vector(2, 3));
        expect(transform.localScale.equals(new Vector(2, 3))).toBe(true);

        transform.scaleRelative(new Vector(2, 3));
        expect(transform.localScale.equals(new Vector(4, 9))).toBe(true);
    });

});

describe('Transform local to world space conversion', () => {

    it('correctly converts isolated position', () => {
        const { transform: root } = createTransform();
        const { transform: middle } = createTransform();
        const { transform: child } = createTransform();

        child.translate(new Vector(10, 10));
        expect(child.localPosition.equals(new Vector(10, 10))).toBe(true);
        expect(child.position.equals(new Vector(10, 10))).toBe(true);

        middle.addChild(child);
        middle.translate(new Vector(10, 10));

        expect(child.localPosition.equals(new Vector(10, 10))).toBe(true);
        expect(child.position.equals(new Vector(20, 20))).toBe(true);

        root.addChild(middle);
        root.translate(new Vector(10, -50));

        expect(child.localPosition.equals(new Vector(10, 10))).toBe(true);
        expect(child.position.equals(new Vector(30, -30))).toBe(true);
    });

    it('correctly converts isolated rotation', () => {
        const { transform: root } = createTransform();
        const { transform: middle } = createTransform();
        const { transform: child } = createTransform();

        child.rotate(Rotation.fromDegrees(20));

        expect(child.localRotation.equals(Rotation.fromDegrees(20))).toBe(true);
        expect(child.rotation.equals(Rotation.fromDegrees(20))).toBe(true);

        middle.addChild(child);
        middle.rotate(Rotation.fromDegrees(30));

        expect(child.localRotation.equals(Rotation.fromDegrees(20))).toBe(true);
        expect(child.rotation.equals(Rotation.fromDegrees(50))).toBe(true);

        root.addChild(middle);
        root.rotate(Rotation.fromDegrees(-100));

        expect(child.localRotation.equals(Rotation.fromDegrees(20))).toBe(true);
        expect(child.rotation.equals(Rotation.fromDegrees(-50))).toBe(true);
    });

    it('correctly converts isolated scale', () => {
        const { transform: root } = createTransform();
        const { transform: middle } = createTransform();
        const { transform: child } = createTransform();

        child.scaleRelative(new Vector(2, 3));
        expect(child.localScale.equals(new Vector(2, 3))).toBe(true);
        expect(child.scale.equals(new Vector(2, 3))).toBe(true);

        middle.addChild(child);
        middle.scaleRelative(new Vector(4, 5));

        expect(child.localScale.equals(new Vector(2, 3))).toBe(true);
        expect(child.scale.equals(new Vector(8, 15))).toBe(true);

        root.addChild(middle);
        root.scaleRelative(new Vector(0.5, 2));

        expect(child.localScale.equals(new Vector(2, 3))).toBe(true);
        expect(child.scale.equals(new Vector(4, 30))).toBe(true);
    });

    it('parent rotation correctly affects offset child position', () => {
        const { transform: root } = createTransform();
        const { transform: middle } = createTransform();
        const { transform: child } = createTransform();

        middle.addChild(child);
        child.translate(new Vector(10, 0));

        middle.rotate(Rotation.fromDegrees(90));

        expect(child.rotation.equals(Rotation.fromDegrees(90))).toBe(true);

        expect(child.position.x).toBeCloseTo(0.00000, FLOAT_PRECISION);
        expect(child.position.y).toBeCloseTo(10.00000, FLOAT_PRECISION);

        root.addChild(middle);

        root.rotate(Rotation.fromDegrees(90));

        expect(child.position.x).toBeCloseTo(-10.00000, FLOAT_PRECISION);
        expect(child.position.y).toBeCloseTo(0.00000, FLOAT_PRECISION);

        middle.translate((new Vector(10, 0)));

        expect(child.position.x).toBeCloseTo(-10.00000, FLOAT_PRECISION);
        expect(child.position.y).toBeCloseTo(10.00000, FLOAT_PRECISION);

    });

});

describe('Transform destruction', () => {
    it('throws an error if destroyed directly', () => {
        const { transform } = createTransform();
        expect(() => transform.destroy()).toThrow(DestroyBoundTransformError);
    });
});