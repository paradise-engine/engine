import { Dictionary } from "../util";
import { ResourceType } from "./resource-type";

export interface MimeType {
    name: string;
    extensions: string[];
    type: ResourceType;
}

const _allTypes: MimeType[] = [];
// a map of all mime types by their name
const _nameMimeTypeMap: Dictionary<MimeType> = {};
// a map of all mime types by their extensions
const _extMimeTypeMap: Dictionary<MimeType> = {};

function _createMimeType(name: string, extensions: string[], type: ResourceType) {
    const mimeType: MimeType = {
        name, extensions, type
    }

    _allTypes.push(mimeType);
    _nameMimeTypeMap[name] = mimeType;

    for (const ext of extensions) {
        _extMimeTypeMap[ext] = mimeType;
    }
}

function _createImageMimeType(name: string, extensions: string[]) {
    _createMimeType(name, extensions, ResourceType.Image);
}

function _createAudioMimeType(name: string, extensions: string[]) {
    _createMimeType(name, extensions, ResourceType.Audio);
}

function _createVideoMimeType(name: string, extensions: string[]) {
    _createMimeType(name, extensions, ResourceType.Video);
}

// Image Mime Types
_createImageMimeType('image/apng', ['.apng']);
_createImageMimeType('image/gif', ['.gif']);
_createImageMimeType('image/jpeg', ['.jpg', '.jpeg', '.jfif', '.pjpeg', '.pjp']);
_createImageMimeType('image/png', ['.png']);
_createImageMimeType('image/svg+xml', ['.svg']);
_createImageMimeType('image/webp', ['.webp']);
_createImageMimeType('image/bmp', ['.bmp']);
_createImageMimeType('image/x-icon', ['.ico', '.cur']);

// Audio Mime Types
_createAudioMimeType('audio/wav', ['.wav']);
_createAudioMimeType('audio/mpeg', ['.mp3']);
_createAudioMimeType('audio/aac', ['.aac']);
_createAudioMimeType('audio/webm', ['.weba']);

//Video Mime Types
_createVideoMimeType('video/mp4', ['.mp4']);
_createVideoMimeType('video/mpeg', ['.mpeg']);
_createVideoMimeType('video/webm', ['.webm']);

export const MimeTypes = _nameMimeTypeMap;
export const MimeTypeExtensions = _extMimeTypeMap;