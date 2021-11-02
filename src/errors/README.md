# Paradise Engine Errors

| Error Class                       | Error Description                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| [ParadiseError]                   | Base class for all engine errors                                                                 |
| [DestroyBoundTransformError]      | A Transform object is destroyed before its GameObject is destroyed                               |
| [DuplicateGameObjectError]        | A GameObject is added to a Scene it already belongs to                                           |
| [HierarchyInconsistencyError]     | A GameObject that is another Object's child is added to a Scene                                  |
| [InactiveShaderError]             | A native WebGL draw function is called with a Shader that is set to inactive                     |
| [ManagedObjectDestroyedError]     | An already destroyed ManagedObject or its members is accessed                                    |
| [MultipleTransformsError]         | A Transform is being added to a GameObject that already owns one                                 |
| [ObjectNotFoundError]             | A GameObject that does not exist in a Scene is accessed in the Scene's context                   |
| [RendererRanOutOfContainersError] | Renderer's `closeContainer()` method is called although there is no open container               |
| [RenderingContextError]           | A low-level WebGL error occurred                                                                 |
| [ResourceLoaderError]             | An error ocurred while loading a resource                                                        |
| [RuntimeInconsistencyError]       | A fatal engine error ocurred during runtime, usually because external code misused internal APIs |
| [UnknownDeserializableError]      | Attempted to deserialize object whose deserializer class has not been registered                 |

[paradiseerror]: ./paradise-error.ts
[destroyboundtransformerror]: ./destroy-bound-transform.ts
[duplicategameobjecterror]: ./duplicate-game-object.ts
[hierarchyinconsistencyerror]: ./hierarchy-inconsistency.ts
[inactiveshadererror]: ./inactive-shader.ts
[managedobjectdestroyederror]: ./managed-object-destroyed.ts
[multipletransformserror]: ./multiple-transforms.ts
[objectnotfounderror]: ./object-not-found.ts
[rendererranoutofcontainerserror]: ./renderer-ran-out-of-containers.ts
[renderingcontexterror]: ./rendering-context.ts
[resourceloadererror]: ./resource-loader.ts
[runtimeinconsistencyerror]: ./runtime-inconsistency.ts
[unknowndeserializableerror]: './unknown-deserializable.ts
