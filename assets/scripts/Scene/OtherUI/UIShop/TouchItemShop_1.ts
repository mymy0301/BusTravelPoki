import { _decorator, Component, Node, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TouchItemShop_1')
export class TouchItemShop_1 extends Component {
    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.ScaleBack, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.ScaleBack, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.ScaleBack, this)
    }

    private needScaleDown = false;
    private OnTouchStart() {
        Tween.stopAllByTarget(this.node);
        this.needScaleDown = true;
        tween(this.node)
            .to(0.2, { scale: new Vec3(1.05, 1.05, 1.05) })
            .start();
    }

    private ScaleBack() {
        if (this.needScaleDown) {
            Tween.stopAllByTarget(this.node);
            this.needScaleDown = false;
            tween(this.node)
                .to(0.2, { scale: Vec3.ONE })
                .start();
        }
    }
}


