import { Directory } from "@capacitor/filesystem";

export enum FileEncoding {
    UTF8 = 'utf8',
    ASCII = 'ascii',
    BASE64 = 'base64',
}

export interface ReadFileOptions {
    /**
     * The encoding to read the file in.
     * @default FileEncoding.UTF8
     */
    encoding?: FileEncoding;
    /**
     * __MOBILE ONLY__
     * The mobile platform `Directory` to read the file from.
     */
    directory?: Directory;
}

export interface WriteFileOptions {
    /**
     * The encoding to write the file in.
     * @default FileEncoding.UTF8
     */
    encoding?: FileEncoding;
    /**
     * __MOBILE ONLY__
     * The mobile platform `Directory` to store the file in.
     */
    directory?: Directory;
    /**
     * Whether to create any missing parent directories.
     */
    recursive?: boolean;
}

export interface AppendFileOptions extends WriteFileOptions { }

export interface DeleteFileOptions {
    /**
     * __MOBILE ONLY__
     * The mobile platform `Directory` to delete the file from.
     */
    directory?: Directory;
}

export interface MakeDirOptions {
    /**
     * __MOBILE ONLY__
     * The mobile platform `Directory` to make the new directory in.
     */
    directory?: Directory;
    /**
     * Whether to create any missing parent directories.
     */
    recursive?: boolean;
}

export interface RemoveDirOptions {
    /**
     * __MOBILE ONLY__
     * The mobile platform `Directory` to make the new directory in.
     */
    directory?: Directory;
    /**
     * Whether to perform a recursive directory removal.
     */
    recursive?: boolean;
}

export interface IFileSystem {
    /**
     * Asynchronously reads the entire contents of a file.
     * @param path The path of the file to read
     * @param options Options for the operation
     */
    readFile(path: string, options?: ReadFileOptions): Promise<string>;
    /**
     * Asynchronously writes data to a file, replacing the file if it already exists.
     * @param path The path of the file to write
     * @param data The data to write
     * @param options Options for the operation
     */
    writeFile(path: string, data: string, options?: WriteFileOptions): Promise<void>;
    /**
     * Asynchronously append data to a file, creating the file if it does not yet exist.
     * @param path The path of the file to append
     * @param data The data to write
     * @param options Options for the operation
     */
    appendFile(path: string, data: string, options?: AppendFileOptions): Promise<void>;
    /**
     * If `path` refers to a symbolic link, then the link is removed without affecting the 
     * file or directory to which that link refers. If the `path` refers to a file path that 
     * is not a symbolic link, the file is deleted.
     * @param path The path of the file to delete
     * @param options Options for the operation
     */
    deleteFile(path: string, options?: DeleteFileOptions): Promise<void>;
    /**
     * Asynchronously creates a directory.
     * Calling `mkdir` when `path` is a directory that exists results in a rejection only when `options.recursive` is false.
     * @param path The path of the directory to create
     * @param options Options for the operation
     */
    mkdir(path: string, options?: MakeDirOptions): Promise<void>;
    /**
     * Removes the directory identified by `path`.
     * @param path The path of the directory to remove
     * @param options Options for the operation
     */
    rmdir(path: string, options?: RemoveDirOptions): Promise<void>;
}