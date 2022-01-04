import { generateRandomString } from "./util";
import { ManagedObjectRepository, SerializableManagedObjectRepository } from "./core";
import { IRenderer, Renderer } from "./renderer";
import { RuntimeInconsistencyError } from "./errors";
import { __ComponentCreationLock } from "./core/component-creation-lock";
import { GameManager } from "./lifecycle";
import { IResourceLoader, ResourceLoader } from "./resource";
import { DeserializationOptions, deserialize, ISerializable, registerDeserializable, SerializableObject } from "./serialization";
import { IInputManager, InputManager } from "./input";

export interface ApplicationOptions {
    id?: string;
    renderer?: IRenderer<any>;
    loader?: IResourceLoader<any>;
    gameManager?: GameManager;
    managedObjectRepository?: ManagedObjectRepository;
    inputManager?: IInputManager;
}

export interface SerializableApplication extends SerializableObject {
    id: string;
    renderer: SerializableObject;
    loader: SerializableObject;
    objectRepository: SerializableManagedObjectRepository;
}

export class Application implements ISerializable<SerializableApplication> {

    public static fromSerializable(s: SerializableApplication, options: DeserializationOptions) {
        const app = new Application({
            renderer: deserialize(s.renderer, options) as IRenderer<any>,
            loader: deserialize(s.loader, options) as IResourceLoader<any>
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
    private _loader: IResourceLoader<any>;
    private _gameManager: GameManager;
    private _managedObjectRepository: ManagedObjectRepository;
    private _renderer: IRenderer<any>;
    private _inputManager: IInputManager;

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

    public get renderer() {
        return this._renderer;
    }

    public get inputManager() {
        return this._inputManager;
    }

    constructor(options: ApplicationOptions = {}) {
        this._id = options.id || generateRandomString();
        this.__ccLock = new __ComponentCreationLock();
        this._managedObjectRepository = new ManagedObjectRepository();
        this._renderer = options.renderer || new Renderer(options.renderer);
        this._loader = options.loader || new ResourceLoader(this.renderer as Renderer);
        this._gameManager = new GameManager(this._loader);
        this._inputManager = options.inputManager || new InputManager(this);
    }

    public setRenderer(renderer: IRenderer<any>) {
        this._renderer = renderer;

        if ((renderer as Renderer).context && !this.loader) {
            this._loader = new ResourceLoader(renderer as Renderer);
        }

        if (this.loader) {
            this.loader.setRenderer(renderer as Renderer);
        }
    }

    public setLoader(loader: ResourceLoader) {
        this._loader = loader;
        this._gameManager = new GameManager(this.loader);
    }

    public setManagedObjectRepo(repo: ManagedObjectRepository) {
        this._managedObjectRepository = repo;
    }

    public setGameManager(gm: GameManager) {
        this._gameManager = gm;
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
            loader: this.loader.getSerializableObject(),
            objectRepository: this.managedObjectRepository.getSerializableObject()
        }
    }
}

registerDeserializable(Application);