import { generateRandomString } from "./util";
import { ManagedObjectRepository, SerializableManagedObjectRepository } from "./core";
import { IRenderPipeline, WebGLRenderPipeline } from "./graphics";
import { RuntimeInconsistencyError } from "./errors";
import { __ComponentCreationLock } from "./core/component-creation-lock";
import { GameManager } from "./lifecycle";
import { IResourceLoader, ResourceLoader } from "./resource";
import { DeserializationOptions, deserialize, ISerializable, registerDeserializable, SerializableObject } from "./serialization";
import { IInputManager, InputManager } from "./input";

export interface ApplicationOptions {
    id?: string;
    renderPipeline?: IRenderPipeline;
    loader?: IResourceLoader<any>;
    gameManager?: GameManager;
    managedObjectRepository?: ManagedObjectRepository;
    inputManager?: IInputManager;
}

export interface SerializableApplication extends SerializableObject {
    id: string;
    renderPipeline: SerializableObject;
    loader: SerializableObject;
    objectRepository: SerializableManagedObjectRepository;
}

export class Application implements ISerializable<SerializableApplication> {

    public static fromSerializable(s: SerializableApplication, options: DeserializationOptions) {
        const app = new Application({
            renderPipeline: deserialize(s.renderPipeline, options) as IRenderPipeline,
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
    private _renderPipeline: IRenderPipeline;
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

    public get renderPipeline() {
        return this._renderPipeline;
    }

    public get inputManager() {
        return this._inputManager;
    }

    constructor(options: ApplicationOptions = {}) {
        this._id = options.id || generateRandomString();
        this.__ccLock = new __ComponentCreationLock();
        this._managedObjectRepository = new ManagedObjectRepository();
        this._renderPipeline = options.renderPipeline || new WebGLRenderPipeline(options.renderPipeline);
        this._loader = options.loader || new ResourceLoader(this.renderPipeline as WebGLRenderPipeline);
        this._gameManager = new GameManager(this._loader, this._renderPipeline);
        this._inputManager = options.inputManager || new InputManager(this);
    }

    public setRenderPipeline(pipeline: IRenderPipeline<any>) {
        this._renderPipeline = pipeline;

        if ((pipeline as WebGLRenderPipeline).context && !this.loader) {
            this._loader = new ResourceLoader(pipeline as WebGLRenderPipeline);
        }

        if (this.loader) {
            this.loader.setRenderPipeline(pipeline as WebGLRenderPipeline);
        }

        this._gameManager = new GameManager(this.loader, this._renderPipeline);
    }

    public setLoader(loader: ResourceLoader) {
        this._loader = loader;
        this._gameManager = new GameManager(this.loader, this._renderPipeline);
    }

    public setManagedObjectRepo(repo: ManagedObjectRepository) {
        this._managedObjectRepository = repo;
    }

    public setGameManager(gm: GameManager) {
        this._gameManager = gm;
    }

    public snapshot(): Application {
        const cloneApp = new Application({ renderPipeline: this.renderPipeline });

        cloneApp._managedObjectRepository = deserialize(this.managedObjectRepository.getSerializableObject(), { application: cloneApp });

        return cloneApp;
    }

    public getSerializableObject(): SerializableApplication {
        return {
            _ctor: Application.name,
            id: this._id,
            renderPipeline: this.renderPipeline.getSerializableObject(),
            loader: this.loader.getSerializableObject(),
            objectRepository: this.managedObjectRepository.getSerializableObject()
        }
    }
}

registerDeserializable(Application);