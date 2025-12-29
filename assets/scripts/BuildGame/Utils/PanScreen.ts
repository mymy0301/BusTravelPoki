import { _decorator, Component, Camera, EventMouse, EventKeyboard, input, Input, Vec3, CCInteger, CCFloat, Node } from 'cc';
import { MouseZoom } from './MouseZoom';
const { ccclass, property } = _decorator;

@ccclass('PanScreen')
export class PanScreen extends Component {
    public static Instance: PanScreen = null;

    @property(Camera)
    public targetCamera: Camera | null = null; // Camera cần di chuyển

    @property(CCFloat)
    private speedMoveCamera: number = 0.01; // Tốc độ di chuyển


    private _isPanning: boolean = false; // Trạng thái kéo màn hình  
    public get IsPanning(): boolean { return this._isPanning; }
    private _lastMousePosition: Vec3 = new Vec3(); // Vị trí chuột lần cuối

    protected onLoad(): void {
        if (PanScreen.Instance == null) PanScreen.Instance = this;
    }

    start() {
        if (!this.targetCamera) {
            console.warn("Vui lòng gắn Camera vào script PanScreen.");
            return;
        }

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        PanScreen.Instance = null;

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.unRegisterMouse();
    }

    private registerMouse() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        this._isPanning = true;
    }

    private unRegisterMouse() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        this._isPanning = false;
    }

    onMouseDown(event: EventMouse) {
        if (event.getButton() === 0 && this._isPanning) { // Chuột trái và đang giữ Space
            this._lastMousePosition.set(event.getLocationX(), event.getLocationY(), 0);
        }
    }

    onMouseMove(event: EventMouse) {
        if (this._isPanning && event.getButton() === 0) { // Chỉ hoạt động khi đang kéo
            const currentMousePosition = new Vec3(event.getLocationX(), event.getLocationY(), 0);

            // Tính độ chênh lệch chuột
            const delta = this._lastMousePosition.subtract(currentMousePosition);

            // Cập nhật vị trí camera theo hướng ngược lại của delta
            const cameraNode = this.targetCamera!.node;
            const cameraPosition = cameraNode.position;
            const scaleCam = this.targetCamera.orthoHeight / 640;
            cameraNode.setPosition(cameraPosition.add3f(delta.x * this.speedMoveCamera * scaleCam, delta.y * this.speedMoveCamera * scaleCam, 0)); // Điều chỉnh tốc độ kéo (0.01)

            // Cập nhật vị trí chuột lần cuối
            this._lastMousePosition.set(currentMousePosition);

            // chặn click bubble
            event.propagationStopped = true;
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            // this._isPanning = false; // Dừng kéo màn hình khi thả chuột trái

            // chặn click bubble
            event.propagationStopped = true;
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === 32) { // Phím Space
            this.registerMouse();
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === 32) { // Phím Space
            this.unRegisterMouse();
        }
    }
}
