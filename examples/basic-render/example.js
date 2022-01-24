const app = new Application({ debugMode: true });

document.body.onload = () => {
    const container = document.getElementById('container');
    container.appendChild(app.renderPipeline.view);
}

function _drawBasicBase64() {
    const dataUrl = document.getElementById('basic_base_img').innerHTML.trim();
    const vsSource = document.getElementById('default_vertex_shader').innerHTML;
    const fsSource = document.getElementById('default_fragment_shader').innerHTML;
    const imgPreview = document.getElementById('img_preview');

    console.log(dataUrl);

    const context = app.renderPipeline.context;
    /**
     * @type {WebGLRenderingContext}
     */
    const gl = context._glContext;
    const shaderDeb = gl.getExtension('WEBGL_debug_shaders');
    const getTranslatedShaderSource = shaderDeb.getTranslatedShaderSource;


    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://www.cccreationsusa.com/wp-content/uploads/2017/10/apple-touch-icon-192x192.png';

    imgPreview.appendChild(img);

    img.onload = () => {

        /**
         * SHADER SHIT
         */

        const vsShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vsShader, vsSource);

        const fsShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fsShader, fsSource);

        gl.compileShader(vsShader);
        gl.compileShader(fsShader);

        const program = gl.createProgram();

        gl.attachShader(program, vsShader);
        gl.attachShader(program, fsShader);

        // link the program.
        gl.linkProgram(program);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');

        const matrixLocation = gl.getUniformLocation(program, "u_matrix");
        const textureMatrixLocation = gl.getUniformLocation(program, "u_textureMatrix");
        const textureLocation = gl.getUniformLocation(program, "u_texture");

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1
        ]), gl.STATIC_DRAW);

        const texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1
        ]), gl.STATIC_DRAW);




        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, img);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // const sp = new Shader(context, vsSource, fsSource, app.renderPipeline.globalShaderData.bufferInfo);

        gl.clear(gl.COLOR_BUFFER_BIT);

        // gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.useProgram(program);

        //console.log('VERTEX', getTranslatedShaderSource(sp.internals.vertexShader.shader));
        //console.log('FRAGMENT', getTranslatedShaderSource(sp.internals.fragmentShader.shader))

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.enableVertexAttribArray(texcoordLocation);
        gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

        const options = {
            textureWidth: 192,
            textureHeight: 192,
            destinationX: 100,
            destinationY: 100
        }

        if (options.destinationWidth === undefined) {
            options.destinationWidth = options.textureWidth;
        }

        if (options.destinationHeight === undefined) {
            options.destinationHeight = options.textureHeight;
        }

        if (options.sourceX === undefined) {
            options.sourceX = 0;
        }

        if (options.sourceY === undefined) {
            options.sourceY = 0;
        }

        if (options.sourceWidth === undefined) {
            options.sourceWidth = options.textureWidth;
        }

        if (options.sourceHeight === undefined) {
            options.sourceHeight = options.textureHeight;
        }

        if (options.rotationRadian === undefined) {
            options.rotationRadian = 0;
        }

        if (options.rotationOffsetX === undefined) {
            options.rotationOffsetX = 0;
        }

        if (options.rotationOffsetY === undefined) {
            options.rotationOffsetY = 0;
        }

        const mat4 = glMatrix.mat4;

        const scaleX = options.sourceWidth / options.destinationWidth;
        const scaleY = options.sourceHeight / options.destinationHeight;

        const rotationOffsetMatrix = mat4.create();
        mat4.fromRotation(rotationOffsetMatrix, options.rotationRadian, [0, 0, 1]);
        mat4.translate(rotationOffsetMatrix, rotationOffsetMatrix, [-options.rotationOffsetX / scaleX, -options.rotationOffsetY / scaleY, 0]);

        const matrix = mat4.create();
        mat4.ortho(matrix, 0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
        mat4.translate(matrix, matrix, [options.destinationX, options.destinationY, 0]);
        mat4.rotate(matrix, matrix, options.rotationRadian, [0, 0, 1]);
        mat4.multiply(matrix, matrix, rotationOffsetMatrix);
        mat4.scale(matrix, matrix, [options.destinationWidth, options.destinationHeight, 1]);

        const texMatrix = mat4.create();
        mat4.fromTranslation(texMatrix, [options.sourceX / options.textureWidth, options.sourceY / options.textureHeight, 0]);
        mat4.scale(texMatrix, texMatrix, [options.sourceWidth / options.textureWidth, options.sourceHeight / options.textureHeight, 1]);

        gl.uniformMatrix4fv(matrixLocation, false, matrix);
        gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);

        gl.uniform1i(textureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);


        // context.drawImage({
        //     shader: sp,
        //     globalUniforms: {},
        //     texture: { texture: texture },
        //     textureWidth: 192,
        //     textureHeight: 192,
        //     destinationX: 100,
        //     destinationY: 100
        // });
    }
}

function drawBasicBase64() {
    const dataUrl = document.getElementById('basic_base_img').innerHTML.trim();
    const vsSource = document.getElementById('default_vertex_shader').innerHTML;
    const fsSource = document.getElementById('default_fragment_shader').innerHTML;
    const imgPreview = document.getElementById('img_preview');

    console.log(dataUrl);

    const context = app.renderPipeline.context;
    app.loader.add(dataUrl, 'IMG', resource => {
        imgPreview.appendChild(resource.sourceElement);
        const shader = app.renderPipeline.baseShader;

        context.drawImage({
            shader: shader,
            globalUniforms: {},
            texture: resource.texture.nativeTexture,
            textureWidth: 192,
            textureHeight: 192,
            destinationX: 0,
            destinationY: 0
        });
    });
    app.loader.load();
}