const DEBUG_MSG_CSS_TAG = 'background: #106BA3; border-radius: 3px; padding: 2px 4px; color: #ffffff; font-weight: 700; margin-right: 8px;'
const DEBUG_MSG_CSS_NOTAG = 'background: #752F75; border-radius: 3px; padding: 2px 4px; color: #ffffff; font-weight: 700; margin-right: 8px;'
const DEBUG_MSG_CSS_TEXT = 'font-weight: 700';
const DEBUG_MSG_CSS_WARN = 'color: #C22762; font-weight: 700';

let enableLog = true;

function getStack() {
    const err = new Error();
    return err.stack;
}

/**
 * Taggs a context with a name and number for debugging purposes.
 * @param ctx The context to tag
 */
export function tagContext(ctx: WebGLRenderingContext) {
    let contexts: Map<WebGLRenderingContext, string> = (window as any).__paradise_webgl_contexts;
    if (!contexts) {
        contexts = new Map();
        (window as any).__paradise_webgl_contexts = contexts;
    }

    if (!contexts.has(ctx)) {
        const tag = `GL_CTX ${contexts.size}`;
        contexts.set(ctx, tag);

        if (enableLog) {
            console.groupCollapsed(`%cCreated WebGL Context Tag %c${tag}`, DEBUG_MSG_CSS_TEXT, DEBUG_MSG_CSS_TAG);
            console.log(getStack());
            console.groupEnd();
        }
    }
}

function getTag(ctx: WebGLRenderingContext) {
    let contexts: Map<WebGLRenderingContext, string> = (window as any).__paradise_webgl_contexts;
    if (!contexts) {
        contexts = new Map();
        (window as any).__paradise_webgl_contexts = contexts;
    }

    const tag = contexts.get(ctx);
    if (!tag) {
        return null;
    }
    return tag;
}

export function taggedMessage(ctx: WebGLRenderingContext, text: string, check: boolean, ...attachedObjects: any[]) {
    if (enableLog) {
        const tag = getTag(ctx);
        if (!tag) {
            console.groupCollapsed(`%cNO_TAG %c${text}`, DEBUG_MSG_CSS_NOTAG, DEBUG_MSG_CSS_TEXT, ...attachedObjects);
        } else {
            console.groupCollapsed(`%c${tag} %c${text}`, DEBUG_MSG_CSS_TAG, DEBUG_MSG_CSS_TEXT, ...attachedObjects);
        }

        console.log(getStack());
        console.groupEnd();

        if (check) {
            const obj = getObjects(ctx);
            for (const ao of attachedObjects) {
                if (!obj.includes(ao)) {
                    console.groupCollapsed(`%c\t--> Object not registered for context`, DEBUG_MSG_CSS_WARN, ao);
                    console.log(getStack());
                    console.groupEnd();
                }
            }
        }
    }
}

export function registerContextObject(ctx: WebGLRenderingContext, object: any, message?: string) {
    let objMap: Map<WebGLRenderingContext, any[]> = (window as any).__paradise_webgl_contextObjects;
    if (!objMap) {
        objMap = new Map();
        (window as any).__paradise_webgl_contextObjects = objMap;
    }

    let ctxObjects = objMap.get(ctx);
    if (!ctxObjects) {
        ctxObjects = [];
    }

    ctxObjects.push(object);
    objMap.set(ctx, ctxObjects);

    taggedMessage(ctx, message || 'Created & Registered GL Context Object', object);
}

export function getObjects(ctx: WebGLRenderingContext) {
    let objMap: Map<WebGLRenderingContext, any[]> = (window as any).__paradise_webgl_contextObjects;
    if (!objMap) {
        objMap = new Map();
        (window as any).__paradise_webgl_contextObjects = objMap;
    }

    const objects = objMap.get(ctx);
    if (!objects) {
        return [];
    }

    return objects;
}

export function printObjects(ctx: WebGLRenderingContext) {
    const objects = getObjects(ctx);
    if (!objects || objects.length === 0) {
        taggedMessage(ctx, 'NO OBJECTS', false);
    } else {
        taggedMessage(ctx, 'PRINTING ALL OBJECTS:', false, objects);
    }
}

try {
    (window as any).__paradise_webgl_debug = {
        printAllContexts: () => {
            const contexts: Map<WebGLRenderingContext, string> = (window as any).__paradise_webgl_contexts;
            if (!contexts || contexts.size === 0) {
                console.log('No Contexts');
            }

            for (const [ctx] of contexts) {
                printObjects(ctx);
            }
        },
        enableLogging: () => {
            enableLog = true
        },
        disableLogging: () => {
            enableLog = false
        },
        textureToDataUrl: (gl: WebGLRenderingContext, texture: WebGLTexture, width: number, height: number) => {
            // Create a framebuffer backed by the texture
            var framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

            // Read the contents of the framebuffer
            var data = new Uint8Array(width * height * 4);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

            gl.deleteFramebuffer(framebuffer);

            // Create a 2D canvas to store the result 
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext('2d') as CanvasRenderingContext2D;

            // Copy the pixels to a 2D canvas
            var imageData = context.createImageData(width, height);
            imageData.data.set(data);
            context.putImageData(imageData, 0, 0);
            return canvas.toDataURL();
        }
    }
} catch (err) {
    console.warn('Could not bind WebGL debug functions to window: ' + (err as any).message || err);
}