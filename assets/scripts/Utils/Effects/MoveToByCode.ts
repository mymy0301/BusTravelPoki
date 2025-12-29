import { _decorator, CCFloat, Component, Node, tween, UIOpacity, Vec3, Widget } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('MoveToByCode')
@requireComponent(UIOpacity)
export class MoveToByCode extends Component {
    @property(CCFloat) timeMove: number;
    @property(Vec3) posMoveTo: Vec3 = new Vec3();
    private posStart: Vec3;

    protected onLoad(): void {
        this.posStart = this.node.position.clone();
    }

    public MoveOut() {
        const mWidget = this.node.getComponent(Widget);
        if (mWidget != null) mWidget.enabled = false;
        const mOpacity = this.node.getComponent(UIOpacity);

        mOpacity.opacity = 255;
        return new Promise<void>(resolve => {
            tween(this.node)
                .to(this.timeMove, { position: this.posMoveTo }, {
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

    public SetToPosPrepare() {
        this.node.position = this.posStart;
        const mOpacity = this.node.getComponent(UIOpacity);
        if (mOpacity != null) {
            mOpacity.opacity = 0;
        }
    }
}


