# Paradise Engine Errors

| Error Class                         | Error Description                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [ColorComponentOutOfBoundsError]    | A RGBA-component of a `Color` was set to an invalid number                                                |
| [ParadiseError]                     | Base class for all engine errors                                                                          |
| [DestroyBoundTransformError]        | A Transform object is destroyed before its GameObject is destroyed                                        |
| [DuplicateGameObjectError]          | A GameObject is added to a Scene it already belongs to                                                    |
| [HierarchyInconsistencyError]       | A GameObject that is another Object's child is added to a Scene                                           |
| [InactiveShaderError]               | A native WebGL draw function is called with a Shader that is set to inactive                              |
| [InvalidControlTypeError]           | `Control` decorator is added to a member whose type is neither primitive nor decorated with `ControlType` |
| [InvalidHexCodeError]               | A `Color` was set to an invalid hex code                                                                  |
| [ManagedObjectDestroyedError]       | An already destroyed ManagedObject or its members is accessed                                             |
| [MultipleTransformsError]           | A Transform is being added to a GameObject that already owns one                                          |
| [ObjectNotFoundError]               | A GameObject that does not exist in a Scene is accessed in the Scene's context                            |
| [RendererRanOutOfContainersError]   | Renderer's `closeContainer()` method is called although there is no open container                        |
| [RenderingContextError]             | A low-level WebGL error occurred                                                                          |
| [ResourceLoaderError]               | An error ocurred while loading a resource                                                                 |
| [RuntimeInconsistencyError]         | A fatal engine error ocurred during runtime, usually because external code misused internal APIs          |
| [SceneLoadError]                    | An error ocurred while loading or transitioning a scene                                                   |
| [SingletonConstraintViolationError] | A singleton class has been instantiated more than once                                                    |
| [UnknownDeserializableError]        | Attempted to deserialize object whose deserializer class has not been registered                          |

[paradiseerror]: ./paradise-error.ts
[colorcomponentoutofboundserror]: ./color-component-out-of-bounds.ts
[destroyboundtransformerror]: ./destroy-bound-transform.ts
[duplicategameobjecterror]: ./duplicate-game-object.ts
[hierarchyinconsistencyerror]: ./hierarchy-inconsistency.ts
[inactiveshadererror]: ./inactive-shader.ts
[invalidcontroltypeerror]: './invalid-control-type.ts
[invalidhexcodeerror]: './invalid-hex-code.ts'
[managedobjectdestroyederror]: ./managed-object-destroyed.ts
[multipletransformserror]: ./multiple-transforms.ts
[objectnotfounderror]: ./object-not-found.ts
[rendererranoutofcontainerserror]: ./renderer-ran-out-of-containers.ts
[renderingcontexterror]: ./rendering-context.ts
[resourceloadererror]: ./resource-loader.ts
[runtimeinconsistencyerror]: ./runtime-inconsistency.ts
[sceneloaderror]: ./scene-load.ts
[singletonconstraintviolationerror]: ./singleton-constraint-violation.ts
[unknowndeserializableerror]: './unknown-deserializable.ts
