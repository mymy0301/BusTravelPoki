import { _decorator, Component, Camera, EventMouse, input, Input, Vec2, Vec3 } from 'cc';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

@ccclass('MouseZoom')
export class MouseZoom extends Component {
    public static Instance: MouseZoom = null;

    @property(Camera)
    public targetCamera: Camera | null = null; // Camera cần zoom

    @property
    public zoomSpeed: number = 1; // Tốc độ zoom

    @property
    public minOrthoHeight: number = 5; // Giới hạn zoom nhỏ nhất (gần nhất)

    @property
    public maxOrthoHeight: number = 640; // Giới hạn zoom lớn nhất (xa nhất)

    protected onLoad(): void {
        if (MouseZoom.Instance == null) {
            MouseZoom.Instance = this;
        }
    }

    onDestroy() {
        MouseZoom.Instance = null;
        // Dừng lắng nghe sự kiện khi script bị hủy
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    start() {
        if (!this.targetCamera) {
            console.warn("Vui lòng gắn Camera vào script MouseZoom2D.");
            return;
        }

        // Lắng nghe sự kiện lăn chuột
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    onMouseWheel(event: EventMouse) {
        if (!this.targetCamera) return;

        // Điều chỉnh orthoHeight dựa trên lăn chuột
        const currentOrthoHeight = this.targetCamera.orthoHeight;
        const newOrthoHeight = currentOrthoHeight - event.getScrollY() * this.zoomSpeed * 0.1;

        // Giới hạn orthoHeight trong khoảng minOrthoHeight và maxOrthoHeight
        this.targetCamera.orthoHeight = clamp(newOrthoHeight, this.minOrthoHeight, this.maxOrthoHeight);
    }

    //#region other function
    getScaleZoom() {
        return this.targetCamera.orthoHeight / this.maxOrthoHeight;
    }

    getPointInCamera(point: Vec2): Vec2 {
        let result: Vec3 = this.targetCamera.screenToWorld(new Vec3(point.x, point.y, 0));
        return Utils.ConvertVec3ToVec2(result);
    }
    //#endregion other function
}
