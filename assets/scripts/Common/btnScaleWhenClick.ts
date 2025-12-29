import { _decorator, CCBoolean, CCFloat, Component, EventTouch, Node, Tween, tween, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('btnScaleWhenClick')
export class btnScaleWhenClick extends Component {
    @property(CCBoolean) autoListenEvent = true;
    @property(CCFloat) duration_to: number = 0.1;
    @property(CCFloat) duration_base: number = 0.1;
    @property(Vec3) scale_to: Vec3 = new Vec3();
    @property(Vec3) scale_base: Vec3 = new Vec3();
    @property(Node) nObjScale: Node;

    protected onEnable(): void {
        if (this.autoListenEvent) {
            this.RegisterEvent();
        }
    }

    protected onDisable(): void {
        if (this.autoListenEvent) {
            this.UnRegisterEvent();
        }
    }

    public RegisterEvent() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    public UnRegisterEvent() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    private ScaleObj() {
        Tween.stopAllByTarget(this.nObjScale);
        tween(this.nObjScale)
            .to(this.duration_to, { scale: this.scale_to })
            .start();
    }

    private ScaleObjBack() {
        Tween.stopAllByTarget(this.nObjScale);
        tween(this.nObjScale)
            .to(this.duration_base, { scale: this.scale_base })
            .start();
    }

    private isMoveOutNode: boolean = false;
    private onTouchStart() {
        this.isMoveOutNode = false;
        this.ScaleObj();
    }

    private onTouchCancel() {
        this.ScaleObjBack();
    }

    private onTouchEnd() {
        this.ScaleObjBack();
    }

    private onTouchMove(event: EventTouch) {
        if (this.isMoveOutNode) return;

        // check is move out of the UI
        let locTouch: Vec2 = null;
        locTouch = event.getLocation(locTouch);

        if (locTouch == null) {
            this.isMoveOutNode = true;
            this.ScaleObjBack();
            return;
        }

        const contentSizeN = this.node.getComponent(UITransform).contentSize.clone();
        const hWidth = contentSizeN.width / 2;
        const hHeight = contentSizeN.height / 2;

        if (locTouch.x < -hWidth || locTouch.x > hWidth || locTouch.y < -hHeight || locTouch.y > hHeight) {
            this.isMoveOutNode = true;
            this.ScaleObjBack();
        }
    }
}


