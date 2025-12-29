import { _decorator, CCFloat, Component, Node, tween, UIOpacity, Vec3, Widget } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('MoveToByCode_2')
@requireComponent(UIOpacity)
export class MoveToByCode_2 extends Component {
    @property(CCFloat) timeMove: number;
    @property(Vec3) vecDistance: Vec3 = new Vec3();
    private posStart: Vec3;

    protected start(): void {
        this.TryUpdatePosStart();
    }

    public TryUpdatePosStart() {
        if (this.posStart == null) {
            this.posStart = this.node.position.clone();
        }
    }

    public MoveOut() {
        if (this.posStart == null) { return; }
        const mWidget = this.node.getComponent(Widget);
        if (mWidget != null) mWidget.enabled = false;
        const mOpacity = this.node.getComponent(UIOpacity);

        const posMoveTo = this.posStart.clone().add(this.vecDistance);

        mOpacity.opacity = 255;
        return new Promise<void>(resolve => {
            tween(this.node)
                .to(this.timeMove, { position: posMoveTo }, {
                    onUpdate(target, ratio) {
                        mOpacity.opacity = 255 * (1 - ratio);
                    },
                })
                .call(() => {
                    resolve();
                })
                .start();
        })
    }


    public MoveIn() {
        if (this.posStart == null) { return; }

        const mWidget = this.node.getComponent(Widget);
        if (mWidget != null) mWidget.enabled = false;
        const mOpacity = this.node.getComponent(UIOpacity);

        mOpacity.opacity = 0;
        return new Promise<void>(resolve => {
            tween(this.node)
                .to(this.timeMove, { position: this.posStart }, {
                    onUpdate(target, ratio) {
                        mOpacity.opacity = 255 * ratio;
                    },
                })
                .call(() => {
                    resolve();
                })
                .start();
        })
    }

    public SetToPosPrepare_MoveIn() {
        // tru update posStart
        this.TryUpdatePosStart();

        this.node.position = this.posStart.clone().add(this.vecDistance);
        const mOpacity = this.node.getComponent(UIOpacity);
        if (mOpacity != null) {
            mOpacity.opacity = 0;
        }
    }

    public SetToPosPrepare_MoveOut() {
        this.node.position = this.posStart;
        const mOpacity = this.node.getComponent(UIOpacity);
        if (mOpacity != null) {
            mOpacity.opacity = 255;
        }
    }
}


