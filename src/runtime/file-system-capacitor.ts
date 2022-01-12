import { Filesystem as fs, Encoding } from '@capacitor/filesystem';
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

function convertEncoding(input?: FileEncoding): Encoding | undefined {
    if (!input) {
        return Encoding.UTF8;
    }

    if (input === FileEncoding.BASE64) {
        return undefined;
    }

    return input === FileEncoding.UTF8 ? Encoding.UTF8 : Encoding.ASCII;
}

const _fileSystem: IFileSystem = {

    readFile: async function (path: string, options?: ReadFileOptions): Promise<string> {
        options = options || {};
        const enc = convertEncoding(options.encoding);

        const out = await fs.readFile({ path, encoding: enc, directory: options.directory });
        return out.data;
    },

    writeFile: async function (path: string, data: string, options?: WriteFileOptions): Promise<void> {
        options = options || {};
        options.recursive = options.recursive || false;
        const enc = convertEncoding(options.encoding);

        await fs.writeFile({ path, data, encoding: enc, directory: options.directory });
    },

    appendFile: async function (path: string, data: string, options?: AppendFileOptions): Promise<void> {
        options = options || {};
        options.recursive = options.recursive || false;
        const enc = convertEncoding(options.encoding);

        await fs.appendFile({ path, data, encoding: enc, directory: options.directory });
    },

    deleteFile: async function (path: string, options?: DeleteFileOptions): Promise<void> {
        await fs.deleteFile({ path, directory: options?.directory });
    },

    mkdir: async function (path: string, options?: MakeDirOptions): Promise<void> {
        options = options || {};
        options.recursive = options.recursive || false;

        await fs.mkdir({ path, recursive: options.recursive, directory: options.directory });
    },

    rmdir: async function (path: string, options?: RemoveDirOptions): Promise<void> {
        options = options || {};
        options.recursive = options.recursive || false;

        await fs.rmdir({ path, recursive: options.recursive, directory: options.directory });
    }
}

export default _fileSystem;