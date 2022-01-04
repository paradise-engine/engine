# paradise-engine/graphics/webgl

Contains boilerplate code for WebGL.

## Extensions

Interesting extensions to evaluate:

### Debug-purpose extensions

- [WEBGL_debug_renderer_info](https://www.khronos.org/registry/webgl/extensions/WEBGL_debug_renderer_info/) - exposes `RENDERER` and `VENDOR` strings of the underlying graphics driver for debug purposes
- [WEBGL_debug_shaders](https://www.khronos.org/registry/webgl/extensions/WEBGL_debug_shaders/) - GLSL is translated to host platform's native language (HLSL, GLSL etc.). This extension exposes the `getTranslatedShaderSource` function that exposes the translated shader sources.
- [EXT_disjoint_timer_query](https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/) - provides functionality to query the time a set of GL operations took. Could be used for benchmark/diagnostics/debug reasons, but also for adaptive level of detail during runtime.
