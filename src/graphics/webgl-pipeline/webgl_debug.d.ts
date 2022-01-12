export declare interface IWebGLDebugUtils {
    /**
     * Initializes this module. Safe to call more than once.
     * @param ctx A WebGL context. If
     *    you have more than one context it doesn't matter which one
     *    you pass in, it is only used to pull out constants.
     */
    init(ctx: WebGLRenderingContext): void;

    /**
     * Returns true or false if value matches any WebGL enum
     * @param value Value to check if it might be an enum.
     * @return True if value matches one of the WebGL defined enums
     */
    mightBeEnum(value: any): boolean;

    /**
     * Gets an string version of an WebGL enum.
     *
     * Example:
     *   WebGLDebugUtil.init(ctx);
     *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
     *
     * @param value Value to return an enum for
     * @return The string version of the enum.
     */
    glEnumToString(value: number): string;

    /**
     * Converts the argument of a WebGL function to a string.
     * Attempts to convert enum arguments to strings.
     *
     * Example:
     *   WebGLDebugUtil.init(ctx);
     *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 2, 0, gl.TEXTURE_2D);
     *
     * would return 'TEXTURE_2D'
     *
     * @param functionName the name of the WebGL function.
     * @param numArgs The number of arguments
     * @param argumentIndx the index of the argument.
     * @param value The value of the argument.
     * @return The value as a string.
     */
    glFunctionArgToString(functionName: string, numArgs: number, argumentIndx: number, value: any): string;

    /**
     * Converts the arguments of a WebGL function to a string.
     * Attempts to convert enum arguments to strings.
     *
     * @param functionName the name of the WebGL function.
     * @param args The arguments.
     * @return The arguments as a string.
     */
    glFunctionArgsToString(functionName: string, args: number): string;

    /**
     * Given a WebGL context returns a wrapped context that calls
     * gl.getError after every command and calls a function if the
     * result is not NO_ERROR.
     *
     * You can supply your own function if you want. For example, if you'd like
     * an exception thrown on any GL error you could do this
     *
     *    function throwOnGLError(err, funcName, args) {
     *      throw WebGLDebugUtils.glEnumToString(err) +
     *            " was caused by call to " + funcName;
     *    };
     *
     *    ctx = WebGLDebugUtils.makeDebugContext(
     *        canvas.getContext("webgl"), throwOnGLError);
     *
     * @param ctx The webgl context to wrap.
     * @param opt_onErrorFunc The function
     *     to call when gl.getError returns an error. If not specified the default
     *     function calls console.log with a message.
     * @param opt_onFunc The
     *     function to call when each webgl function is called. You
     *     can use this to log all calls for example.
     */
    makeDebugContext(
        ctx: WebGLRenderingContext,
        opt_onErrorFunc?: (err: Error, funcName: string, args: any[]) => void,
        opt_onFunc?: (funcName: string, args: any[]) => void
    ): WebGLRenderingContext;

    /**
     * Given a canvas element returns a wrapped canvas element that will
     * simulate lost context. The canvas returned adds the following functions.
     *
     * loseContext:
     *   simulates a lost context event.
     *
     * restoreContext:
     *   simulates the context being restored.
     *
     * lostContextInNCalls:
     *   loses the context after N gl calls.
     *
     * getNumCalls:
     *   tells you how many gl calls there have been so far.
     *
     * setRestoreTimeout:
     *   sets the number of milliseconds until the context is restored
     *   after it has been lost. Defaults to 0. Pass -1 to prevent
     *   automatic restoring.
     *
     * @param canvas The canvas element to wrap.
     */
    makeLostContextSimulatingCanvas(canvas?: HTMLCanvasElement): void;

    /**
     * Resets a context to the initial state.
     * @param ctx The webgl context to
     *     reset.
     */
    resetToInitialState(ctx: WebGLRenderingContext): void;
}

declare const WebGLDebugUtils: IWebGLDebugUtils;
export {
    WebGLDebugUtils
}