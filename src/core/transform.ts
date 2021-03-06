import { mat4, quat, vec3 } from "gl-matrix";
import { Control } from "../controls";
import { DestroyBoundTransformError, ManagedObjectNotFoundError } from "../errors";
import { deserialize, ISerializable, registerDeserializableComponent, SerializableObject } from "../serialization";
import { arrayMove } from "../util";
import { Component } from "./component";
import { SerializableVector, Vector, VectorControlOptions, Rotation, RotationControlOptions, SerializableRotation } from "../data-structures";

export interface SerializableTransform extends SerializableObject {
    id: string;
    localPosition: SerializableVector;
    localRotation: SerializableRotation;
    localScale: SerializableVector;
}

/**
 * Represents the transform (position, rotation and scale) of an object.
 */
export class Transform extends Component implements ISerializable<SerializableTransform> {

    public static applySerializable(s: SerializableTransform, comp: Transform) {
        comp._localPosition = deserialize(s.localPosition);
        comp._localRotation = deserialize(s.localRotation);
        comp._localScale = deserialize(s.localScale);
    }

    protected _parentId?: string;
    protected _children: string[] = [];

    // represents local position
    @Control<VectorControlOptions>({
        name: 'Position',
        options: {
            prefixes: ['X', 'Y']
        }
    })
    protected _localPosition: Vector = new Vector(0, 0);

    // represents local rotation
    @Control<RotationControlOptions>({
        name: 'Rotation',
        options: {}
    })
    protected _localRotation: Rotation = Rotation.fromDegrees(0);

    // represents local scale
    @Control<VectorControlOptions>({
        name: 'Scale',
        options: {
            prefixes: ['X', 'Y'],
            step: 0.1
        },
    })
    protected _localScale: Vector = new Vector(1, 1);

    // #region hierarchy implementation

    public get parent(): Transform | undefined {
        if (!this._parentId) {
            return undefined;
        }
        return this.application.managedObjectRepository.getObjectById<Transform>(this._parentId);
    }

    public get children() {
        return this._children.map(childId => this.application.managedObjectRepository.getObjectById<Transform>(childId));
    }

    public setParent(parent: Transform | null) {
        if (this.parent) {
            this.parent.removeChild(this);
        }

        if (parent) {
            this._parentId = parent.id;

            if (!parent._children.includes(this.id)) {
                parent.addChild(this);
            }
        } else {
            this._parentId = undefined;
        }
    }

    public addChild(child: Transform) {
        if (!this._children.includes(child.id)) {
            this._children.push(child.id);

            if (child._parentId !== this.id) {
                child.setParent(this);
            }
        }
    }

    public removeChild(child: Transform) {
        if (this._children.includes(child.id)) {

            this._children.splice(this._children.indexOf(child.id), 1);
            if (child.parent) {
                child.setParent(null);
            }

        }
    }

    public reorderChild(childIndex: number, destinationIndex: number) {
        this._children = arrayMove(this._children, childIndex, destinationIndex);
    }

    // #endregion

    /**
     * The global position of the Transform
     */
    public get position(): Vector {
        if (this.parent) {
            return Vector.add(this.parent.position, Vector.rotate(this._localPosition, this.parent.rotation));
        }
        return this._localPosition;
    }

    /**
     * The position of the Transform relative to its parent
     */
    public get localPosition(): Vector {
        return this._localPosition;
    }

    /**
     * The global rotation of the Transform
     */
    public get rotation(): Rotation {
        if (this.parent) {
            return Rotation.add(this.parent.rotation, this._localRotation);
        }

        return this._localRotation;
    }

    /**
     * The local rotation of the Transform relative to its parent
     */
    public get localRotation() {
        return this._localRotation;
    }

    /**
     * The global scale of the Transform
     */
    public get scale(): Vector {
        if (this.parent) {
            return Vector.multiply(this.parent.scale, this._localScale);
        }

        return this._localScale;
    }

    /**
     * The local scale of the Transform relative to its parent
     */
    public get localScale() {
        return this._localScale;
    }

    /**
     * Scales the transform by multiplying its scale values
     * by the provided amount
     * @param scaleMultiply The amount to scale by
     */
    public scaleRelative(scaleMultiply: Vector) {
        this._localScale = Vector.multiply(this._localScale, scaleMultiply);
    }

    /**
     * Moves the transform in the direction and distance 
     * of the specified Vector
     * @param delta The vector to move by
     */
    public translate(delta: Vector) {
        this._localPosition = Vector.add(this._localPosition, delta);
    }

    /**
     * Rotates the transform by the amount in the specified
     * Rotation
     * @param delta The rotation to rotate by
     */
    public rotate(delta: Rotation) {
        this._localRotation = Rotation.add(this._localRotation, delta);
    }

    /**
     * Rotates the transform around an anchor point relative to the transform itself
     * @param delta The Rotation to rotate by
     * @param anchor The anchor point, with (0,0) being the top-left corner of the transform (default)
     */
    public rotateAround(delta: Rotation, anchor: Vector) {
        const rotationOffsetMatrix = mat4.create();
        mat4.fromRotation(rotationOffsetMatrix, delta.radian, [0, 0, 1]);
        mat4.translate(rotationOffsetMatrix, rotationOffsetMatrix, [-anchor.x, -anchor.y, 0]);

        const matrix = mat4.create();
        mat4.translate(matrix, matrix, [this._localPosition.x, this.localPosition.y, 0]);
        mat4.rotateZ(matrix, matrix, this._localRotation.radian);
        mat4.rotateZ(matrix, matrix, delta.radian);
        mat4.multiply(matrix, matrix, rotationOffsetMatrix);
        mat4.scale(matrix, matrix, [this._localScale.x, this._localScale.y, 1]);

        const translation = vec3.create();
        const rotation = quat.create();
        const scaling = vec3.create();
        mat4.getTranslation(translation, matrix);
        mat4.getRotation(rotation, matrix);
        mat4.getScaling(scaling, matrix);

        this._localPosition = new Vector(translation[0], translation[1]);
        this._localRotation = Rotation.fromRadian(rotation[2]);
        this._localScale = new Vector(scaling[0], scaling[1]);
    }

    /**
     * Returns the local matrix of the Transform
     */
    public getLocalMatrix() {
        const matrix = mat4.create();
        mat4.translate(matrix, matrix, [this._localPosition.x, this.localPosition.y, 0]);
        mat4.rotateZ(matrix, matrix, this._localRotation.radian);
        mat4.scale(matrix, matrix, [this._localScale.x, this._localScale.y, 1]);
        return matrix;
    }

    /**
     * Returns the global matrix of the Transform
     */
    public getGlobalMatrix() {
        const matrix = this.getLocalMatrix();
        if (this.parent) {
            const parentMatrix = this.parent.getGlobalMatrix();
            mat4.multiply(matrix, parentMatrix, matrix);
        }

        return matrix;
    }

    public override destroy() {
        let gameObjectDestroyed = true;

        try {
            if (!this.gameObject.isDestroyed) {
                gameObjectDestroyed = false;
            }
        } catch (err) {
            if (!(err instanceof ManagedObjectNotFoundError)) {
                throw err;
            }
            gameObjectDestroyed = true;
        }

        if (!gameObjectDestroyed) {
            throw new DestroyBoundTransformError();
        }

        this.setParent(null);
        super.destroy();
    }

    public getSerializableObject(): SerializableTransform {
        return {
            _ctor: Transform.name,
            id: this.id,
            localPosition: this._localPosition.getSerializableObject(),
            localRotation: this._localRotation.getSerializableObject(),
            localScale: this._localScale.getSerializableObject()
        }
    }
}

registerDeserializableComponent(Transform);