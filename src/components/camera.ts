import { Control, NumberControlOptions } from "../controls";
import { Color, ColorControlOptions, Behaviour, GameObject, Rect, SerializableColor, SerializableBehaviour, SerializableRect } from "../core";
import { deserialize, ISerializable, registerDeserializableComponent } from "../serialization";

export interface SerializableCamera extends SerializableBehaviour {
    backgroundColor: SerializableColor;
    size: number;
    nearClipPane: number;
    farClipPane: number;
    viewportRect: SerializableRect;
    depth: number;
}

export class Camera extends Behaviour implements ISerializable<SerializableCamera> {
    public static applySerializable(s: SerializableCamera, comp: Camera) {
        super.applySerializable(s, comp);
        comp.backgroundColor = deserialize(s.backgroundColor);
        comp.size = s.size;
        comp.nearClipPane = s.nearClipPane;
        comp.farClipPane = s.farClipPane;
        comp.viewportRect = deserialize(s.viewportRect);
        comp.depth = s.depth;
    }

    @Control<ColorControlOptions>()
    public backgroundColor: Color;

    @Control<NumberControlOptions>({
        options: {
            min: 0,
            step: 0.1,
        }
    })
    public size: number;

    @Control<NumberControlOptions>()
    public nearClipPane: number;

    @Control<NumberControlOptions>()
    public farClipPane: number;
    public viewportRect: Rect;

    @Control<NumberControlOptions>({
        options: {
            asInteger: true
        }
    })
    public depth: number;

    constructor(gameObject: GameObject) {
        super(gameObject);

        this.backgroundColor = Color.Blue;
        this.size = 5;
        this.nearClipPane = -1;
        this.farClipPane = 1000;
        this.viewportRect = new Rect(0, 0, 1, 1);
        this.depth = -1;
    }

    public getSerializableObject(): SerializableCamera {
        return {
            ...super.getSerializableObject(),
            _ctor: Camera.name,
            backgroundColor: this.backgroundColor.getSerializableObject(),
            size: this.size,
            nearClipPane: this.nearClipPane,
            farClipPane: this.farClipPane,
            viewportRect: this.viewportRect.getSerializableObject(),
            depth: this.depth
        }
    }
}

registerDeserializableComponent(Camera);