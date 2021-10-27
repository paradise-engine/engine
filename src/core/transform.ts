import { mat4, quat, vec3 } from "gl-matrix";
import { DestroyBoundTransformError } from "../errors";
import { Component } from "./component";
import { Rotation } from "./rotation";
import { Vector } from "./vector";

/**
 * Represents the transform (position, rotation and scale) of an object.
 */
export class Transform extends Component {
    protected _parent?: Transform;
    protected _children: Transform[] = [];
    // represents local position
    protected _localPosition: Vector = new Vector(0, 0);
    // represents local rotation
    protected _localRotation: Rotation = Rotation.fromDegrees(0);
    // represents local scale
    protected _localScale: Vector = new Vector(1, 1);

    // #region hierarchy implementation

    public get parent() {
        return this._parent;
    }

    public get children() {
        return this._children.concat([]);
    }

    public setParent(parent: Transform | null) {
        if (this._parent) {
            this._parent.removeChild(this);
        }

        if (parent) {
            this._parent = parent;
            if (!parent.children.includes(this)) {
                parent.addChild(this);
            }
        } else {
            this._parent = undefined;
        }
    }

    public addChild(child: Transform) {
        if (!this._children.includes(child)) {
            this._children.push(child);

            if (child.parent !== this) {
                child.setParent(this);
            }
        }
    }

    public removeChild(child: Transform) {
        if (this._children.includes(child)) {

            this._children.splice(this._children.indexOf(child), 1);
            if (child.parent) {
                child.setParent(null);
            }

        }
    }

    // #endregion

    /**
     * The global position of the Transform
     */
    public get position(): Vector {
        if (this._parent) {
            return Vector.add(this._parent.position, Vector.rotate(this._localPosition, this._parent.rotation));
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
        if (this._parent) {
            return Rotation.add(this._parent.rotation, this._localRotation);
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
        if (this._parent) {
            return Vector.multiply(this._parent.scale, this._localScale);
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
        if (this._parent) {
            const parentMatrix = this._parent.getGlobalMatrix();
            mat4.multiply(matrix, parentMatrix, matrix);
        }

        return matrix;
    }

    public override destroy() {
        if (!this.gameObject.isDestroyed) {
            throw new DestroyBoundTransformError();
        }

        this.setParent(null);

        super.destroy();
    }

}