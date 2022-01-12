import { promises as fs } from 'fs';
import nodePath from 'path';
import {
    AppendFileOptions,
    DeleteFileOptions,
    FileEncoding,
    IFileSystem,
    MakeDirOptions,
    ReadFileOptions,
    RemoveDirOptions,
    WriteFileOptions
} from './i-file-system';

const _fileSystem: IFileSystem = {

    readFile: async function (path: string, options?: ReadFileOptions): Promise<string> {
        options = options || {};
        options.encoding = options.encoding || FileEncoding.UTF8;

        return await fs.readFile(path, { encoding: options.encoding });
    },

    writeFile: async function (path: string, data: string, options?: WriteFileOptions): Promise<void> {
        options = options || {};
        options.encoding = options.encoding || FileEncoding.UTF8;
        options.recursive = options.recursive || false;

        if (options.recursive) {
            const dirname = nodePath.dirname(path);
            await this.mkdir(dirname, { recursive: true });
        }

        await fs.writeFile(path, data, { encoding: options.encoding });
    },

    appendFile: async function (path: string, data: string, options?: AppendFileOptions): Promise<void> {
        options = options || {};
        options.encoding = options.encoding || FileEncoding.UTF8;
        options.recursive = options.recursive || false;

        if (options.recursive) {
            const dirname = nodePath.dirname(path);
            await this.mkdir(dirname, { recursive: true });
        }

        await fs.appendFile(path, data, { encoding: options.encoding });
    },

    deleteFile: async function (path: string, options?: DeleteFileOptions): Promise<void> {
        await fs.unlink(path);
    },

    mkdir: async function (path: string, options?: MakeDirOptions): Promise<void> {
        options = options || {};
        options.recursive = options.recursive || false;

        await fs.mkdir(path, { recursive: options.recursive });
    },

    rmdir: async function (path: string, options?: RemoveDirOptions): Promise<void> {
        options = options || {};
        options.recursive = options.recursive || false;

        await fs.rm(path, { recursive: options.recursive, force: options.recursive });
    }
}

export default _fileSystem;