import path from 'path';
import { Configuration, NormalModuleReplacementPlugin } from 'webpack';

const config: Configuration = {
    entry: './src/index.ts',
    devtool: 'source-map',
    optimization: {
        minimize: false,
    },
    mode: 'development',
    plugins: [
        new NormalModuleReplacementPlugin(
            /(.*)-PLATFORM_TARGET(\.*)/,
            function (resource) {
                resource.request = resource.request.replace(
                    /-PLATFORM_TARGET/,
                    '-editor'
                )
            }
        )
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader']
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                use: ['source-map-loader']
            },
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: "tsconfig.json"
                    }
                }],
                exclude: /node_modules/,
            },
            {
                test: /\.(vert|frag)/,
                type: 'asset/source',
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        globalObject: 'this'
    }
}

export default config;