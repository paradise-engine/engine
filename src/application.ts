import { generateRandomString } from "./util";
import { Camera, GameObject, ManagedObjectRepository, SerializableManagedObjectRepository } from "./core";
import { IRenderPipeline, WebGLRenderPipeline } from "./graphics";
import { RuntimeInconsistencyError } from "./errors";
import { __ComponentCreationLock } from "./core/component-creation-lock";
import { GameManager } from "./lifecycle";
import { IResourceLoader, ResourceLoader } from "./resource";
import { DeserializationOptions, deserialize, ISerializable, registerDeserializable, SerializableObject } from "./serialization";
import { IInputManager, InputManager } from "./input";
import { CommonGizmos, createCommonGizmos } from "./editor";
import { editor_camera_obj } from "./editor/_editor-camera";

export interface ApplicationEditorModeOptions { }

export interface ApplicationOptions {
    id?: string;
    renderPipeline?: IRenderPipeline;
    loader?: IResourceLoader<any>;
    gameManager?: GameManager;
    managedObjectRepository?: ManagedObjectRepository;
    inputManager?: IInputManager;
    debugMode?: boolean;
    editorMode?: ApplicationEditorModeOptions;
}

export interface SerializableApplication extends SerializableObject {
    id: string;
    renderPipeline: SerializableObject;
    loader: SerializableObject;
    objectRepository: SerializableManagedObjectRepository;
    inputManager: SerializableObject;
}

export class Application implements ISerializable<SerializableApplication> {

    public static fromSerializable(s: SerializableApplication, options: DeserializationOptions) {
        const loader = deserialize(s.loader, options) as IResourceLoader<any>;

        const app = new Application({
            renderPipeline: loader.renderPipeline,
            loader: loader,
        });

        app._managedObjectRepository = deserialize(s.objectRepository, options);
        app._inputManager = deserialize(s.inputManager, options) as unknown as IInputManager;
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
    private _editorMode?: boolean = false;
    private _commonGizmos?: CommonGizmos;
    private _editorCamera?: GameObject;

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

    public get editorMode() {
        return this._editorMode;
    }

    public get commonGizmos() {
        return this._commonGizmos;
    }

    constructor(options: ApplicationOptions = {}) {

        if (options.editorMode) {
            this._editorMode = true;
        }

        this._id = options.id || generateRandomString();
        this.__ccLock = new __ComponentCreationLock();
        this._managedObjectRepository = new ManagedObjectRepository();
        this._renderPipeline = options.renderPipeline || new WebGLRenderPipeline({
            ...(options.renderPipeline || {}),
            debugMode: options.debugMode
        });
        this._loader = options.loader || new ResourceLoader(this.renderPipeline as WebGLRenderPipeline);
        this._gameManager = new GameManager(this, this._loader, this._renderPipeline, undefined, options.debugMode);
        this._inputManager = options.inputManager || new InputManager(this);

        if (options.editorMode) {
            this._loader.ready(() => {
                this._commonGizmos = createCommonGizmos(this);
                this._editorCamera = deserialize(editor_camera_obj, { application: this });
                const camComp = this._editorCamera.getComponent(Camera);
                if (camComp) {
                    this._gameManager.setEditorCamera(camComp);
                }
            });
        }
    }

    public setRenderPipeline(pipeline: IRenderPipeline<any>) {
        this._renderPipeline = pipeline;

        if (pipeline instanceof WebGLRenderPipeline && !this.loader) {
            this._loader = new ResourceLoader(pipeline as WebGLRenderPipeline);
        }

        if (this.loader) {
            this.loader.setRenderPipeline(pipeline as WebGLRenderPipeline);
        }

        this._gameManager.setRenderPipeline(pipeline);
    }

    public setLoader(loader: ResourceLoader) {
        this._loader = loader;
        this._gameManager.setLoader(loader);
    }

    public setManagedObjectRepo(repo: ManagedObjectRepository) {
        this._managedObjectRepository = repo;

        if (this.editorMode) {
            this._loader.ready(() => {
                if (this._commonGizmos) {
                    this._commonGizmos.move.destroy();
                }
                this._commonGizmos = createCommonGizmos(this);
            });
        }
    }

    public setGameManager(gm: GameManager) {
        this._gameManager = gm;
    }

    public setInputManager(im: InputManager) {
        this._inputManager = im;
    }

    public getSerializableObject(): SerializableApplication {
        return {
            _ctor: Application.name,
            id: this._id,
            renderPipeline: this.renderPipeline.getSerializableObject(),
            loader: this.loader.getSerializableObject(),
            objectRepository: this.managedObjectRepository.getSerializableObject(),
            inputManager: (this.inputManager as unknown as ISerializable<SerializableObject>).getSerializableObject()
        }
    }
}

registerDeserializable(Application);