import { _decorator, CCFloat, Component, Node, SpriteFrame, tween, Tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoopCircle')
export class LoopCircle extends Component {
    @property(CCFloat) timeShow = 1;
    @property(CCFloat) timeDelayEachLoop = 1;
    @property(CCFloat) scaleStart = 0.5;
    @property(CCFloat) scaleEnd = 2;

    protected onEnable(): void {
        this.show();
    }

    protected onDisable(): void {
        Tween.stopAllByTarget(this.node);
    }

    show() {
        const nFx = this.node;

        const opaCom = nFx.getComponent(UIOpacity);
        Tween.stopAllByTarget(nFx);
        tween(nFx)
            .call(() => {
                nFx.scale = Vec3.ONE.clone().multiplyScalar(this.scaleStart);
                opaCom.opacity = 255;
            })
            .parallel(
                tween().to(this.timeShow, { scale: Vec3.ONE.clone().multiplyScalar(this.scaleEnd) }).start(),
                tween().to(this.timeShow, {}, {
                    onUpdate: (target, ratio) => {
                        opaCom.opacity = 255 - ratio * 255;
                    }
                })
            )
            .call(() => { })
            .delay(this.timeDelayEachLoop)
            .union()
            .repeatForever()
            .start();
    }
}


