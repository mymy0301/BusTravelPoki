import { _decorator, CCFloat, Component, Node, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RotateForever')
export class RotateForever extends Component {
    @property(CCFloat) private speedRotate: number = 3;
    @property(Vec3) private eulerAngles: Vec3 = new Vec3(0, 0, -90);

    protected onEnable(): void {
        this.stopTween();
        tween(this.node)
            .by(this.speedRotate, { eulerAngles: this.eulerAngles }, {
                easing: 'linear', onComplete: () => {

                }
            }).repeatForever().start();
    }

    protected onDisable(): void {
        this.stopTween();
    }

    protected onDestroy(): void {
        this.stopTween();
    }

    private stopTween() {
        Tween.stopAllByTarget(this.node);
    }
}


