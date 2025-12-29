import { _decorator, Button, Component, Label, lerp, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * XIN HÃY LƯU Ý KHI SỬ DỤNG CLASS NÀY
 * NẾU NHƯ TRONG TRƯỜNG HỢP NODE TRONG LISTNODE THAY ĐỔI SCALE
 * THÌ BẮT BUỘC PHẢI GỌI LẠI CẬP NHẬT DỮ LIỆU
 */

@ccclass('BtnScaleSupport')
export class BtnScaleSupport extends Component {
    @property(Node) nBtn: Node;
    @property([Node]) listNode: Node[] = [];
    private _originScale: Vec3 = new Vec3();
    private _targetScale: Vec3 = new Vec3();
    private _zoomScale: number = 1;
    private _listOriginScale: Vec3[] = [];
    private _listTargetScale: Vec3[] = [];

    protected onLoad(): void {
        Vec3.copy(this._originScale, this.nBtn.getScale());
        this._zoomScale = this.nBtn.getComponent(Button).zoomScale;
        Vec3.multiplyScalar(this._targetScale, this._originScale, this._zoomScale);

        this.UpdateNodeScale();
    }

    protected onEnable(): void {
        this.nBtn.on(Node.EventType.TRANSFORM_CHANGED, this.onTransformSize, this);
    }

    protected onDisable(): void {
        this.nBtn.off(Node.EventType.TRANSFORM_CHANGED, this.onTransformSize, this);
    }

    private onTransformSize(): void {
        let ratio = (this.nBtn.getScale().x - this._originScale.x) / (this._targetScale.x - this._originScale.x);

        this.listNode.forEach((node, index) => {
            let targetScale = new Vec3();
            targetScale.x = lerp(this._listOriginScale[index].x, this._listTargetScale[index].x, ratio);
            targetScale.y = lerp(this._listOriginScale[index].y, this._listTargetScale[index].y, ratio);
            node.setScale(targetScale);
        })
    }

    /**
     * in case you update label or do something => you need to call update in here
     */
    public UpdateNodeScale() {
        this.listNode.forEach((node, index) => {
            this._listOriginScale[index] = Vec3.copy(new Vec3(), node.getScale());
            this._listTargetScale[index] = Vec3.multiplyScalar(new Vec3(), this._listOriginScale[index], this._zoomScale);
        });
    }
}


