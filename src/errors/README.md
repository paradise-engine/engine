# Paradise Engine Errors

| Error Class                             | Error Description                                                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [ParadiseError]                         | Base class for all engine errors                                                                                 |
| [AbstractRendererError]                 | Occurs when `Renderer` component is used directly or it's `getPrimitive` function is not overridden in sub-class |
| [ApplicationInitializedError]           | `Application.initializeApplication` is called although Application is initialzed already                         |
| [ApplicationNotInitializedError]        | Tried to access `Application.instance` before calling `Application.initializeApplication`                        |
| [BrowserApiError]                       | Occurs when an operation that needs a Browser API executes in an non-browser environment                         |
| [ColorComponentOutOfBoundsError]        | A RGBA-component of a `Color` was set to an invalid number                                                       |
| [DestroyBoundTransformError]            | A Transform object is destroyed before its GameObject is destroyed                                               |
| [DuplicateGameObjectError]              | A GameObject is added to a Scene it already belongs to                                                           |
| [HierarchyInconsistencyError]           | A GameObject that is another Object's child is added to a Scene                                                  |
| [InactiveShaderError]                   | A native WebGL draw function is called with a Shader that is set to inactive                                     |
| [InvalidControlTypeError]               | `Control` decorator is added to a member whose type is neither primitive nor decorated with `ControlType`        |
| [InvalidHexCodeError]                   | A `Color` was set to an invalid hex code                                                                         |
| [LifecycleError]                        | An error that occured during the main game loop and indicates that the application has run into an invalid state |
| [ManagedObjectDestroyedError]           | An already destroyed ManagedObject or its members is accessed                                                    |
| [ManagedObjectNotFoundError]            | Tried to access an object that is not managed by the object repository                                           |
| [MaskLayerOutOfBoundsError]             | Exceeded maximum of interactive objects that can be drawn per frame (`16,777,216`)                               |
| [MicroEmitterDuplicateListenerError]    | Tried to add already registered listener to a `MicroTarget` using a different type than previously               |
| [MultipleTransformsError]               | A Transform is being added to a GameObject that already owns one                                                 |
| [ObjectNotFoundError]                   | A GameObject that does not exist in a Scene is accessed in the Scene's context                                   |
| [RenderPipelineRanOutOfContainersError] | The render pipeline's `closeContainer()` method is called although there is no open container                    |
| [RenderingContextError]                 | A low-level WebGL error occurred                                                                                 |
| [ResourceLoaderError]                   | An error related to resource management                                                                          |
| [RuntimeInconsistencyError]             | A fatal engine error ocurred during runtime, usually because external code misused internal APIs                 |
| [SceneLoadError]                        | An error ocurred while loading or transitioning a scene                                                          |
| [SingletonConstraintViolationError]     | A singleton class has been instantiated more than once                                                           |
| [UnknownDeserializableError]            | Attempted to deserialize object whose deserializer class has not been registered                                 |

[paradiseerror]: ./paradise-error.ts
[abstractrenderererror]: ./abstract-renderer.ts
[applicationinitializederror]: ./application-initialized.ts
[applicationnotinitializederror]: ./application-not-initialized.ts
[browserapierror]: ./browser-api.ts
[colorcomponentoutofboundserror]: ./color-component-out-of-bounds.ts
[destroyboundtransformerror]: ./destroy-bound-transform.ts
[duplicategameobjecterror]: ./duplicate-game-object.ts
[hierarchyinconsistencyerror]: ./hierarchy-inconsistency.ts
[inactiveshadererror]: ./inactive-shader.ts
[invalidcontroltypeerror]: './invalid-control-type.ts
[invalidhexcodeerror]: './invalid-hex-code.ts'
[lifecycleerror]: './lifecycle-error.ts'
[managedobjectdestroyederror]: ./managed-object-destroyed.ts
[managedobjectnotfounderror]: ./managed-object-not-found.ts
[masklayeroutofboundserror]: ./mask-layer-out-of-bounds.ts
[microemitterduplicatelistenererror]: ./micro-emitter-duplicate-listener.ts
[multipletransformserror]: ./multiple-transforms.ts
[objectnotfounderror]: ./object-not-found.ts
[renderpipelineranoutofcontainerserror]: ./render-pipeline-ran-out-of-containers.ts
[renderingcontexterror]: ./rendering-context.ts
[resourceloadererror]: ./resource-loader.ts
[runtimeinconsistencyerror]: ./runtime-inconsistency.ts
[sceneloaderror]: ./scene-load.ts
[singletonconstraintviolationerror]: ./singleton-constraint-violation.ts
[unknowndeserializableerror]: './unknown-deserializable.ts
