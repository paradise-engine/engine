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

    public override destroy() {
        if (!this.gameObject.isDestroyed) {
            throw new DestroyBoundTransformError();
        }

        this.setParent(null);

        super.destroy();
    }

}