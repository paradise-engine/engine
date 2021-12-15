import { generateRandomString } from "./util";
import { ManagedObjectRepository, SerializableManagedObjectRepository } from "./core";
import { IRenderer, Renderer } from "./renderer";
import { RuntimeInconsistencyError } from "./errors";
import { __ComponentCreationLock } from "./core/component-creation-lock";
import { GameManager } from "./lifecycle";
import { ResourceLoader } from "./resource";
import { DeserializationOptions, deserialize, ISerializable, registerDeserializable, SerializableObject } from "./serialization";

export interface ApplicationOptions {
    id?: string;
    renderer?: IRenderer<any>;
}

export interface SerializableApplication extends SerializableObject {
    id: string;
    renderer: SerializableObject;
    objectRepository: SerializableManagedObjectRepository;
}

export class Application implements ISerializable<SerializableApplication> {

    public static fromSerializable(s: SerializableApplication, options: DeserializationOptions) {
        const app = new Application({
            renderer: deserialize(s.renderer, options) as IRenderer<any>
        });

        app._managedObjectRepository = deserialize(s.objectRepository, options);
        app._id = s.id;

        return app;
    }

    private static _apps: Map<string, Application> = new Map();

    public static getById(id: string) {
        const app = this._apps.get(id);
        if (!app) {
            throw new RuntimeInconsistencyError(`No application with ID '${id}' registered.`);
        }
        return app;
    }

    private _id: string;
    private __ccLock: __ComponentCreationLock;
    private _loader: ResourceLoader;
    private _gameManager: GameManager;
    private _managedObjectRepository: ManagedObjectRepository;

    public readonly renderer: IRenderer<any>;

    public get loader() {
        return this._loader;
    }

    public get gameManager() {
        return this._gameManager;
    }

    public get managedObjectRepository() {
        return this._managedObjectRepository;
    }

    public get id() {
        return this._id;
    }

    constructor(options: ApplicationOptions = {}) {
        this._id = options.id || generateRandomString();
        this.__ccLock = new __ComponentCreationLock();
        this._managedObjectRepository = new ManagedObjectRepository();
        this.renderer = options.renderer || new Renderer(options.renderer);

        if ((this.renderer as Renderer).context) {
            this._loader = new ResourceLoader(this.renderer as Renderer);
            this._gameManager = new GameManager(this.renderer, this._loader);
        } else {
            this._loader = undefined as any;
            this._gameManager = undefined as any;
        }

    }

    public snapshot(): Application {
        const cloneApp = new Application({ renderer: this.renderer });

        cloneApp._managedObjectRepository = deserialize(this.managedObjectRepository.getSerializableObject(), { application: cloneApp });

        return cloneApp;
    }

    public getSerializableObject(): SerializableApplication {
        return {
            _ctor: Application.name,
            id: this._id,
            renderer: this.renderer.getSerializableObject(),
            objectRepository: this.managedObjectRepository.getSerializableObject()
        }
    }
}

registerDeserializable(Application);