import { SerializableGameObject, SerializableInternalMoveGizmo, SerializablePointerTarget, SerializableSpriteRenderer, SerializableTransform } from "../core";

function getGizmoComp(name: string, resourceKey: string, resourceUrl: string): SerializableGameObject {
    const transform: SerializableTransform = {
        id: name + "_obj_transform",
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
            x: 1,
            y: 1,
            _ctor: "Vector"
        },
        _ctor: "Transform"
    }

    const pointerTarget: SerializablePointerTarget = {
        _ctor: "PointerTarget",
        isActive: true,
        id: name + "_pointer_target"
    }

    const renderer: SerializableSpriteRenderer = {
        _ctor: "SpriteRenderer",
        isActive: true,
        id: name + "_sprite_renderer",
        sprite: {
            _ctor: "Sprite",
            resourceRef: {
                _ctor: "ResourceReference",
                url: resourceUrl,
                name: resourceKey
            }
        },
        color: {
            _ctor: "Color",
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0
        }
    }

    return {
        name: name,
        id: name,
        isActive: true,
        isSelected: false,
        transform: transform,
        components: [transform, pointerTarget, renderer],
        children: [],
        _ctor: "GameObject"
    }
}

const editor_gizmo_move_transform: SerializableTransform = {
    id: "internal_gizmo_move_obj_transform",
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
        x: 1,
        y: 1,
        _ctor: "Vector"
    },
    _ctor: "Transform"
}

const editor_gizmo_move_comp: SerializableInternalMoveGizmo = {
    _ctor: "InternalMoveGizmo",
    isActive: true,
    id: "internal_gizmo_move_comp",
    horizontal: 'internal_gizmo_comp_horizontal',
    vertical: 'internal_gizmo_comp_vertical',
    dual: 'internal_gizmo_comp_dual',
}

export const editor_gizmo_move: SerializableGameObject = {
    name: "internal_gizmo_move",
    id: "internal_gizmo_move",
    isActive: true,
    isSelected: false,
    transform: editor_gizmo_move_transform,
    components: [editor_gizmo_move_transform, editor_gizmo_move_comp],
    children: [
        getGizmoComp(
            'internal_gizmo_comp_horizontal',
            'paradise::reserved::editor_handle_horizontal',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAANCAYAAABfGcvGAAAACXBIWXMAAACNAAAAjQHGZvekAAABoklEQVRYhe2WQUsCQRTH38wb3VmpNI2KSs8hRNCtS4eOQR/GS9+gc9egD1DX9lAEJUKU0qFbRBAVtuawatFmyrq1EwpCRFm6Bor7gznt8Gffe/x4Q6SU4NEZK5MT2xHnPYcAx0nOD7NZ/dVtK72BuGAjFNQSzyakFQX2AqpdQCoA4PYBcV8TxkUnyaxXiutnFi2rfnwAENUZRtOKsrQWCZt5pKJdezxDXNA0pBV1e7SAWn1CWqwScvVE6VEre0g0Oj3X85X3KAnzZf23gXxGZ9gY0KmilPIMBZcy89UesjU8pMVr9sA1sxvEbRtGHKfjpMw39jBSs4FYVi/V2TdcuvzRet+nKFENzsfKiHZNSotthoLJAephV5mtVJYXXsptRZoM4VpVQfj9ooK0ZBOSOhPGQfO7t9RdsBoKavN/2CH3Kocc59UqYt4hcJPjfCeb1Y3v7nrP3n+gzBDuVRUefb7SK0PxRkjq/JMFrfAG0iWaFlhIi2+EXFEJ2kmheNduujcQFwjFD+XwaMMClDKTNoq7bjO9HeKCWGxm/Kdd0BEA8AGyTruUuAGTTAAAAABJRU5ErkJggg=='
        ),
        getGizmoComp(
            'internal_gizmo_comp_vertical',
            'paradise::reserved::editor_handle_vertical',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAABkCAYAAABdELruAAAACXBIWXMAAACNAAAAjQHGZvekAAABl0lEQVRYhe3YsU7CQBjA8a+lWCqgUUpbAlQ0MUTRQScWDEYNYZHV0YTB1Wdyc+VNfAInZweNd4XenWm11Lu22NHE+5ImDe2vXP9AB4Axltjsk3rPGph3aceCTYOUoTq9YAbspR0LJhUxjXVJlZpZSBVfcN1WmejUxPvYcMbWKBfCTXz50UEGOsTASmyYCylE6XuOF+6TbVrLhfwycaL9eW/uuG7LWomcU6vnOd7y6ugMAT7HNytRkNqzvfhdGwSYlkzPoSC1XyHcCcQijUwUpRZPwENsOBM+/RJFqUWERhiYwaePl8dgEKUWx2/ERTlE1qmTKgBgcbSo1admh0NhatvbyEJohEDx4ZpDpEzGP1MnltciwX11xeXtiqnFIVtxWTVMXcq+n2iC9NatOQlRmHoHFX9DQXoFK/2v5a1Inbi37/SaigvNzSc+3NvBO1CgUH2sgKrEH6X2UqiF33rxodFuN4/1qT6DB5jZV9Z92oMl8XvKMxJJJJFEEkkk0b9HEkkkkUQSSSTRH0epfwquvRYBnjMEAHwCeYy/m1q5elcAAAAASUVORK5CYII='
        ),
        getGizmoComp(
            'internal_gizmo_comp_dual',
            'paradise::reserved::editor_handle_both',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAC8AAAAvAHPHSQeAAAAa0lEQVRIie3XMQqAMBBE0VG2t9Ai4B28imfVg3gLIYUW6QPKJGBlJ6zNfNj6tTsNpmvFD1khuxzR592FP21EslBhovOxucDLAMKtC/aSYMGCBQsWLFiwYMGCv1eXBGcFP3yPaD1wslDOKwA3pPUS6UPMTu4AAAAASUVORK5CYII='
        )
    ],
    _ctor: "GameObject"
}