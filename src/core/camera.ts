import { Application } from "../application";
import { Control, NumberControlOptions } from "../controls";
import { Color, ColorControlOptions, Rect, RectControlOptions, SerializableColor, SerializableRect, Vector } from "../data-structures";
import { DeserializationOptions, deserialize, ISerializable, registerDeserializableComponent } from "../serialization";
import { Renderer } from "./renderer";
import { Behaviour, SerializableBehaviour } from "./behaviour";
import { GameObject } from "./game-object";

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

        const options: DeserializationOptions = { application: comp.application }

        comp.backgroundColor = deserialize(s.backgroundColor, options);
        comp.size = s.size;
        comp.nearClipPane = s.nearClipPane;
        comp.farClipPane = s.farClipPane;
        comp.viewportRect = deserialize(s.viewportRect, options);
        comp.depth = s.depth;
    }

    @Control<ColorControlOptions>({
        name: 'Background Color',
        options: {}
    })
    public backgroundColor: Color;

    @Control<NumberControlOptions>({
        name: 'Size',
        options: {
            min: 0,
            step: 0.1,
        }
    })
    public size: number;

    @Control<NumberControlOptions>({
        name: 'Near Clip Pane',
        options: {}
    })
    public nearClipPane: number;

    @Control<NumberControlOptions>({
        name: 'Far Clip Pane',
        options: {}
    })
    public farClipPane: number;

    @Control<RectControlOptions>({
        name: 'Viewport',
        options: {
            prefixes: ['X', 'Y', 'Width', 'Height']
        }
    })
    public viewportRect: Rect;

    @Control<NumberControlOptions>({
        name: 'Depth',
        options: {
            asInteger: true
        }
    })
    public depth: number;

    constructor(application: Application, gameObject: GameObject) {
        super(application, gameObject);

        this.backgroundColor = new Color(25, 35, 50);
        this.size = 5;
        this.nearClipPane = -1;
        this.farClipPane = 1000;
        this.viewportRect = new Rect(0, 0, 1, 1);
        this.depth = -1;
    }

    public performCulling() {
        const scene = this.application.gameManager.currentScene;
        const inView: GameObject[] = [];

        if (scene) {
            const viewSize = new Vector(
                this.application.renderPipeline.view.width,
                this.application.renderPipeline.view.height
            );

            const viewExtends = Vector.divide(viewSize, new Vector(2, 2));

            const viewRect = new Rect(
                this.transform.position.x - viewExtends.x,
                this.transform.position.y - viewExtends.y,
                viewSize.x,
                viewSize.y
            );

            const cullFn = (obj: GameObject): GameObject[] => {
                const results: GameObject[] = [];

                let boundingBox = new Rect(obj.transform.position.x, obj.transform.position.y);
                const renderer = obj.getComponent(Renderer);

                if (renderer) {
                    boundingBox = renderer.getBounds();
                }

                if (Rect.overlap(viewRect, boundingBox)) {
                    results.push(obj);
                }

                for (const child of obj.getChildren()) {
                    results.push(...cullFn(child));
                }

                return results;
            }

            for (const gameObject of scene.getAllGameObjects()) {
                inView.push(...cullFn(gameObject));
            }
        }

        return inView;
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