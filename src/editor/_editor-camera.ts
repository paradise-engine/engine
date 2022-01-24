import { SerializableCamera, SerializableGameObject, SerializableTransform } from "../core";

const camera_obj_transform: SerializableTransform = {
    id: "internal_camera_obj_transform",
    localPosition: {
        x: 0,
        y: 0,
        _ctor: "Vector"
    },
    localRotation: {
        degrees: 0,
        _ctor: "Rotation"
    },
    localScale: {
        x: 0,
        y: 0,
        _ctor: "Vector"
    },
    _ctor: "Transform"
}

const camera_comp: SerializableCamera = {
    _ctor: "Camera",
    isActive: true,
    id: "internal_camera_comp",
    backgroundColor: {
        _ctor: "Color",
        red: 0,
        green: 0,
        blue: 0,
        alpha: 0
    },
    size: 5,
    nearClipPane: -1,
    farClipPane: 1000,
    viewportRect: {
        _ctor: "Rect",
        x: 0,
        y: 0,
        width: 1,
        height: 1
    },
    depth: -1
}

export const editor_camera_obj: SerializableGameObject = {
    name: "internal_camera_obj",
    id: "internal_camera_obj",
    isActive: true,
    isSelected: false,
    transform: camera_obj_transform,
    components: [camera_obj_transform, camera_comp],
    children: [],
    _ctor: "GameObject"
}